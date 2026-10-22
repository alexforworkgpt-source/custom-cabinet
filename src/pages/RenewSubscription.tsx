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
import { previewRenewalEndDate } from '../utils/renewalPreview';
import { useHaptic } from '../platform';
import { useAuthStore } from '../store/auth';
import { useRenewalSelection } from '../hooks/useRenewalSelection';
import InsufficientBalancePrompt from '../components/InsufficientBalancePrompt';
import { WebBackButton } from '../components/WebBackButton';
import { Card } from '../components/data-display';
import { Button } from '../components/primitives';
import { SubscriptionFlowSkeleton } from '../components/subscription/SubscriptionFlowSkeleton';
import { usePurchaseContext } from '../hooks/usePurchaseContext';
import { RenewalOptions } from '../components/subscription/renewal/RenewalOptions';
import { RenewalSummary } from '../components/subscription/renewal/RenewalSummary';
import { RenewalSubscriptionInfo } from '../components/subscription/renewal/RenewalSubscriptionInfo';
import { PurchaseContextBanners } from '../components/subscription/purchase/PurchaseContextBanners';

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
  const purchaseContext = usePurchaseContext({
    subscription,
    purchaseOptions: purchaseQuery.data,
    tariffs: purchaseQuery.data?.sales_mode === 'tariffs' ? (purchaseQuery.data.tariffs ?? []) : [],
    showPromoGroup: true,
    enabled: queries.every((query) => query.isSuccess) && !needsTariff(subscription),
  });
  const loading = queries.some((query) => query.isLoading) || purchaseContext.isLoading;
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
      queryClient.invalidateQueries({ queryKey: ['device-price'] });
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
  const projectedEndDate =
    subscription && selectedOption && !subscription.is_trial && !subscription.is_daily
      ? previewRenewalEndDate(subscription.end_date, selectedOption.period_days)
      : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <WebBackButton to={`/subscriptions/${subId}`} />
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-dark-100">{t('subscription.extend')}</h1>
        </div>
      </div>
      {loading ? (
        <SubscriptionFlowSkeleton
          mode="renewal"
          context={purchaseContext}
          count={optionsQuery.data?.length}
          conditions={
            subscription && purchaseQuery.isSuccess ? (
              <RenewalSubscriptionInfo
                subscription={subscription}
                endDate={endDate}
                maxDeviceLimit={
                  purchaseQuery.data.sales_mode === 'classic'
                    ? purchaseQuery.data.devices?.max
                    : undefined
                }
              />
            ) : undefined
          }
        />
      ) : failedQuery ? (
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
          <PurchaseContextBanners context={purchaseContext} />
          <RenewalSubscriptionInfo
            subscription={subscription}
            endDate={endDate}
            maxDeviceLimit={
              purchaseQuery.data.sales_mode === 'classic'
                ? purchaseQuery.data.devices?.max
                : undefined
            }
          />
          <RenewalSummary
            projectedEndDate={projectedEndDate}
            option={selectedOption}
            balanceKopeks={balanceKopeks}
            isClassic={isClassic}
            disabled={!ready}
            pending={renewMutation.isPending}
            onSubmit={handleRenew}
          >
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
          </RenewalSummary>
        </>
      )}
    </div>
  );
}
