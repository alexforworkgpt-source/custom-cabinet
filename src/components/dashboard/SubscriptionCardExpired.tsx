import { uiLocale } from '@/utils/uiLocale';
import { useState, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { Subscription } from '../../types';
import { subscriptionApi } from '../../api/subscription';
import { useTheme } from '../../hooks/useTheme';
import { useCurrency } from '../../hooks/useCurrency';
import { useHapticFeedback } from '../../platform/hooks/useHaptic';
import { getGlassColors } from '../../utils/glassTheme';
import { getInsufficientBalanceError } from '../../utils/subscriptionHelpers';
import { ClockIcon, ExclamationIcon, PlusIcon, SubscriptionIcon } from '@/components/icons';

interface SubscriptionCardExpiredProps {
  subscription: Subscription;
  balanceKopeks?: number | null;
  balanceRubles?: number | null;
  isTrafficTopupOpen: boolean;
  trafficTopupTriggerRef: RefObject<HTMLButtonElement | null>;
  onBuyTraffic: () => void;
  onManageSubscription: () => void;
  managementOpen: boolean;
  className?: string;
}

export default function SubscriptionCardExpired({
  subscription,
  balanceKopeks = null,
  balanceRubles = null,
  isTrafficTopupOpen,
  trafficTopupTriggerRef,
  onBuyTraffic,
  onManageSubscription,
  managementOpen,
  className,
}: SubscriptionCardExpiredProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const g = getGlassColors(isDark);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const { formatAmount, currencySymbol } = useCurrency();
  const haptic = useHapticFeedback();

  const [isRenewing, setIsRenewing] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);

  const formattedDate = new Date(subscription.end_date).toLocaleDateString(uiLocale());

  // Detect limited (traffic exhausted) state
  const isLimited = subscription.is_limited;

  // Detect daily subscription (disabled or expired)
  const isDaily = subscription.is_daily;
  const isDisabledDaily = subscription.status === 'disabled' && isDaily;

  // For daily subs, check if balance covers daily price; otherwise 100 kopeks minimum
  const dailyPrice = subscription.daily_price_kopeks ?? 0;
  const hasBalance =
    balanceKopeks !== null &&
    (isDaily ? balanceKopeks >= dailyPrice && dailyPrice > 0 : balanceKopeks >= 100);

  const handleQuickRenew = async () => {
    if (!isDaily) {
      haptic.buttonPressHeavy();
      onManageSubscription();
      return;
    }

    setIsRenewing(true);
    setRenewError(null);
    haptic.buttonPressHeavy();

    try {
      if (isDisabledDaily) {
        // Resume daily subscription via toggle pause endpoint
        await subscriptionApi.togglePause(subscription.id);
      } else if (isDaily && subscription.tariff_id) {
        // Expired daily tariff — purchase for 1 day. Pass subscription.id
        // so the backend resolves the EXACT row instead of doing a
        // (user_id, tariff_id) re-lookup that races with concurrent
        // panel webhooks (would surface as "Тариф уже активен" + refund).
        await subscriptionApi.purchaseTariff(subscription.tariff_id, 1, undefined, subscription.id);
      }
      haptic.success();
      queryClient.invalidateQueries({
        predicate: (query) => Array.isArray(query.queryKey) && query.queryKey[0] === 'subscription',
      });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-options'] });
    } catch (err: unknown) {
      haptic.error();
      const insufficientData = getInsufficientBalanceError(err);
      if (insufficientData) {
        setRenewError(t('dashboard.expired.insufficientFunds'));
      } else if (err instanceof AxiosError) {
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string') {
          setRenewError(detail);
        } else {
          setRenewError(t('dashboard.expired.renewError'));
        }
      } else {
        setRenewError(t('dashboard.expired.renewError'));
      }
    } finally {
      setIsRenewing(false);
    }
  };

  const handleTopUp = () => {
    haptic.buttonPress();
    const params = new URLSearchParams();
    params.set('returnTo', `${location.pathname}${location.search}`);
    navigate(`/balance/top-up?${params.toString()}`);
  };

  // Color scheme: amber for limited, red for expired/disabled
  const accent = isLimited
    ? {
        r: 255,
        g: 184,
        b: 0,
        hex: 'rgb(var(--color-urgent-400))',
        gradient: 'linear-gradient(135deg, #FFB800, #FF8C00)',
      }
    : {
        r: 255,
        g: 59,
        b: 92,
        hex: 'rgb(var(--color-critical-500))',
        gradient: 'linear-gradient(135deg, #FF3B5C, #FF6B35)',
      };

  return (
    <div
      className={`relative overflow-hidden rounded-3xl px-5 py-5 sm:px-6 ${className ?? ''}`}
      style={{
        background: g.cardBg,
        border: isDark
          ? `1px solid rgba(${accent.r},${accent.g},${accent.b},0.12)`
          : `1px solid rgba(${accent.r},${accent.g},${accent.b},0.2)`,
        boxShadow: isDark
          ? g.shadow
          : `0 2px 16px rgba(${accent.r},${accent.g},${accent.b},0.1), 0 0 0 1px rgba(${accent.r},${accent.g},${accent.b},0.06)`,
      }}
    >
      {/* Glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          top: -60,
          right: -60,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${accent.r},${accent.g},${accent.b},0.08) 0%, transparent 70%)`,
        }}
        aria-hidden="true"
      />
      {/* Grid pattern */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: isDark ? 0.01 : 0.02,
          backgroundImage: isDark
            ? `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`
            : `linear-gradient(rgba(0,0,0,0.06) 1px, transparent 1px),
               linear-gradient(90deg, rgba(0,0,0,0.06) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
        aria-hidden="true"
      />

      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <div
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-[14px]"
          style={{
            background: `rgba(${accent.r},${accent.g},${accent.b},0.1)`,
            border: `1px solid rgba(${accent.r},${accent.g},${accent.b},0.15)`,
            color: accent.hex,
          }}
        >
          {isLimited ? (
            <ExclamationIcon className="h-[22px] w-[22px]" />
          ) : (
            <ClockIcon className="h-[22px] w-[22px]" />
          )}
        </div>
        <h2 className="text-lg font-bold tracking-tight text-dark-50">
          {isLimited
            ? t('subscription.trafficLimitedTitle')
            : isDisabledDaily
              ? t('dashboard.suspended.title')
              : subscription.is_trial
                ? t('dashboard.expired.trialTitle')
                : t('dashboard.expired.title')}
        </h2>
      </div>

      {/* Limited description */}
      {isLimited && (
        <p className="mb-4 text-sm text-dark-50/60">
          {t('subscription.trafficLimitedDescription')}
        </p>
      )}

      {/* Expired date + Balance row */}
      <div
        className="mb-4 flex items-center justify-between rounded-[14px]"
        style={{
          background: `rgba(${accent.r},${accent.g},${accent.b},0.04)`,
          border: `1px solid rgba(${accent.r},${accent.g},${accent.b},0.08)`,
          padding: '12px 14px',
        }}
      >
        <div className="flex items-center">
          <div className="mb-0.5 font-mono text-[10px] font-medium uppercase tracking-wider text-dark-50/30">
            {isLimited
              ? t('dashboard.expired.activeUntil')
              : t('dashboard.expired.expiredDate', {
                  context: subscription.is_trial ? 'trial' : '',
                })}
          </div>
          <div className="ml-3 text-base font-bold tracking-tight text-dark-50/50">
            {formattedDate}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-medium uppercase tracking-wider text-dark-50/30">
            {t('dashboard.expired.balance')}
          </span>
          <span
            className={`text-sm font-semibold ${hasBalance ? 'text-success-400' : 'text-dark-50/30'}`}
          >
            {balanceRubles === null
              ? t('dashboard.dataUnavailable')
              : `${formatAmount(balanceRubles)} ${currencySymbol}`}
          </span>
        </div>
      </div>

      {/* Renew error */}
      {renewError && (
        <div
          className="mb-4 rounded-xl border border-error-500/30 bg-error-500/10 p-3 text-center text-sm text-error-400"
          role="alert"
        >
          {renewError}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2.5">
        {isLimited ? (
          <button
            type="button"
            ref={trafficTopupTriggerRef}
            onClick={onBuyTraffic}
            aria-expanded={isTrafficTopupOpen}
            aria-controls="traffic-topup-panel"
            className="flex flex-1 items-center justify-center gap-2 rounded-[14px] py-3.5 text-[15px] font-semibold tracking-tight text-white transition-all duration-300"
            style={{
              background: accent.gradient,
              boxShadow: `0 4px 20px rgba(${accent.r},${accent.g},${accent.b},0.2)`,
            }}
          >
            <PlusIcon className="h-4 w-4" />
            {t('subscription.buyTraffic')}
          </button>
        ) : !subscription.is_trial ? (
          balanceKopeks === null ? (
            <button
              type="button"
              disabled
              className="flex flex-1 cursor-not-allowed items-center justify-center rounded-[14px] bg-dark-700 py-3.5 text-[15px] font-semibold text-dark-400"
            >
              {t('dashboard.dataUnavailable')}
            </button>
          ) : hasBalance ? (
            <button
              type="button"
              onClick={handleQuickRenew}
              disabled={isRenewing}
              className="flex flex-1 items-center justify-center gap-2 rounded-[14px] py-3.5 text-[15px] font-semibold tracking-tight text-white transition-all duration-300 disabled:opacity-50"
              style={{
                background: accent.gradient,
                boxShadow: `0 4px 20px rgba(${accent.r},${accent.g},${accent.b},0.2)`,
              }}
            >
              {isRenewing ? (
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                  aria-hidden="true"
                />
              ) : (
                <SubscriptionIcon className="h-4 w-4" />
              )}
              {isRenewing
                ? t('common.loading')
                : isDisabledDaily
                  ? t('dashboard.suspended.resume')
                  : t('dashboard.expired.quickRenew')}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleTopUp}
              className="flex flex-1 items-center justify-center gap-2 rounded-[14px] py-3.5 text-[15px] font-semibold tracking-tight text-white transition-all duration-300"
              style={{
                background: accent.gradient,
                boxShadow: `0 4px 20px rgba(${accent.r},${accent.g},${accent.b},0.2)`,
              }}
            >
              <PlusIcon className="h-4 w-4" />
              {t('dashboard.expired.topUp')}
            </button>
          )
        ) : null}
      </div>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={managementOpen}
        onClick={onManageSubscription}
        className="mt-3 flex min-h-11 w-full items-center justify-center rounded-[14px] border border-dark-700/60 bg-dark-900/80 px-4 py-3 text-center text-sm font-semibold text-dark-200 transition-colors hover:border-dark-600/80 hover:bg-dark-800/80"
      >
        {t('dashboard.manageSubscription')}
      </button>
    </div>
  );
}
