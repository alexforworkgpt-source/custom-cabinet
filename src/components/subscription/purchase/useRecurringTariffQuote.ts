import { useRef, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { subscriptionApi } from '../../../api/subscription';
import { useAuthStore } from '../../../store/auth';

const providers = ['platega', 'lava', 'cashera'] as const;
type Provider = (typeof providers)[number];
interface Attempt {
  consent: { selected_device_limit: number; quote_id: string; checkout_id: string };
  amount: number;
  days: number;
}

export function useRecurringTariffQuote({
  enabled,
  ready,
  available,
  tariffId,
  subscriptionId,
  limit,
}: {
  enabled: boolean;
  ready: boolean;
  available: Record<Provider, boolean>;
  tariffId: number;
  subscriptionId?: number;
  limit?: number;
}) {
  const userId = useAuthStore((state) => state.user?.id);
  const key = JSON.stringify([userId, tariffId, subscriptionId, limit]);
  const attempts = useRef<Partial<Record<Provider, Attempt>>>({});
  const [uncertain, setUncertain] = useState<Partial<Record<Provider, string>>>({});
  const quotes = useQueries({
    queries: providers.map((provider) => ({
      queryKey: ['tariff-recurring-quote', provider, key],
      queryFn: () =>
        subscriptionApi.previewRecurrentPurchase(provider, tariffId, subscriptionId, limit),
      enabled: enabled && ready && available[provider],
      retry: false,
      staleTime: 0,
      gcTime: 0,
    })),
  });

  const current = (provider: Provider) => {
    const query = quotes[providers.indexOf(provider)];
    const previous = uncertain[provider] === key ? attempts.current[provider] : undefined;
    return {
      query,
      previous,
      blocked: enabled && !previous && (!ready || query.isFetching || query.isError || !query.data),
      amount: previous?.amount ?? query.data?.amount_kopeks,
      days: previous?.days ?? query.data?.charge_days,
    };
  };

  const purchase = async (provider: Provider, unavailable: string, expired: string) => {
    const send = {
      platega: subscriptionApi.purchaseWithSbpRecurring,
      lava: subscriptionApi.purchaseWithLavaRecurring,
      cashera: subscriptionApi.purchaseWithCasheraRecurring,
    }[provider];
    if (!enabled)
      return subscriptionId === undefined ? send(tariffId) : send(tariffId, subscriptionId);
    const { query, previous, blocked } = current(provider);
    if (blocked) throw new Error(unavailable);
    let attempt = previous;
    if (!attempt) {
      const quote = query.data;
      if (!quote || !(Date.parse(quote.expires_at) > Date.now())) {
        void query.refetch();
        throw new Error(expired);
      }
      attempt = {
        consent: {
          selected_device_limit: quote.selected_device_limit,
          quote_id: quote.quote_id,
          checkout_id: quote.checkout_id ?? crypto.randomUUID(),
        },
        amount: quote.amount_kopeks,
        days: quote.charge_days,
      };
      attempts.current[provider] = attempt;
    }
    try {
      const result = await send(tariffId, subscriptionId, attempt.consent);
      delete attempts.current[provider];
      setUncertain((state) => ({ ...state, [provider]: undefined }));
      return result;
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === undefined || status >= 500)
        setUncertain((state) => ({ ...state, [provider]: key }));
      else {
        delete attempts.current[provider];
        setUncertain((state) => ({ ...state, [provider]: undefined }));
        void query.refetch();
      }
      throw error;
    }
  };

  return { current, purchase };
}
