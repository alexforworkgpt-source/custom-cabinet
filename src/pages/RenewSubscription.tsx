import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { subscriptionApi } from '../api/subscription';
import { useTheme } from '../hooks/useTheme';
import { getGlassColors } from '../utils/glassTheme';
import { getMonthlyPriceKopeks } from '../utils/pricing';
import { pickBestValue } from '../utils/bestValue';
import { needsTariff, tariffSelectionPath } from '../utils/legacySubscription';
import {
  getErrorMessage,
  getInsufficientBalanceError,
  getSavedCartTopUpPath,
} from '../utils/subscriptionHelpers';
import { useCurrency } from '../hooks/useCurrency';
import { useHaptic } from '../platform';
import InsufficientBalancePrompt from '../components/InsufficientBalancePrompt';
import { PurchaseFundingNotice } from '../components/subscription/purchase/PurchaseFundingNotice';
import { WebBackButton } from '../components/WebBackButton';
import { BEST_VALUE_BORDER, BestValueBadge } from '../components/subscription/BestValueBadge';
import { PageSkeleton, Skeleton } from '../components/ui/skeleton';

export default function RenewSubscription() {
  const { subscriptionId } = useParams<{ subscriptionId: string }>();
  const subId = subscriptionId ? Number(subscriptionId) : undefined;

  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { isDark } = useTheme();
  const g = getGlassColors(isDark);
  const { formatAmount, currencySymbol } = useCurrency();
  const { impact } = useHaptic();

  const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const renewalInFlightRef = useRef(false);

  // Load subscription detail for tariff name
  const { data: subscriptionResponse, isLoading: isSubscriptionLoading } = useQuery({
    queryKey: ['subscription', subId],
    queryFn: () => subscriptionApi.getSubscription(subId),
    enabled: !!subId,
    staleTime: 30_000,
  });
  const subscription = subscriptionResponse?.subscription ?? null;

  // Load renewal options
  const { data: options, isLoading } = useQuery({
    queryKey: ['renewal-options', subId],
    queryFn: () => subscriptionApi.getRenewalOptions(subId),
    enabled: !!subId,
    staleTime: 0,
    refetchOnMount: 'always',
  });

  useEffect(() => {
    if (selectedPeriod !== null) return;
    const best = pickBestValue(options);
    if (best) setSelectedPeriod(best.period_days);
  }, [options, selectedPeriod]);

  // Load balance
  const { data: purchaseOptions, isLoading: isBalanceLoading } = useQuery({
    queryKey: ['purchase-options', subId],
    queryFn: () => subscriptionApi.getPurchaseOptions(subId),
    staleTime: 0,
  });
  const balanceKopeks = purchaseOptions?.balance_kopeks ?? 0;
  const isClassic = purchaseOptions?.sales_mode === 'classic';
  const selectedOption = options?.find((option) => option.period_days === selectedPeriod);
  const missingKopeks = selectedOption
    ? Math.max(0, selectedOption.price_kopeks - balanceKopeks)
    : 0;

  const renewMutation = useMutation({
    mutationFn: (periodDays: number) => subscriptionApi.renewSubscription(periodDays, subId),
    onSuccess: () => {
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
        const topUpPath =
          insufficient?.cartMode === 'extend'
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

      if (detail && typeof detail === 'object' && 'code' in (detail as Record<string, unknown>)) {
        const typed = detail as { code: string; missing_amount?: number };
        if (typed.code === 'insufficient_funds' && typed.missing_amount) {
          setError(`insufficient:${typed.missing_amount}`);
          return;
        }
      }
      setError(typeof detail === 'string' ? detail : t('common.error'));
    },
    onSettled: () => {
      renewalInFlightRef.current = false;
    },
  });

  const handleRenew = (periodDays: number) => {
    if (renewalInFlightRef.current) return;
    renewalInFlightRef.current = true;
    impact('medium');
    setError(null);
    renewMutation.mutate(periodDays);
  };

  if (!subId) {
    return <Navigate to="/subscriptions" replace />;
  }

  if (needsTariff(subscription)) {
    return <Navigate to={tariffSelectionPath(subId)} replace />;
  }

  if (isLoading || isSubscriptionLoading || isBalanceLoading) {
    return (
      <PageSkeleton leading={1} titleWidth="w-56" className="space-y-5">
        <Skeleton variant="card" className="h-16" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Skeleton variant="card" count={4} className="h-20" />
        </div>
      </PageSkeleton>
    );
  }

  const insufficientMatch = error?.match(/^insufficient:(\d+)$/);
  const missingAmount = insufficientMatch ? Number(insufficientMatch[1]) : null;

  return (
    <div className="space-y-5">
      {/* Title */}
      <div className="flex items-center gap-3">
        <WebBackButton to={`/subscriptions/${subId}`} />
        <div>
          <h1 className="text-2xl font-bold" style={{ color: g.text }}>
            {t('subscription.extend', 'Продлить подписку')}
          </h1>
          {subscription?.tariff_name && (
            <p className="mt-1 text-sm" style={{ color: g.textSecondary }}>
              {subscription.tariff_name}
            </p>
          )}
        </div>
      </div>

      {isClassic && subscription && (
        <div className="space-y-1 text-sm text-dark-400">
          <p>{t('subscription.classicRenewHint')}</p>
          <p>
            {t('subscription.traffic')}:{' '}
            {subscription.traffic_limit_gb || t('subscription.unlimited')}
            {subscription.traffic_limit_gb > 0 && ` ${t('common.units.gb')}`}
            {' · '}
            {t('subscription.devices')}: {subscription.device_limit || t('subscription.unlimited')}
          </p>
          {subscription.servers.length > 0 && (
            <p>
              {t('subscription.serversLabel')}:{' '}
              {subscription.servers.map((server) => server.name).join(', ')}
            </p>
          )}
        </div>
      )}

      {/* Balance */}
      <div
        className="flex items-center justify-between rounded-2xl p-4"
        style={{ background: g.cardBg, border: `1px solid ${g.cardBorder}` }}
      >
        <span className="text-sm" style={{ color: g.textSecondary }}>
          {t('common.balance', 'Баланс')}
        </span>
        <span className="text-base font-semibold" style={{ color: g.text }}>
          {formatAmount(balanceKopeks / 100)} {currencySymbol}
        </span>
      </div>

      {/* Period options */}
      {!options || options.length === 0 ? (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: g.cardBg, border: `1px solid ${g.cardBorder}` }}
        >
          <p style={{ color: g.textSecondary }}>
            {t('subscription.noRenewalOptions', 'Нет доступных вариантов продления')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {options.map((option) => {
            const isSelected = selectedPeriod === option.period_days;
            const canAfford = balanceKopeks >= option.price_kopeks;
            const perMonth = getMonthlyPriceKopeks(option.price_kopeks, option.period_days);
            const isBestValue = Boolean(option.is_highlighted);

            return (
              <button
                key={option.period_days}
                disabled={renewMutation.isPending}
                onClick={() => {
                  impact('light');
                  setSelectedPeriod(option.period_days);
                  setError(null);
                }}
                className={`w-full rounded-2xl p-4 text-left transition-all duration-200 ${
                  isBestValue ? 'border-2' : 'border'
                }`}
                style={{
                  background: isSelected
                    ? isDark
                      ? 'rgba(var(--color-accent-400), 0.08)'
                      : 'rgba(var(--color-accent-400), 0.05)'
                    : g.cardBg,
                  borderColor: isBestValue
                    ? BEST_VALUE_BORDER
                    : isSelected
                      ? 'rgb(var(--color-accent-400))'
                      : g.cardBorder,
                  boxShadow:
                    isSelected && isBestValue
                      ? 'inset 0 0 0 2px rgb(var(--color-accent-400))'
                      : undefined,
                }}
              >
                {isBestValue && <BestValueBadge className="mb-2" />}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-semibold" style={{ color: g.text }}>
                      {option.period_days} {t('subscription.days', 'дней')}
                    </span>
                    {option.discount_percent > 0 && (
                      <span className="ml-2 rounded-full bg-success-400/15 px-2 py-0.5 text-[10px] font-semibold text-success-400">
                        -{option.discount_percent}%
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-base font-semibold" style={{ color: g.text }}>
                      {option.price_kopeks === 0
                        ? t('subscription.free', 'Бесплатно')
                        : `${formatAmount(option.price_kopeks / 100)} ${currencySymbol}`}
                    </div>
                    {perMonth !== null && (
                      <div className="text-[11px]" style={{ color: g.textSecondary }}>
                        {formatAmount(perMonth / 100)} {currencySymbol}/
                        {t('subscription.month', 'мес')}
                      </div>
                    )}
                    {option.original_price_kopeks && (
                      <div className="text-[11px] line-through" style={{ color: g.textSecondary }}>
                        {formatAmount(option.original_price_kopeks / 100)} {currencySymbol}
                      </div>
                    )}
                  </div>
                </div>
                {!canAfford && (
                  <div className="mt-1 text-[11px] text-error-400">
                    {t(
                      'subscription.insufficientBalanceAmount',
                      'Недостаточно средств. Не хватает {{missing}}',
                      {
                        missing: `${formatAmount((option.price_kopeks - balanceKopeks) / 100)} ${currencySymbol}`,
                      },
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Insufficient balance prompt */}
      {isClassic && selectedOption && missingKopeks > 0 && !error && (
        <PurchaseFundingNotice
          missingAmountKopeks={missingKopeks}
          messageKey="subscription.classicRenewFundingNotice"
        />
      )}
      {!isClassic && missingAmount && (
        <InsufficientBalancePrompt missingAmountKopeks={missingAmount} compact />
      )}

      {/* Error */}
      {error && !missingAmount && (
        <div className="rounded-xl bg-error-400/10 p-3 text-center text-sm text-error-400">
          {error}
        </div>
      )}

      {/* Renew button */}
      {selectedOption && (
        <button
          onClick={() => handleRenew(selectedOption.period_days)}
          disabled={renewMutation.isPending}
          aria-busy={renewMutation.isPending}
          className="w-full rounded-2xl bg-accent-500 py-3.5 text-base font-semibold text-on-accent transition-colors hover:bg-accent-600 disabled:opacity-50"
        >
          {renewMutation.isPending
            ? t('common.processing', 'Обработка...')
            : isClassic
              ? t(missingKopeks > 0 ? 'dashboard.topUpBalance' : 'subscription.pay')
              : t('subscription.extend', 'Продлить подписку')}
        </button>
      )}
    </div>
  );
}
