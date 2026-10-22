import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { subscriptionApi } from '@/api/subscription';
import { balanceApi } from '@/api/balance';
import { useAuthStore } from '@/store/auth';
import { deviceSignature, readDeviceIntent, saveDeviceIntent } from '@/utils/deviceIntent';
import type { Subscription } from '@/types';

interface Input {
  open: boolean;
  subscription: Subscription;
  subscriptionId?: number;
  devicesToAdd: number;
  onDevicesToAddChange: (count: number) => void;
  onClose: () => void;
}
function supportedQuote(
  price: Awaited<ReturnType<typeof subscriptionApi.getDevicePrice>> | undefined,
  sub: Subscription,
  count: number,
): boolean {
  const total = price?.total_price_kopeks;
  return (
    price?.available === true &&
    Number.isInteger(total) &&
    total !== undefined &&
    total >= 0 &&
    (total > 0 || price.discount_percent === 100) &&
    Number.isInteger(count) &&
    count > 0 &&
    count <= 100 &&
    !sub.is_trial &&
    (sub.is_active || sub.is_limited) &&
    sub.device_limit > 0 &&
    (price.current_device_limit === undefined || price.current_device_limit === sub.device_limit) &&
    (!price.max_device_limit || sub.device_limit + count <= price.max_device_limit)
  );
}
export function useDevicePurchase(input: Input) {
  const { open, subscription, devicesToAdd, onDevicesToAddChange, onClose } = input;
  const id = input.subscriptionId ?? subscription.id;
  const userId = useAuthStore((state) => state.user?.id);
  const owner = useRef(userId);
  const mounted = useRef(true);
  const liveInput = useRef(input);
  liveInput.current = input;
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const client = useQueryClient();
  const restored = useRef(false);
  const inFlight = useRef(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [needsSelection, setNeedsSelection] = useState(false);
  const [checking, setChecking] = useState(false);
  const [blockedCart, setBlockedCart] = useState(false);
  const subscriptionQuery = useQuery({
    queryKey: ['subscription', id],
    queryFn: () => subscriptionApi.getSubscription(id),
    enabled: open,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: false,
  });
  const balanceQuery = useQuery({
    queryKey: ['balance'],
    queryFn: balanceApi.getBalance,
    enabled: open,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: false,
  });
  const currentSubscription = subscriptionQuery.data?.subscription ?? subscription;
  const priceQuery = useQuery({
    queryKey: ['device-price', devicesToAdd, id],
    queryFn: () => subscriptionApi.getDevicePrice(devicesToAdd, id),
    enabled: open,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: false,
  });
  useEffect(() => {
    if (
      !open ||
      restored.current ||
      !userId ||
      !subscriptionQuery.isSuccess ||
      subscriptionQuery.isFetching
    )
      return;
    restored.current = true;
    const intent = readDeviceIntent(userId, id);
    if (!intent) return;
    if (intent.blockedCart) {
      setBlockedCart(true);
      setNotice('subscription.devicePayment.cartSaved');
      return;
    }
    if (
      intent.targetLimit <= currentSubscription.device_limit ||
      intent.signature !== deviceSignature(currentSubscription)
    ) {
      saveDeviceIntent(userId, id, null);
      setNotice(
        intent.targetLimit <= currentSubscription.device_limit
          ? 'subscription.devicePayment.alreadyApplied'
          : 'subscription.devicePayment.changed',
      );
      setNeedsSelection(true);
    } else onDevicesToAddChange(intent.targetLimit - currentSubscription.device_limit);
  }, [
    open,
    userId,
    id,
    currentSubscription,
    subscriptionQuery.isSuccess,
    subscriptionQuery.isFetching,
    onDevicesToAddChange,
  ]);

  const purchaseMutation = useMutation({
    retry: false,
    mutationFn: () => subscriptionApi.purchaseDevices(devicesToAdd, id),
    onSuccess: () => {
      if (useAuthStore.getState().user?.id !== userId) return;
      if (userId) saveDeviceIntent(userId, id, null);
      for (const key of [
        'subscription',
        'subscriptions-list',
        'devices',
        'device-price',
        'balance',
        'purchase-options',
        'renewal-options',
      ]) {
        void client.invalidateQueries({ queryKey: [key] });
      }
      onClose();
      onDevicesToAddChange(1);
    },
    onError: (error: unknown) => {
      if (useAuthStore.getState().user?.id !== userId) return;
      const detail = (
        error as { response?: { status?: number; data?: { detail?: { cart_saved?: boolean } } } }
      )?.response;
      if (detail?.status === 402 && detail.data?.detail?.cart_saved === true) {
        setBlockedCart(true);
        setNotice('subscription.devicePayment.cartSaved');
        if (userId)
          saveDeviceIntent(userId, id, {
            targetLimit: currentSubscription.device_limit + devicesToAdd,
            signature: deviceSignature(currentSubscription),
            blockedCart: true,
          });
      } else {
        setNeedsSelection(true);
        setNotice('subscription.devicePayment.unknownResult');
      }
      for (const key of ['subscription', 'balance', 'device-price'])
        void client.invalidateQueries({ queryKey: [key] });
    },
    onSettled: () => {
      inFlight.current = false;
    },
  });
  const queries = [priceQuery, subscriptionQuery, balanceQuery];
  const ready =
    queries.every((query) => query.isSuccess && !query.isFetching) &&
    subscriptionQuery.data?.subscription?.id === id &&
    owner.current === userId;
  const supported =
    !blockedCart && supportedQuote(priceQuery.data, currentSubscription, devicesToAdd);
  const buy = async () => {
    if (inFlight.current || needsSelection || !ready || !supported) return;
    inFlight.current = true;
    setChecking(true);
    const oldPrice = priceQuery.data?.total_price_kopeks;
    const signature = deviceSignature(currentSubscription);
    try {
      const [subResult, priceResult, balanceResult] = await Promise.all([
        subscriptionQuery.refetch(),
        priceQuery.refetch(),
        balanceQuery.refetch(),
      ]);
      const sub = subResult.data?.subscription;
      const price = priceResult.data;
      if (
        !mounted.current ||
        !liveInput.current.open ||
        liveInput.current.devicesToAdd !== devicesToAdd
      )
        return;
      if (useAuthStore.getState().user?.id !== userId) {
        setNotice('subscription.devicePayment.changed');
        setNeedsSelection(true);
        return;
      }
      if (
        subResult.isError ||
        priceResult.isError ||
        balanceResult.isError ||
        !sub ||
        sub.id !== id
      ) {
        setNotice('subscription.devicePayment.loadError');
        return;
      }
      if (deviceSignature(sub) !== signature) {
        setNotice('subscription.devicePayment.changed');
        setNeedsSelection(true);
        if (userId) saveDeviceIntent(userId, id, null);
        return;
      }
      if (
        !supportedQuote(price, sub, devicesToAdd) ||
        price?.total_price_kopeks !== oldPrice ||
        !price ||
        price.total_price_kopeks === undefined ||
        price.total_price_kopeks > (balanceResult.data?.balance_kopeks ?? -1)
      ) {
        setNotice('subscription.devicePayment.changed');
        return;
      }
      if (userId)
        saveDeviceIntent(userId, id, {
          targetLimit: sub.device_limit + devicesToAdd,
          signature: deviceSignature(sub),
        });
      await purchaseMutation.mutateAsync();
    } catch {
      // Mutation owns the visible API error; a retry must still re-read the server.
      void subscriptionQuery.refetch();
    } finally {
      inFlight.current = false;
      setChecking(false);
    }
  };
  const prepareFunding = async () => {
    if (userId)
      saveDeviceIntent(userId, id, {
        targetLimit: currentSubscription.device_limit + devicesToAdd,
        signature: deviceSignature(currentSubscription),
      });
  };
  const selectDevices = (count: number) => {
    if (blockedCart) return;
    setNeedsSelection(false);
    setNotice(null);
    onDevicesToAddChange(count);
  };
  return {
    priceQuery,
    purchaseMutation,
    buy,
    prepareFunding,
    notice,
    needsSelection,
    selectDevices,
    currentSubscription,
    balance: balanceQuery.data?.balance_kopeks,
    ready,
    checking,
    supported,
    failedQuery: queries.find((query) => query.isError),
  };
}
