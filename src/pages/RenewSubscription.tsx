import { useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { subscriptionApi } from '../api/subscription';
import { hasRenewalOperationContract, hasTargetBotContract } from '../config/upstreamBotContract';
import { useCurrency } from '../hooks/useCurrency';
import { DailyPausePanel } from '../components/subscription/manage/DailyPausePanel';
import { canOpenTariffSwitch, needsTariff, tariffSelectionPath } from '../utils/legacySubscription';
import { getInsufficientBalanceError, getSavedCartTopUpPath } from '../utils/subscriptionHelpers';
import { isUncertainPurchaseOutcome } from '../utils/api-error';
import { isValidRenewalSnapshot, type RenewalSnapshot } from '../utils/renewalOperation';
import { getLocalizedApiErrorMessage } from '../utils/api-error-display';
import { previewRenewalEndDate } from '../utils/renewalPreview';
import { useHaptic } from '../platform';
import { useAuthStore } from '../store/auth';
import { useRenewalSelection } from '../hooks/useRenewalSelection';
import InsufficientBalancePrompt from '../components/InsufficientBalancePrompt';
import { WebBackButton } from '../components/WebBackButton';
import { Card } from '../components/data-display';
import { Button } from '../components/primitives';
import { SubscriptionLoadingHeight } from '../components/subscription/SubscriptionLoadingHeight';
import { SubscriptionFlowSkeleton } from '../components/subscription/SubscriptionFlowSkeleton';
import { RenewalOptions } from '../components/subscription/renewal/RenewalOptions';
import { RenewalSummary } from '../components/subscription/renewal/RenewalSummary';
import { motion, useReducedMotion } from 'framer-motion';
import { PageEntrance } from '@/components/motion/PageEntrance';
import { fadeIn } from '@/components/motion/transitions';

function RenewalLoadingSkeleton({ count }: { count?: number }) {
  // Partial responses must not rebuild the placeholder while another query is pending.
  const [initialPeriodCount] = useState(count);
  return <SubscriptionFlowSkeleton mode="renewal" count={initialPeriodCount} />;
}

export default function RenewSubscription() {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const subId = subscriptionId ? Number(subscriptionId) : undefined;
  const { t } = useTranslation();
  const { formatWithCurrency } = useCurrency();
  const targetContract = hasTargetBotContract();
  const usesRenewalOperation = hasRenewalOperationContract();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { impact } = useHaptic();
  const userId = useAuthStore((state) => state.user?.id);
  const [error, setError] = useState<string | null>(null);
  const renewalInFlightRef = useRef(false);
  type Confirmation = { periodDays: number; subscriptionId?: number; snapshot?: RenewalSnapshot };

  const subscriptionQuery = useQuery({
    queryKey: ['subscription', subId],
    queryFn: () => subscriptionApi.getSubscription(subId),
    enabled: !!subId,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const subscription = subscriptionQuery.data?.subscription ?? null;
  const dailyResume = targetContract && Boolean(subscription?.is_daily && !subscription.is_trial);
  const optionsQuery = useQuery({
    queryKey: ['renewal-options', subId],
    queryFn: () => subscriptionApi.getRenewalOptions(subId),
    enabled: !!subId && (!targetContract || (!!subscription && !dailyResume)),
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
  const loading = queries.some((query) => query.isLoading);
  const reducedMotion = useReducedMotion();
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
    retry: false,
    mutationFn: ({ periodDays, subscriptionId: id, snapshot }: Confirmation) =>
      snapshot
        ? subscriptionApi.renewSubscription(periodDays, id, snapshot)
        : subscriptionApi.renewSubscription(periodDays, id),
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
      if (isUncertainPurchaseOutcome(err)) {
        setError(t('subscription.purchaseOutcomeUnknown'));
        return;
      }
      const response = (err as { response?: { status?: number; data?: { detail?: unknown } } })
        ?.response;
      if (
        usesRenewalOperation &&
        response?.status === 409 &&
        (response.data?.detail === 'Subscription changed; reload before renewing' ||
          response.data?.detail === 'Renewal operation parameters changed')
      ) {
        clearSelection();
        setError(t('subscription.renewSelectionReset'));
        void subscriptionQuery.refetch();
        void optionsQuery.refetch();
        void purchaseQuery.refetch();
        return;
      }
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
        else setError(getLocalizedApiErrorMessage(err, t('common.error'), t));
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
      setError(getLocalizedApiErrorMessage(err, t('common.error'), t));
    },
    onSettled: () => {
      renewalInFlightRef.current = false;
    },
  });
  const lastConfirmation = renewMutation.variables;
  const retryConfirmation =
    lastConfirmation?.snapshot &&
    lastConfirmation.snapshot.userId === userId &&
    lastConfirmation.subscriptionId === subId &&
    isUncertainPurchaseOutcome(renewMutation.error)
      ? lastConfirmation
      : null;
  const snapshot = subscription ? { userId, endDate: subscription.end_date } : undefined;
  const validTarget = subscription?.id === subId && isValidRenewalSnapshot(snapshot);
  const handleRenew = () => {
    if (
      renewalInFlightRef.current ||
      !ready ||
      !subscription ||
      !selectedOption ||
      balanceKopeks === undefined ||
      retryConfirmation ||
      (usesRenewalOperation && !validTarget)
    )
      return;
    renewalInFlightRef.current = true;
    impact('medium');
    setError(null);
    renewMutation.mutate({
      periodDays: selectedOption.period_days,
      subscriptionId: subId,
      snapshot: usesRenewalOperation ? snapshot : undefined,
    });
  };
  const retryRenewal = () => {
    if (!retryConfirmation || renewalInFlightRef.current) return;
    renewalInFlightRef.current = true;
    setError(null);
    renewMutation.mutate(retryConfirmation);
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
  const projectedEndDate =
    subscription && selectedOption && !subscription.is_trial && !subscription.is_daily
      ? previewRenewalEndDate(subscription.end_date, selectedOption.period_days)
      : null;

  return (
    <PageEntrance className="space-y-4">
      <div className="flex items-end gap-3 pb-2">
        <WebBackButton to={`/subscriptions/${subId}`} inPageHeading />
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-8 text-dark-100 min-[360px]:text-2xl sm:text-3xl">
            {t('subscription.extend')}
          </h1>
        </div>
      </div>
      <SubscriptionLoadingHeight
        stage={loading && !failedQuery && !dailyResume ? 'pending' : 'ready'}
        smooth={!reducedMotion}
      >
        {dailyResume && subscription ? (
          <motion.div variants={fadeIn}>
            <Card className="space-y-3">
              <p className="text-sm text-dark-400">{t('subscription.dailyRenewalExplanation')}</p>
              <p>
                {t('subscription.dailyRenewalPrice', {
                  price: formatWithCurrency((subscription.daily_price_kopeks ?? 0) / 100),
                })}
              </p>
              <DailyPausePanel
                key={subscription.id}
                subscription={subscription}
                subscriptionId={subscription.id}
              />
              {canOpenTariffSwitch(subscription) && (
                <Link className="btn-secondary" to={tariffSelectionPath(subId) + '&mode=switch'}>
                  {t('subscription.switchTariff.title')}
                </Link>
              )}
            </Card>
          </motion.div>
        ) : loading && !failedQuery ? (
          <RenewalLoadingSkeleton key={subId} count={optionsQuery.data?.length} />
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
            {targetContract && !isClassic && canOpenTariffSwitch(subscription) && (
              <Link className="btn-secondary" to={tariffSelectionPath(subId) + '&mode=switch'}>
                {t('subscription.switchTariff.title')}
              </Link>
            )}
            <motion.div variants={fadeIn}>
              <RenewalSummary
                projectedEndDate={projectedEndDate}
                option={selectedOption}
                balanceKopeks={balanceKopeks}
                isClassic={isClassic}
                disabled={
                  !ready || Boolean(retryConfirmation) || (usesRenewalOperation && !validTarget)
                }
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
                  disabled={!ready || renewMutation.isPending || Boolean(retryConfirmation)}
                  onSelect={(period) => {
                    selectPeriod(period);
                    setError(null);
                    impact('light');
                  }}
                />
                {missingAmount && !isClassic && !retryConfirmation && (
                  <InsufficientBalancePrompt missingAmountKopeks={Number(missingAmount)} compact />
                )}
                {error && (!missingAmount || retryConfirmation) && (
                  <p role="alert" className="rounded-xl bg-error-400/10 p-3 text-sm text-error-400">
                    {error}
                  </p>
                )}
                {retryConfirmation && (
                  <button type="button" className="btn-secondary" onClick={retryRenewal}>
                    {t('common.retry')}
                  </button>
                )}
              </RenewalSummary>
            </motion.div>
          </>
        )}
      </SubscriptionLoadingHeight>
    </PageEntrance>
  );
}
