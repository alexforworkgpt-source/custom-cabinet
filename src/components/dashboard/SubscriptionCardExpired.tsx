import { uiLocale } from '@/utils/uiLocale';
import { useState, type ReactNode, type RefObject } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import type { Subscription } from '../../types';
import { subscriptionApi } from '../../api/subscription';
import { useHapticFeedback } from '../../platform/hooks/useHaptic';
import {
  getInsufficientBalanceError,
  dashboardScenarioHasManagement,
  dashboardSubscriptionScenario,
  dashboardSubscriptionScenarioTitle,
} from '../../utils/subscriptionHelpers';
import { needsTariff, tariffSelectionPath } from '../../utils/legacySubscription';
import { PlusIcon, TariffsIcon } from '@/components/icons';
import { SubscriptionScenarioHero } from '../subscription/SubscriptionHero';
import { SubscriptionConnectFooter } from '../subscription/SubscriptionConnectFooter';
import { connectFooterState } from '../subscription/connectFooterState';
import {
  SubscriptionHeroButton,
  SubscriptionHeroLink,
  SubscriptionManageAction,
} from './SubscriptionActiveActions';

interface SubscriptionCardExpiredProps {
  subscription: Subscription;
  balanceKopeks?: number | null;
  isTrafficTopupOpen: boolean;
  trafficTopupTriggerRef: RefObject<HTMLButtonElement | null>;
  onBuyTraffic: () => void;
  connectedDevices: number | undefined;
  devicesError: boolean;
  onConnectDevice: () => void;
  onManageDevices: () => void;
  onRetryDevices: () => void;
  devicesOpen: boolean;
  onManageSubscription: () => void;
  managementOpen: boolean;
  className?: string;
}

export default function SubscriptionCardExpired({
  subscription,
  balanceKopeks = null,
  isTrafficTopupOpen,
  trafficTopupTriggerRef,
  onBuyTraffic,
  connectedDevices,
  devicesError,
  onConnectDevice,
  onManageDevices,
  onRetryDevices,
  devicesOpen,
  onManageSubscription,
  managementOpen,
  className,
}: SubscriptionCardExpiredProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const haptic = useHapticFeedback();

  const [isRenewing, setIsRenewing] = useState(false);
  const [renewError, setRenewError] = useState<string | null>(null);

  const formattedDate = new Date(subscription.end_date).toLocaleDateString(uiLocale());

  // Detect limited (traffic exhausted) state
  const isLimited = subscription.is_limited;
  const requiresTariff = needsTariff(subscription);

  // Detect daily subscription (disabled or expired)
  const isDaily = subscription.is_daily;
  const isDisabledDaily = subscription.status === 'disabled' && isDaily;
  const connectState = connectFooterState({
    status: subscription.status,
    subscriptionUrl: subscription.subscription_url,
    deviceLimit: subscription.device_limit,
    connected: connectedDevices,
    hasError: devicesError,
  });

  // For daily subs, check if balance covers daily price; otherwise 100 kopeks minimum
  const dailyPrice = subscription.daily_price_kopeks ?? 0;
  const hasBalance =
    balanceKopeks !== null &&
    (isDaily ? balanceKopeks >= dailyPrice && dailyPrice > 0 : balanceKopeks >= 100);

  const handleQuickRenew = async () => {
    if (!isDaily) {
      haptic.buttonPressHeavy();
      navigate(`/subscriptions/${subscription.id}/renew`);
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

  const scenario = dashboardSubscriptionScenario(subscription);
  if (!scenario) return null;

  let primaryAction: ReactNode;
  if (requiresTariff) {
    primaryAction = (
      <SubscriptionHeroLink
        to={tariffSelectionPath(subscription.id)}
        onClick={() => haptic.buttonPressHeavy()}
      >
        <TariffsIcon className="h-4 w-4" />
        {t('subscription.cta.moveToTariff')}
      </SubscriptionHeroLink>
    );
  } else if (isLimited) {
    primaryAction = (
      <SubscriptionHeroButton
        ref={trafficTopupTriggerRef}
        onClick={onBuyTraffic}
        aria-expanded={isTrafficTopupOpen}
        aria-controls="traffic-topup-panel"
      >
        <PlusIcon className="h-4 w-4" />
        {t('subscription.buyTraffic')}
      </SubscriptionHeroButton>
    );
  } else if (!subscription.is_trial) {
    if (isDaily && balanceKopeks === null) {
      primaryAction = (
        <SubscriptionHeroButton disabled>{t('dashboard.dataUnavailable')}</SubscriptionHeroButton>
      );
    } else if (isDaily && !hasBalance) {
      primaryAction = (
        <SubscriptionHeroButton onClick={handleTopUp}>
          <PlusIcon className="h-4 w-4" />
          {t('dashboard.expired.topUp')}
        </SubscriptionHeroButton>
      );
    } else {
      primaryAction = (
        <SubscriptionHeroButton onClick={handleQuickRenew} disabled={isRenewing}>
          {isRenewing ? (
            <span
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
              aria-hidden="true"
            />
          ) : (
            <TariffsIcon className="h-4 w-4 shrink-0" />
          )}
          {isRenewing
            ? t('common.loading')
            : isDisabledDaily
              ? t('dashboard.suspended.resume')
              : t('dashboard.expired.quickRenew')}
        </SubscriptionHeroButton>
      );
    }
  }

  const manage = dashboardScenarioHasManagement(scenario) && (
    <SubscriptionManageAction
      accent={scenario === 'expired-trial'}
      onManageSubscription={onManageSubscription}
      managementOpen={managementOpen}
    />
  );
  const dateLabel = isLimited
    ? t('dashboard.expired.activeUntil')
    : scenario === 'paused'
      ? null
      : t('dashboard.expired.expiredDate', { context: subscription.is_trial ? 'trial' : '' });

  return (
    <div className="space-y-3">
      <SubscriptionScenarioHero
        scenario={scenario}
        className={className}
        title={t(dashboardSubscriptionScenarioTitle[scenario])}
        summary={
          scenario !== 'disabled' && (
            <p className="flex flex-wrap items-baseline gap-x-1.5 text-xs">
              {dateLabel && <span>{dateLabel}</span>}
              <time dateTime={subscription.end_date} className="font-semibold text-champagne-50">
                {dateLabel ? formattedDate : t('dashboard.validUntil', { date: formattedDate })}
              </time>
            </p>
          )
        }
        action={
          <>
            {isLimited && (
              <p className="subscription-hero-scenario-note">
                {t('subscription.trafficLimitedDescription')}
              </p>
            )}
            {renewError && (
              <div
                className="rounded-xl border border-error-500/30 bg-error-500/10 p-3 text-sm text-error-400"
                role="alert"
              >
                {renewError}
              </div>
            )}
            {primaryAction}
            {manage}
          </>
        }
      />
      {isLimited && (
        <SubscriptionConnectFooter
          state={connectState}
          variant="prominent"
          managementOpen={devicesOpen}
          onConnect={onConnectDevice}
          onManage={onManageDevices}
          onRetry={onRetryDevices}
        />
      )}
    </div>
  );
}
