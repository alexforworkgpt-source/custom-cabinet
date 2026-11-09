import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { subscriptionApi } from '../../../api/subscription';
import { useAuthStore } from '../../../store/auth';

interface Selection {
  tariff_id: number;
  period_days: number;
  traffic_gb?: number;
  subscription_id?: number;
}

interface Attempt {
  scope: string;
  id: string;
  amount: number;
  devices?: { selected_device_limit: number; quote_id: string };
}

export function useTariffDeviceQuote(enabled: boolean, selection: Selection, daily: boolean) {
  const userId = useAuthStore((state) => state.user?.id);
  const owner = JSON.stringify([userId, selection.tariff_id, selection.subscription_id]);
  const [choice, setChoice] = useState<{ owner: string; devices: number }>();
  const [invalidOwner, setInvalidOwner] = useState<string>();
  const selected = choice?.owner === owner ? choice.devices : undefined;
  const scope = JSON.stringify([owner, selection.period_days, selection.traffic_gb, selected]);
  const attempt = useRef<Attempt | undefined>(undefined);
  const [uncertainScope, setUncertainScope] = useState<string>();
  const query = useQuery({
    queryKey: ['tariff-device-quote', owner, selection.period_days, selection.traffic_gb, selected],
    queryFn: () =>
      subscriptionApi.previewTariffPurchase({
        ...selection,
        selected_device_limit: selected,
      }),
    enabled,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[1] === owner ? previous : undefined,
  });
  const quote = enabled ? query.data : undefined;
  const policy = quote?.device_selection;
  useEffect(() => {
    if (selected === undefined && policy?.selectable && !query.isPlaceholderData) {
      setChoice({ owner, devices: policy.effective_limit });
    }
  }, [owner, policy, query.isPlaceholderData, selected]);
  const uncertain = uncertainScope === scope && attempt.current?.scope === scope;
  const awaitingQuote =
    enabled &&
    (!quote ||
      query.isFetching ||
      query.isError ||
      query.isPlaceholderData ||
      (policy?.selectable && selected === undefined));
  // Bot v5.2.0 only persists daily checkout identity for a device-bound purchase.
  const uncertainDailyWithoutDevices = uncertain && daily && !attempt.current?.devices;
  const blocked =
    enabled &&
    (invalidOwner === owner || uncertainDailyWithoutDevices || (!uncertain && awaitingQuote));
  const purchase = async (unavailable: string, changed: string) => {
    const args = [
      selection.tariff_id,
      selection.period_days,
      selection.traffic_gb,
      selection.subscription_id,
    ] as const;
    if (!enabled) return subscriptionApi.purchaseTariff(...args);
    if (blocked) throw new Error(unavailable);
    let current = uncertain ? attempt.current : undefined;
    if (!current) {
      if (!quote) throw new Error(unavailable);
      if (!(Date.parse(quote.expires_at) > Date.now())) {
        void query.refetch();
        throw new Error(changed);
      }
      current = {
        scope,
        id: crypto.randomUUID(),
        amount: quote.total_kopeks,
        devices:
          selected !== undefined && policy?.selectable
            ? { selected_device_limit: selected, quote_id: quote.quote_id }
            : undefined,
      };
      attempt.current = current;
    }
    try {
      const result = await subscriptionApi.purchaseTariff(...args, current.id, current.devices);
      attempt.current = undefined;
      setUncertainScope(undefined);
      return result;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === undefined || status >= 500) setUncertainScope(scope);
      else {
        attempt.current = undefined;
        setUncertainScope(undefined);
        void query.refetch();
      }
      throw error;
    }
  };

  return {
    quote,
    amount: uncertain ? attempt.current?.amount : quote?.total_kopeks,
    policy,
    selected,
    blocked,
    uncertain,
    awaitingQuote,
    quoteError: query.isError,
    retryQuote: query.refetch,
    choose: (devices: number) => setChoice({ owner, devices }),
    validate: (valid: boolean) => setInvalidOwner(valid ? undefined : owner),
    purchase,
  };
}
