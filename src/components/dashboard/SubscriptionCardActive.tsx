import { uiLocale } from '@/utils/uiLocale';
import { useTranslation } from 'react-i18next';
import type { UseMutationResult } from '@tanstack/react-query';
import TrafficProgressBar from './TrafficProgressBar';
import { SubscriptionTechGrid } from './SubscriptionTechGrid';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';
import { useTheme } from '../../hooks/useTheme';
import { useTrafficZone } from '../../hooks/useTrafficZone';
import { formatTraffic } from '../../utils/formatTraffic';
import { CalendarIcon, ChartIcon, GiftIcon, RefreshIcon, TariffsIcon } from '@/components/icons';
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
        <SubscriptionTechGrid />
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-semibold uppercase ${
                subscription.is_trial
                  ? 'border-warning-500/30 bg-warning-500/15 text-warning-200'
                  : ''
              }`}
              style={
                subscription.is_trial
                  ? undefined
                  : {
                      borderColor: `rgba(${activeStatusRaw}, 0.25)`,
                      background: `rgba(${activeStatusRaw}, 0.1)`,
                      color: `rgb(${activeStatusRaw})`,
                    }
              }
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
                className="flex min-w-0 items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium uppercase"
                style={{
                  borderColor: contrast.innerBorder,
                  background: contrast.innerBackground,
                  color: contrast.secondary,
                }}
              >
                <span aria-hidden="true" className="shrink-0">
                  <TariffsIcon className="h-3 w-3" />
                </span>
                <span className="min-w-0 line-clamp-2 break-words">
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
