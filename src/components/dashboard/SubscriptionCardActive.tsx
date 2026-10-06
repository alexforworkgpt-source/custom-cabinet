import { uiLocale } from '@/utils/uiLocale';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import type { UseMutationResult } from '@tanstack/react-query';
import TrafficProgressBar from './TrafficProgressBar';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';
import { useTheme } from '../../hooks/useTheme';
import { useTrafficZone } from '../../hooks/useTrafficZone';
import { formatTraffic } from '../../utils/formatTraffic';
import { CalendarIcon, ChartIcon, GiftIcon, RefreshIcon } from '@/components/icons';
import type { Subscription } from '../../types';
import { SubscriptionActiveActions, SubscriptionPrimaryAction } from './SubscriptionActiveActions';

interface SubscriptionCardActiveProps {
  subscription: Subscription;
  trafficData: {
    traffic_used_gb: number;
    traffic_used_percent: number;
    is_unlimited: boolean;
  } | null;
  refreshTrafficMutation: UseMutationResult<unknown, unknown, number, unknown>;
  trafficRefreshCooldown: number;
  connectedDevices: number | undefined;
  devicesError: boolean;
  connectionUrl?: string | null;
  connectionLinkLoading?: boolean;
  connectionUrlCopied?: boolean;
  onCopyConnectionUrl?: () => void;
  onOpenConnectionQr: () => void;
  onConnectDevice: () => void;
  onManageDevices: () => void;
  onRetryDevices: () => void;
  devicesOpen: boolean;
  onManageSubscription: () => void;
  managementOpen: boolean;
}

