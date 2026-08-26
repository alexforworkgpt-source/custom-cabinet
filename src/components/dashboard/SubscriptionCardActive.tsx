import { uiLocale } from '@/utils/uiLocale';
import { useTranslation } from 'react-i18next';
import type { UseMutationResult } from '@tanstack/react-query';
import TrafficProgressBar from './TrafficProgressBar';
import Sparkline from './Sparkline';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';
import { useTheme } from '../../hooks/useTheme';
import { useTrafficZone } from '../../hooks/useTrafficZone';
import { formatTraffic } from '../../utils/formatTraffic';
import { CalendarIcon, RefreshIcon, TagIcon } from '@/components/icons';
import type { Subscription } from '../../types';
import { SubscriptionActiveActions } from './SubscriptionActiveActions';

interface SubscriptionCardActiveProps {
  subscription: Subscription;
  trafficData: {
    traffic_used_gb: number;
    traffic_used_percent: number;
    is_unlimited: boolean;
  } | null;
  refreshTrafficMutation: UseMutationResult<unknown, unknown, void, unknown>;
  trafficRefreshCooldown: number;
  connectedDevices: number | undefined;
  devicesError: boolean;
  connectionUrl?: string | null;
  connectionUrlCopied?: boolean;
  onCopyConnectionUrl?: () => void;
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
  connectionUrlCopied = false,
  onCopyConnectionUrl,
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
  const trialStatusRaw = `var(--color-accent-${contrastStatusShade})`;
  const warningStatusRaw = `var(--color-warning-${contrastStatusShade})`;
  const animatedPercent = useAnimatedNumber(usedPercent);

  const formattedDate = new Date(subscription.end_date).toLocaleDateString(uiLocale());
  const daysLeft = subscription.days_left;

  // Sparkline placeholder data (hidden until API provides daily usage)
  const dailyUsage: number[] = [];

