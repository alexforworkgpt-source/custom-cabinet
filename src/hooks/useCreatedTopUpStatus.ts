import { useEffect, useMemo, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { balanceApi } from '@/api/balance';
import { useAuthStore } from '@/store/auth';
import { useSuccessNotification } from '@/store/successNotification';
import { isFailedStatus, isPaidStatus } from '@/utils/paymentStatus';
import { clearTopUpPendingInfo } from '@/utils/topUpStorage';

/** Observe only the payment created on this screen; leaving does not cancel it. */
export function useCreatedTopUpStatus(methodId: string | undefined, paymentId?: string) {
  const queryClient = useQueryClient();
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const showSuccess = useSuccessNotification((state) => state.show);
  const handledPayment = useRef<string | null>(null);
  const startedAt = useMemo(() => ({ paymentId, time: Date.now() }), [paymentId]);
  const numericId = paymentId && /^\d+$/.test(paymentId) ? Number(paymentId) : NaN;

  const { data } = useQuery({
    queryKey: ['topup-status', methodId, numericId],
    queryFn: () => {
      if (!methodId) throw new Error('Payment method is required');
      return balanceApi.getPendingPayment(methodId, numericId);
    },
    enabled: Boolean(methodId && Number.isSafeInteger(numericId) && numericId > 0),
    refetchOnWindowFocus: 'always',
    refetchInterval: (query) => {
      const payment = query.state.data;
      if (
        Date.now() - startedAt.time >= 10 * 60 * 1000 ||
        payment?.is_paid ||
        (payment && (isPaidStatus(payment.status) || isFailedStatus(payment.status)))
      ) {
        return false;
      }
      return 3_000;
    },
    retry: 2,
  });

  useEffect(() => {
    if (!paymentId || !data || handledPayment.current === paymentId) return;
    if (!data.is_paid && !isPaidStatus(data.status)) return;
    handledPayment.current = paymentId;
    clearTopUpPendingInfo();
    queryClient.invalidateQueries({ queryKey: ['balance'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['purchase-options'] });
    queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
    queryClient.invalidateQueries({ queryKey: ['subscription'] });
    refreshUser();
    showSuccess({ type: 'balance_topup', amountKopeks: data.amount_kopeks });
  }, [data, paymentId, queryClient, refreshUser, showSuccess]);
}
