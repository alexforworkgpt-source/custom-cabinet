import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { subscriptionApi } from '../api/subscription';
import { needsTariff, tariffSelectionPath } from '../utils/legacySubscription';
import {
  getErrorMessage,
  getInsufficientBalanceError,
  getSavedCartTopUpPath,
} from '../utils/subscriptionHelpers';
import { formatDateOrRaw } from '../utils/format';
import { useHaptic } from '../platform';
import { useAuthStore } from '../store/auth';
import { useRenewalSelection } from '../hooks/useRenewalSelection';
import InsufficientBalancePrompt from '../components/InsufficientBalancePrompt';
import { WebBackButton } from '../components/WebBackButton';
import { Card } from '../components/data-display';
import { Button } from '../components/primitives';
import { PageSkeleton, Skeleton } from '../components/ui/skeleton';
import { RenewalOptions } from '../components/subscription/renewal/RenewalOptions';
import { RenewalSummary } from '../components/subscription/renewal/RenewalSummary';

export default function RenewSubscription() {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const subId = subscriptionId ? Number(subscriptionId) : undefined;
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { impact } = useHaptic();
  const userId = useAuthStore((state) => state.user?.id);
  const [error, setError] = useState<string | null>(null);
  const renewalInFlightRef = useRef(false);

  const subscriptionQuery = useQuery({
    queryKey: ['subscription', subId],
    queryFn: () => subscriptionApi.getSubscription(subId),
    enabled: !!subId,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const subscription = subscriptionQuery.data?.subscription ?? null;
  const optionsQuery = useQuery({
    queryKey: ['renewal-options', subId],
    queryFn: () => subscriptionApi.getRenewalOptions(subId),
    enabled: !!subId,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const purchaseQuery = useQuery({
    queryKey: ['purchase-options', subId],
    queryFn: () => subscriptionApi.getPurchaseOptions(subId),
    enabled: !!subId,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const queries = [subscriptionQuery, optionsQuery, purchaseQuery];
  const ready = queries.every((query) => query.isSuccess && !query.isFetching);
  const isClassic = purchaseQuery.data?.sales_mode === 'classic';
  const balanceKopeks = purchaseQuery.data?.balance_kopeks;
  const { selectedPeriod, selectPeriod, clearSelection, selectionReset } = useRenewalSelection(
    userId,
    subId,
    subscription,
    purchaseQuery.data?.sales_mode,
    optionsQuery.data,
    ready,
  );
  const selectedOption = optionsQuery.data?.find((option) => option.period_days === selectedPeriod);
  const missingKopeks =
    selectedOption && balanceKopeks !== undefined
      ? Math.max(0, selectedOption.price_kopeks - balanceKopeks)
      : 0;

  const renewMutation = useMutation({
    mutationFn: (periodDays: number) => subscriptionApi.renewSubscription(periodDays, subId),
    onSuccess: () => {
      clearSelection();
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
      queryClient.invalidateQueries({ queryKey: ['renewal-options', subId] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-options', subId] });
      navigate(`/subscriptions/${subId}`, { replace: true });
    },
    onError: (err: unknown) => {
      if (isClassic) {
        const insufficient = getInsufficientBalanceError(err);
        const detail =
          err && typeof err === 'object' && 'response' in err
            ? (err as { response?: { data?: { detail?: { code?: string } } } }).response?.data
                ?.detail
            : null;
        const topUpPath =
          detail?.code === 'insufficient_funds' && insufficient?.cartMode === 'extend'
            ? getSavedCartTopUpPath(err, missingKopeks, `${location.pathname}${location.search}`)
            : null;
        if (topUpPath) navigate(topUpPath);
        else setError(getErrorMessage(err));
        return;
      }
      const detail =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { detail?: unknown } } }).response?.data?.detail ?? null)
          : null;
      if (detail && typeof detail === 'object' && 'code' in detail) {
        const typed = detail as { code: string; missing_amount?: number };
        if (typed.code === 'insufficient_funds' && typed.missing_amount) {
          setError(`insufficient:${typed.missing_amount}`);
          return;
        }
      }
      setError(getErrorMessage(err));
    },
    onSettled: () => {
      renewalInFlightRef.current = false;
    },
  });
  const handleRenew = () => {
    if (
      renewalInFlightRef.current ||
      !ready ||
      !subscription ||
      !selectedOption ||
      balanceKopeks === undefined
    )
      return;
    renewalInFlightRef.current = true;
    impact('medium');
    setError(null);
    renewMutation.mutate(selectedOption.period_days);
  };

  if (!subId || !Number.isInteger(subId) || subId < 1)
    return <Navigate to="/subscriptions" replace />;
  if (subscriptionQuery.isSuccess && !subscriptionQuery.isFetching && needsTariff(subscription)) {
    return <Navigate to={tariffSelectionPath(subId)} replace />;
  }
  if (queries.some((query) => query.isLoading)) {
    return (
      <PageSkeleton leading={1} titleWidth="w-56" className="space-y-5">
        <Skeleton variant="card" className="h-16" />
        <div className="grid grid-cols-2 gap-3">
          <Skeleton variant="card" count={4} className="h-28" />
        </div>
      </PageSkeleton>
    );
  }
  const failedQuery = subscriptionQuery.isError
    ? subscriptionQuery
    : purchaseQuery.isError
      ? purchaseQuery
      : optionsQuery.isError
        ? optionsQuery
        : null;
  const loadErrorKey = subscriptionQuery.isError
    ? 'subscription.renewSubscriptionLoadError'
    : purchaseQuery.isError
      ? 'subscription.paymentOptionsLoadError'
      : 'subscription.renewOptionsLoadError';
  const missingAmount = error?.match(/^insufficient:(\d+)$/)?.[1];
  const endDate = formatDateOrRaw(subscription?.end_date, i18n?.language ?? 'ru', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <WebBackButton to={`/subscriptions/${subId}`} />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-dark-100">{t('subscription.extend')}</h1>
          {subscription?.tariff_name && (
            <p className="mt-1 text-sm text-dark-400">{subscription.tariff_name}</p>
          )}
        </div>
      </div>
      {failedQuery ? (
        <Card>
          <div role="alert" className="space-y-3 text-sm text-error-400">
            <p>{t(loadErrorKey)}</p>
            <Button
              variant="secondary"
              size="lg"
              disabled={failedQuery.isFetching}
              onClick={() => failedQuery.refetch()}
            >
              {t('common.retry')}
            </Button>
          </div>
        </Card>
      ) : !subscription ? (
        <Card>
          <p className="text-sm text-dark-400">{t('subscription.noSubscription')}</p>
        </Card>
      ) : balanceKopeks === undefined || !purchaseQuery.data?.sales_mode ? (
        <Card>
          <p role="alert">{t('subscription.paymentOptionsLoadError')}</p>
          <Button size="lg" onClick={() => purchaseQuery.refetch()}>
            {t('common.retry')}
          </Button>
        </Card>
      ) : (
        <>
          <Card size="sm" className="space-y-1 text-sm text-dark-400">
            {endDate && (
              <p className="font-medium text-dark-100">
                {t('subscription.renewCurrentEnd', { date: endDate })}
              </p>
            )}
            {isClassic && <p>{t('subscription.classicRenewHint')}</p>}
            <p>
              {t('subscription.traffic')}:{' '}
              {subscription.traffic_limit_gb || t('subscription.unlimited')}
              {subscription.traffic_limit_gb > 0 && ` ${t('common.units.gb')}`}
              {' · '}
              {t('subscription.devices')}:{' '}
              {subscription.device_limit || t('subscription.unlimited')}
            </p>
            {subscription.servers.length > 0 && (
              <p>
                {t('subscription.serversLabel')}:{' '}
                {subscription.servers.map((server) => server.name).join(', ')}
              </p>
            )}
          </Card>
          {selectionReset && (
            <p role="status" className="text-sm text-dark-400">
              {t('subscription.renewSelectionReset')}
            </p>
          )}
          <RenewalOptions
            options={optionsQuery.data ?? []}
            selectedPeriod={selectedPeriod}
            disabled={!ready || renewMutation.isPending}
            onSelect={(period) => {
              selectPeriod(period);
              setError(null);
              impact('light');
            }}
          />
          {missingAmount && !isClassic && (
            <InsufficientBalancePrompt missingAmountKopeks={Number(missingAmount)} compact />
          )}
          {error && !missingAmount && (
            <p role="alert" className="rounded-xl bg-error-400/10 p-3 text-sm text-error-400">
              {error}
            </p>
          )}
          <RenewalSummary
            option={selectedOption}
            balanceKopeks={balanceKopeks}
            isClassic={isClassic}
            disabled={!ready}
            pending={renewMutation.isPending}
            onSubmit={handleRenew}
          />
        </>
      )}
    </div>
  );
}