export default function SubscriptionCardActive({
  subscription,
  trafficData,
  refreshTrafficMutation,
  trafficRefreshCooldown,
  connectedDevices,
  devicesError,
  connectionUrl,
  connectionLinkLoading,
  connectionUrlCopied = false,
  onCopyConnectionUrl,
  onOpenConnectionQr,
  onConnectDevice,
  onManageDevices,
  onRetryDevices,
  devicesOpen,
  onManageSubscription,
  managementOpen,
}: SubscriptionCardActiveProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const gridId = useId();
  const contrast = {
    background:
      'color-mix(in srgb, rgba(var(--color-accent-500), 0.95) 15%, rgba(var(--color-champagne-950), 0.95) 85%)',
    border: 'rgba(var(--color-accent-400), 0.22)',
    primary: 'rgb(var(--color-champagne-50))',
    secondary: 'rgb(var(--color-champagne-400))',
    muted: 'rgba(var(--color-champagne-50), 0.58)',
    faint: 'rgba(var(--color-champagne-50), 0.42)',
    innerBackground: 'rgba(var(--color-champagne-50), 0.055)',
    innerBorder: 'rgba(var(--color-champagne-50), 0.1)',
    hoverBackground: 'rgba(var(--color-champagne-50), 0.08)',
    shadow: isDark
      ? '0 12px 30px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)'
      : '0 14px 36px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.05)',
  };

  const usedPercent = trafficData?.traffic_used_percent ?? subscription.traffic_used_percent;
  const usedGb = trafficData?.traffic_used_gb ?? subscription.traffic_used_gb;
  const isUnlimited = trafficData?.is_unlimited ?? subscription.traffic_limit_gb === 0;
  const zone = useTrafficZone(usedPercent);
  const contrastStatusShade = isDark ? 400 : 500;
  const zoneColor = `rgb(var(--color-${zone.colorKey}-${contrastStatusShade}))`;
  const activeStatusRaw = `var(--color-success-${contrastStatusShade})`;
  const warningStatusRaw = `var(--color-warning-${contrastStatusShade})`;
  const animatedPercent = useAnimatedNumber(usedPercent);
  const formattedDate = new Date(subscription.end_date).toLocaleDateString(uiLocale());
  const daysLeft = subscription.days_left;
  const refreshing =
    refreshTrafficMutation.isPending && refreshTrafficMutation.variables === subscription.id;

  return (
    <div className="space-y-3">
      <section
        aria-labelledby="subscription-summary-title"
        className="relative isolate overflow-hidden rounded-3xl px-5 py-3 sm:px-6"
        style={{
          background: contrast.background,
          border: `1px solid ${contrast.border}`,
          boxShadow: contrast.shadow,
        }}
      >
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full text-champagne-50"
        >
          <defs>
            <pattern id={gridId} width="32" height="32" patternUnits="userSpaceOnUse">
              <path
                d="M16.5 0V32M0 16.5H32"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.65"
                opacity="0.025"
              />
              <circle cx="16.5" cy="16.5" r="1.25" fill="currentColor" opacity="0.14" />
            </pattern>
            <linearGradient id={`${gridId}-strength`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="white" stopOpacity="0" />
              <stop offset="15%" stopColor="white" stopOpacity="0.01" />
              <stop offset="35%" stopColor="white" stopOpacity="0.06" />
              <stop offset="55%" stopColor="white" stopOpacity="0.22" />
              <stop offset="75%" stopColor="white" stopOpacity="0.55" />
              <stop offset="90%" stopColor="white" stopOpacity="0.82" />
              <stop offset="100%" stopColor="white" stopOpacity="1" />
            </linearGradient>
            <linearGradient id={`${gridId}-edges`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="white" stopOpacity="0.06" />
              <stop offset="15%" stopColor="white" stopOpacity="0.65" />
              <stop offset="35%" stopColor="white" stopOpacity="1" />
              <stop offset="65%" stopColor="white" stopOpacity="1" />
              <stop offset="85%" stopColor="white" stopOpacity="0.65" />
              <stop offset="100%" stopColor="white" stopOpacity="0.06" />
            </linearGradient>
            <mask id={`${gridId}-vertical-fade`}>
              <rect width="100%" height="100%" fill={`url(#${gridId}-edges)`} />
            </mask>
            <mask id={`${gridId}-fade`}>
              <rect
                width="100%"
                height="100%"
                fill={`url(#${gridId}-strength)`}
                mask={`url(#${gridId}-vertical-fade)`}
              />
            </mask>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${gridId})`} mask={`url(#${gridId}-fade)`} />
        </svg>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-semibold uppercase"
              style={{
                borderColor: `rgba(${subscription.is_trial ? warningStatusRaw : activeStatusRaw}, 0.25)`,
                background: `rgba(${subscription.is_trial ? warningStatusRaw : activeStatusRaw}, 0.1)`,
                color: `rgb(${subscription.is_trial ? warningStatusRaw : activeStatusRaw})`,
              }}
            >
              {subscription.is_trial ? (
                <GiftIcon className="h-3 w-3" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
              )}
              {t(subscription.is_trial ? 'subscription.trialStatusShort' : 'subscription.active')}
            </span>
            {!subscription.is_trial && (
              <span
                className="min-w-0 rounded-lg border px-2 py-1 text-xs font-medium uppercase"
                style={{
                  borderColor: contrast.innerBorder,
                  background: contrast.innerBackground,
                  color: contrast.secondary,
                }}
              >
                <span className="line-clamp-2 break-words">
                  {subscription.tariff_name || t('subscription.currentPlan')}
                </span>
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => refreshTrafficMutation.mutate(subscription.id)}
            disabled={refreshing || trafficRefreshCooldown > 0}
            className="flex min-h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-xl px-2 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            style={{ color: contrast.secondary }}
            aria-label={
              trafficRefreshCooldown > 0
                ? `${t('common.refresh')}: ${trafficRefreshCooldown}s`
                : t('common.refresh')
            }
            title={
              trafficRefreshCooldown > 0
                ? `${t('common.refresh')}: ${trafficRefreshCooldown}s`
                : t('common.refresh')
            }
            data-traffic-refresh
          >
            <RefreshIcon className={refreshing ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
            {trafficRefreshCooldown > 0 ? `${trafficRefreshCooldown}s` : t('common.refresh')}
          </button>
        </div>
        <h2 id="subscription-summary-title" className="sr-only">
          {t(
            subscription.is_trial
              ? 'dashboard.subscriptionTrialTitle'
              : 'dashboard.subscriptionActiveTitle',
          )}
        </h2>

        <div
          className="mt-2 grid grid-cols-2 border-t pt-3"
          style={{ borderColor: contrast.innerBorder }}
        >
          <div className="min-w-0 pe-3 sm:pe-5">
            <div
              className="mb-1 flex items-center gap-2 text-xs font-medium"
              style={{ color: contrast.secondary }}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{ background: contrast.innerBackground }}
              >
                <CalendarIcon className="h-4 w-4" />
              </span>
              {t('dashboard.remaining')}
            </div>
            <div
              className="flex flex-wrap items-baseline gap-1 text-2xl font-bold tracking-tight sm:text-3xl"
              style={{ color: daysLeft <= 3 ? `rgb(${warningStatusRaw})` : contrast.primary }}
            >
              <span>{daysLeft}</span>
              <span className="text-lg">{t('subscription.daysShort')}</span>
            </div>
            <div className="mt-1 text-xs" style={{ color: contrast.secondary }}>
              {t('dashboard.validUntil', { date: formattedDate })}
            </div>
          </div>
          <div
            className="min-w-0 border-s ps-3 sm:ps-5"
            style={{ borderColor: contrast.innerBorder }}
          >
            <div
              className="mb-1 flex items-center gap-2 text-xs font-medium"
              style={{ color: contrast.secondary }}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                style={{ background: contrast.innerBackground }}
              >
                <ChartIcon className="h-4 w-4" />
              </span>
              {t('subscription.traffic')}
            </div>
            {isUnlimited ? (
              <div
                className="break-words text-xl font-bold tracking-tight sm:text-3xl"
                style={{ color: contrast.primary }}
              >
                {t('dashboard.unlimited')}
              </div>
            ) : (
              <div
                className="text-2xl font-bold tracking-tight sm:text-3xl"
                style={{ color: zoneColor }}
                data-traffic-percentage
              >
                {animatedPercent.toFixed(0)}
                <span className="text-lg">%</span>
              </div>
            )}
            <div className="mt-1 break-words text-xs" style={{ color: contrast.secondary }}>
              {formatTraffic(usedGb)} /{' '}
              {isUnlimited ? (
                <span className="inline-block align-baseline text-base leading-none">∞</span>
              ) : (
                formatTraffic(subscription.traffic_limit_gb)
              )}
            </div>
          </div>
        </div>

        {!isUnlimited && (
          <div className="mt-2">
            <TrafficProgressBar
              usedGb={usedGb}
              limitGb={subscription.traffic_limit_gb}
              percent={usedPercent}
              isUnlimited={false}
              compact
              inverseSurface={!isDark}
            />
          </div>
        )}

        <div className="mt-3">
          <SubscriptionPrimaryAction
            subscription={subscription}
            onManageSubscription={onManageSubscription}
            managementOpen={managementOpen}
            neutralSurface
          />
        </div>
      </section>
      <SubscriptionActiveActions
        subscription={subscription}
        connectedDevices={connectedDevices}
        devicesError={devicesError}
        connectionUrl={connectionUrl}
        connectionLinkLoading={connectionLinkLoading}
        connectionUrlCopied={connectionUrlCopied}
        onCopyConnectionUrl={onCopyConnectionUrl}
        onOpenConnectionQr={onOpenConnectionQr}
        onConnectDevice={onConnectDevice}
        onManageDevices={onManageDevices}
        onRetryDevices={onRetryDevices}
        devicesOpen={devicesOpen}
        onManageSubscription={onManageSubscription}
        managementOpen={managementOpen}
        showManagementAction={false}
      />
    </div>
  );
}
