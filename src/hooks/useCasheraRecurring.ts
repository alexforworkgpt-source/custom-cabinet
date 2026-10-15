import { useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { subscriptionApi } from '../api/subscription';
import { usePlatform } from '../platform';
import { useToast } from '../components/Toast';
import { getApiErrorMessage } from '../utils/api-error';
import { openPaymentUrl } from '../utils/openPaymentUrl';

export function useCasheraRecurring(subscriptionId: number | undefined, enabled: boolean) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const { platform, openLink } = usePlatform();
  const { showToast } = useToast();
  const inFlight = useRef(false);
  const query = useQuery({
    queryKey: ['cashera-recurring', subscriptionId],
    queryFn: () => subscriptionApi.getCasheraRecurring(subscriptionId),
    enabled,
    retry: false,
    refetchInterval: (query) => (query.state.data?.status === 'PENDING' ? 8000 : false),
  });
  const refresh = () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ['cashera-recurring', subscriptionId] }),
      client.invalidateQueries({ queryKey: ['subscription'] }),
      client.invalidateQueries({ queryKey: ['purchase-options'] }),
      client.invalidateQueries({ queryKey: ['subscriptions-list'] }),
      client.invalidateQueries({ queryKey: ['sbp-recurring', subscriptionId] }),
      client.invalidateQueries({ queryKey: ['lava-recurring', subscriptionId] }),
    ]);
  const onError = (error: unknown, key: string) =>
    showToast({
      type: 'error',
      title: getApiErrorMessage(error, t(key)),
      message: '',
      duration: 3000,
    });
  const enable = useMutation({
    mutationFn: () => subscriptionApi.enableCasheraRecurring(subscriptionId),
    onSuccess: async (data) => {
      if (data.redirect_url) openPaymentUrl(data.redirect_url, platform, openLink);
      await refresh();
    },
    onError: (error) => onError(error, 'subscription.casheraRecurring.enableError'),
    onSettled: () => {
      inFlight.current = false;
    },
  });
  const cancel = useMutation({
    mutationFn: () => subscriptionApi.cancelCasheraRecurring(subscriptionId),
    onSuccess: async () => {
      await refresh();
      showToast({
        type: 'success',
        title: t('subscription.casheraRecurring.cancelled'),
        message: '',
        duration: 3000,
      });
    },
    onError: (error) => onError(error, 'subscription.casheraRecurring.cancelError'),
    onSettled: () => {
      inFlight.current = false;
    },
  });
  const execute = (action: 'enable' | 'cancel') => {
    if (inFlight.current) return;
    inFlight.current = true;
    if (action === 'enable') enable.mutate();
    else cancel.mutate();
  };
  return {
    query,
    busy: enable.isPending || cancel.isPending,
    enable: () => execute('enable'),
    cancel: () => execute('cancel'),
  };
}