  return (
    <div className="space-y-3">
      <section
        aria-labelledby="subscription-traffic-title"
        className="relative overflow-hidden rounded-3xl px-5 py-5 sm:px-6"
        style={{
          background: contrast.background,
          border: `1px solid ${contrast.border}`,
          boxShadow: contrast.shadow,
        }}
      >
        {/* Decorative trial-shimmer border + ambient background glow removed.
          Trial state is conveyed by the badge in the header; ambient glow
          carried no information and ate visual attention. */}

        {/* ─── Header ─── */}
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0 flex-1">
            {/* Zone indicator */}
            <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
              <div
                className="h-2 w-2 shrink-0 rounded-full"
                style={{
                  background: zoneColor,
                  transition: 'background 0.6s ease',
                }}
                aria-hidden="true"
              />
              <span
                className="font-mono text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: zoneColor, transition: 'color 0.6s ease' }}
              >
                {isUnlimited ? t('dashboard.unlimited') : t(zone.labelKey)}
              </span>
              {subscription.is_trial && (
                <span
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest"
                  style={{
                    borderColor: `rgba(${trialStatusRaw}, 0.25)`,
                    background: `rgba(${trialStatusRaw}, 0.1)`,
                    color: `rgb(${trialStatusRaw})`,
                  }}
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path
                      d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  {t('subscription.trialStatus')}
                </span>
              )}
              {!subscription.is_trial && (
                <span
                  className="shrink-0 rounded-md border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest"
                  style={{
                    borderColor: `rgba(${activeStatusRaw}, 0.25)`,
                    background: `rgba(${activeStatusRaw}, 0.1)`,
                    color: `rgb(${activeStatusRaw})`,
                  }}
                >
                  {t('subscription.active')}
                </span>
              )}
            </div>

            {/* Title */}
            <h2
              id="subscription-traffic-title"
              className="text-lg font-bold tracking-tight"
              style={{ color: contrast.primary }}
            >
              {t('dashboard.trafficUsageTitle')}
            </h2>
          </div>

          {/* Big percentage / infinity */}
          <div className="shrink-0 text-right">
            <div className="flex items-center justify-end gap-1.5">
              <button
                type="button"
                onClick={() => refreshTrafficMutation.mutate()}
                disabled={refreshTrafficMutation.isPending || trafficRefreshCooldown > 0}
                className="flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-full px-2 text-[11px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                style={{ color: contrast.muted }}
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
                <RefreshIcon
                  className={`h-4 w-4 ${refreshTrafficMutation.isPending ? 'animate-spin' : ''}`}
                />
                {trafficRefreshCooldown > 0 ? `${trafficRefreshCooldown}s` : t('common.refresh')}
              </button>
              {isUnlimited ? (
                <div
                  className="font-display text-2xl font-extrabold leading-none tracking-tight"
                  style={{ color: zoneColor }}
                >
                  &#8734;
                </div>
              ) : (
                <div
                  className="font-display text-[32px] font-extrabold leading-none tracking-tight"
                  style={{ color: contrast.primary }}
                  data-traffic-percentage
                >
                  {animatedPercent.toFixed(0)}
                  <span className="ml-px text-lg font-medium" style={{ color: contrast.muted }}>
                    %
                  </span>
                </div>
              )}
            </div>
            <div className="mt-0.5 font-mono text-[11px]" style={{ color: contrast.faint }}>
              {isUnlimited
                ? `${formatTraffic(usedGb)} ${t('dashboard.usedSuffix')}`
                : `${formatTraffic(usedGb)} / ${formatTraffic(subscription.traffic_limit_gb)}`}
            </div>
          </div>
        </div>

        {/* ─── Progress Bar ─── */}
        <div className="mb-4">
          <TrafficProgressBar
            usedGb={usedGb}
            limitGb={subscription.traffic_limit_gb}
            percent={usedPercent}
            isUnlimited={isUnlimited}
            compact
            inverseSurface={!isDark}
          />
        </div>

        {/* ─── Stats row: Tariff + Days Left ─── */}
        <div className="flex gap-2.5 border-t pt-4" style={{ borderColor: contrast.innerBorder }}>
          {/* Tariff badge. Neutral chrome: the tariff name has
            no traffic-zone semantics, so tinting it by the traffic zone
            (DESIGN.md Status-Hue Lockout) was wrong. */}
          <div
            className="flex-1 p-3 transition-colors"
            style={{
              borderTop: `1px solid ${contrast.innerBorder}`,
              borderRight: 'none',
              borderBottom: 'none',
              borderLeft: 'none',
            }}
          >
            <div
              className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: contrast.muted }}
            >
              <div
                className="flex h-6 w-6 items-center justify-center rounded-[7px]"
                style={{ background: contrast.hoverBackground }}
              >
                <span style={{ color: contrast.secondary }} aria-hidden="true">
                  <TagIcon className="h-[13px] w-[13px]" />
                </span>
              </div>
              {t('dashboard.tariff')}
            </div>
            <div
              className="min-w-0 truncate text-base font-bold leading-tight tracking-tight"
              style={{ color: contrast.primary }}
            >
              {subscription.tariff_name || t('subscription.currentPlan')}
            </div>
            <div className="mt-0.5 font-mono text-[10px]" style={{ color: contrast.faint }}>
              {t('dashboard.validUntil', { date: formattedDate })}
            </div>
          </div>

          <div
            className="my-2 w-px shrink-0 self-stretch"
            style={{ background: contrast.innerBorder }}
            aria-hidden="true"
          />

          {/* Days remaining */}
          <div
            className="flex-1 p-3 transition-colors duration-300"
            style={{
              borderTop:
                daysLeft <= 3
                  ? `1px solid rgba(${warningStatusRaw}, 0.22)`
                  : `1px solid ${contrast.innerBorder}`,
              borderLeft: 'none',
              borderRight: 'none',
              borderBottom: 'none',
            }}
          >
            <div
              className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider"
              style={{ color: contrast.muted }}
            >
              <div
                className="flex h-6 w-6 items-center justify-center rounded-[7px] transition-colors duration-300"
                style={{
                  background:
                    daysLeft <= 3 ? `rgba(${warningStatusRaw}, 0.12)` : contrast.hoverBackground,
                }}
              >
                <span
                  style={{
                    color: daysLeft <= 3 ? `rgb(${warningStatusRaw})` : contrast.secondary,
                  }}
                  aria-hidden="true"
                >
                  <CalendarIcon className="h-[13px] w-[13px]" />
                </span>
              </div>
              {t('dashboard.remaining')}
            </div>
            <div className="flex items-baseline gap-1">
              <span
                className="text-[22px] font-bold tracking-tight transition-colors duration-300"
                style={{
                  color: daysLeft <= 3 ? `rgb(${warningStatusRaw})` : contrast.primary,
                }}
              >
                {daysLeft}
              </span>
              <span className="text-xs font-medium" style={{ color: contrast.faint }}>
                {t('subscription.daysShort')}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Sparkline ─── */}
        {dailyUsage.length >= 2 && (
          <div
            className="mt-3 rounded-[14px] p-3.5 pb-3"
            style={{
              background: contrast.innerBackground,
              border: `1px solid ${contrast.innerBorder}`,
            }}
          >
            <div className="mb-2.5 flex items-center justify-between">
              <span
                className="text-[11px] font-medium uppercase tracking-wider"
                style={{ color: contrast.muted }}
              >
                {t('dashboard.usageLast14Days')}
              </span>
              <span className="font-mono text-[11px]" style={{ color: contrast.faint }}>
                {t('dashboard.maxUsage', { amount: formatTraffic(Math.max(...dailyUsage)) })}
              </span>
            </div>
            <Sparkline data={dailyUsage} width={440} height={44} color={zoneColor} />
          </div>
        )}
      </section>

      <SubscriptionActiveActions
        subscription={subscription}
        connectedDevices={connectedDevices}
        devicesError={devicesError}
        connectionUrl={connectionUrl}
        connectionUrlCopied={connectionUrlCopied}
        onCopyConnectionUrl={onCopyConnectionUrl}
        onConnectDevice={onConnectDevice}
        onManageDevices={onManageDevices}
        onRetryDevices={onRetryDevices}
        devicesOpen={devicesOpen}
        onManageSubscription={onManageSubscription}
        managementOpen={managementOpen}
      />
    </div>
  );
}
