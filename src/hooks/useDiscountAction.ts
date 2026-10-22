import { useEffect, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { promoApi } from '../api/promo';
import { subscriptionApi } from '../api/subscription';
import { useAuthStore } from '../store/auth';
import { getApiErrorMessage } from '../utils/api-error';
import {
  resolveDiscountAction,
  type DiscountAction,
  type DiscountNavigationContext,
} from '../utils/discountAction';
import { isCurrentDiscount } from '../utils/promoExpiry';

class DiscountActionError extends Error {
  constructor(readonly labelKey: string) {
    super(labelKey);
  }
}

/** A banner opens an eligible existing flow only; every request here is a GET. */
export function useDiscountAction(context: DiscountNavigationContext, enabled: boolean) {
  const client = useQueryClient();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const userId = useAuthStore((state) => state.user?.id);
  const live = useRef(context);
  live.current = context;
  const mounted = useRef(true);
  const inFlight = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  // biome-ignore lint/correctness/useExhaustiveDependencies: A new account must not inherit the prior account's navigation error.
  useEffect(() => {
    setError(null);
  }, [userId]);
  const initial = resolveDiscountAction(context);
  const modeId = initial.kind === 'needs-mode' ? initial.subscriptionId : undefined;
  const mode = useQuery({
    queryKey: ['purchase-options', modeId],
    queryFn: () => subscriptionApi.getPurchaseOptions(modeId),
    enabled: enabled && userId !== undefined && modeId !== undefined,
    staleTime: 0,
    refetchOnMount: 'always',
    retry: false,
  });
  let action: DiscountAction = initial;
  if (initial.kind === 'needs-mode') {
    action = mode.isError
      ? { kind: 'retry' }
      : !mode.isSuccess || mode.isFetching
        ? { kind: 'loading', subscriptionId: modeId }
        : mode.data.sales_mode
          ? resolveDiscountAction(context, mode.data.sales_mode)
          : { kind: 'retry' };
  }
  if (userId === undefined) action = { kind: 'loading' };
  const openDiscount = async () => {
    if (!enabled || userId === undefined || inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError(null);
    const selected = live.current.selectedSubscriptionId;
    const owner = userId;
    const assertCurrent = () => {
      if (
        !mounted.current ||
        useAuthStore.getState().user?.id !== owner ||
        live.current.selectedSubscriptionId !== selected
      )
        throw new DiscountActionError('promo.navigation.changed');
    };
    try {
      assertCurrent();
      const [discount, list] = await Promise.all([
        client.fetchQuery({
          queryKey: ['active-discount'],
          queryFn: promoApi.getActiveDiscount,
          staleTime: 0,
          retry: false,
        }),
        client.fetchQuery({
          queryKey: ['subscriptions-list'],
          queryFn: subscriptionApi.getSubscriptions,
          staleTime: 0,
          retry: false,
        }),
      ]);
      assertCurrent();
      if (!isCurrentDiscount(discount)) throw new DiscountActionError('promo.navigation.expired');
      if (!Array.isArray(list.subscriptions))
        throw new DiscountActionError('promo.navigation.unavailable');
      const fresh: DiscountNavigationContext = {
        subscriptions: list.subscriptions,
        selectedSubscriptionId: selected,
        subscription: null,
      };
      let destination = resolveDiscountAction(fresh);
      if (destination.kind === 'loading' && destination.subscriptionId !== undefined) {
        const id = destination.subscriptionId;
        const full = await client.fetchQuery({
          queryKey: ['subscription', id],
          queryFn: () => subscriptionApi.getSubscription(id),
          staleTime: 0,
          retry: false,
        });
        assertCurrent();
        if (!full.has_subscription || full.subscription?.id !== id)
          throw new DiscountActionError('promo.navigation.changed');
        fresh.subscription = full.subscription;
        destination = resolveDiscountAction(fresh);
        if (destination.kind === 'needs-mode') {
          const options = await client.fetchQuery({
            queryKey: ['purchase-options', id],
            queryFn: () => subscriptionApi.getPurchaseOptions(id),
            staleTime: 0,
            retry: false,
          });
          assertCurrent();
          if (!options.sales_mode) throw new DiscountActionError('promo.navigation.unavailable');
          destination = resolveDiscountAction(fresh, options.sales_mode);
        }
      }
      assertCurrent();
      if (!isCurrentDiscount(discount)) throw new DiscountActionError('promo.navigation.expired');
      if (!('path' in destination)) throw new DiscountActionError('promo.navigation.unavailable');
      navigate(destination.path);
    } catch (failure) {
      if (mounted.current && useAuthStore.getState().user?.id === owner) {
        setError(
          failure instanceof DiscountActionError
            ? t(failure.labelKey)
            : getApiErrorMessage(failure, t('promo.navigation.unavailable')),
        );
      }
    } finally {
      inFlight.current = false;
      if (mounted.current) setPending(false);
    }
  };
  return { action, openDiscount, pending, error, clearError: () => setError(null) };
}
