import { uiLocale } from '@/utils/uiLocale';
import { useTranslation } from 'react-i18next';
import type { UseMutationResult } from '@tanstack/react-query';
import TrafficProgressBar from './TrafficProgressBar';
import Sparkline from './Sparkline';
import { useAnimatedNumber } from '../../hooks/useAnimatedNumber';
import { useTheme } from '../../hooks/useTheme';
import { useTrafficZone } from '../../hooks/useTrafficZone';
import { formatTraffic } from '../../utils/formatTraffic';
import { getGlassColors } from '../../utils/glassTheme';
import { CalendarIcon, CheckIcon, CopyIcon, RefreshIcon, SettingsIcon } from '@/components/icons';
import type { Subscription } from '../../types';
import { SubscriptionConnectFooter } from '../subscription/SubscriptionConnectFooter';
import { connectFooterState } from '../subscription/connectFooterState';

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
  const g = getGlassColors(isDark);

  const usedPercent = trafficData?.traffic_used_percent ?? subscription.traffic_used_percent;
  const usedGb = trafficData?.traffic_used_gb ?? subscription.traffic_used_gb;
  const isUnlimited = trafficData?.is_unlimited ?? subscription.traffic_limit_gb === 0;
  const zone = useTrafficZone(usedPercent);
  const animatedPercent = useAnimatedNumber(usedPercent);
  const connectState = connectFooterState({
    status: subscription.status,
    subscriptionUrl: subscription.subscription_url,
    deviceLimit: subscription.device_limit,
    connected: connectedDevices,
    hasError: devicesError,
  });

  const formattedDate = new Date(subscription.end_date).toLocaleDateString(uiLocale());
  const daysLeft = subscription.days_left;

  // Sparkline placeholder data (hidden until API provides daily usage)
  const dailyUsage: number[] = [];

  return (
    <section
      aria-labelledby="subscription-traffic-title"
      className="relative overflow-hidden rounded-3xl px-5 py-5 sm:px-6 lg:backdrop-blur-xl"
      style={{
        background: g.cardBg,
        border: subscription.is_trial
          ? '1px solid rgba(var(--color-accent-400), 0.15)'
          : isDark
            ? `1px solid ${g.cardBorder}`
            : `1px solid rgba(${zone.mainVarRaw}, 0.14)`,
        boxShadow: isDark
          ? g.shadow
          : `0 2px 16px rgba(${zone.mainVarRaw}, 0.07), 0 0 0 1px rgba(${zone.mainVarRaw}, 0.03)`,
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
                background: zone.mainVar,
                transition: 'background 0.6s ease',
              }}
              aria-hidden="true"
            />
            <span
              className="font-mono text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: zone.mainVar, transition: 'color 0.6s ease' }}
            >
              {isUnlimited ? t('dashboard.unlimited') : t(zone.labelKey)}
            </span>
            {subscription.is_trial && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-accent-400/25 bg-accent-400/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-accent-400">
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
              <span className="shrink-0 rounded-md border border-success-400/25 bg-success-400/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-widest text-success-400">
                {t('subscription.active')}
              </span>
            )}
          </div>

          {/* Title */}
          <h2
            id="subscription-traffic-title"
            className="text-lg font-bold tracking-tight text-dark-50"
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
              className="flex min-h-11 shrink-0 items-center justify-center gap-1 rounded-full px-2 text-[11px] font-medium text-dark-50/35 transition-colors hover:bg-dark-50/[0.05] hover:text-dark-50/50 disabled:cursor-not-allowed disabled:opacity-50"
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
                style={{ color: zone.mainVar }}
              >
                &#8734;
              </div>
            ) : (
              <div
                className="font-display text-[32px] font-extrabold leading-none tracking-tight text-dark-50"
                data-traffic-percentage
              >
                {animatedPercent.toFixed(0)}
                <span className="ml-px text-lg font-medium text-dark-50/35">%</span>
              </div>
            )}
          </div>
          <div className="mt-0.5 font-mono text-[11px] text-dark-50/30">
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
        />
      </div>

      <SubscriptionConnectFooter
        state={connectState}
        variant="prominent"
        className={connectionUrl ? 'mb-2' : 'mb-4'}
        managementOpen={devicesOpen}
        onConnect={onConnectDevice}
        onManage={onManageDevices}
        onRetry={onRetryDevices}
      />

      {connectionUrl && (
        <div className="mb-4 flex gap-2">
          <code
            className="flex min-h-11 min-w-0 flex-1 items-center rounded-[10px] px-3 py-2 font-mono text-[11px] text-dark-50/30"
            style={{
              background: g.codeBg,
              border: `1px solid ${g.codeBorder}`,
            }}
            title={connectionUrl}
          >
            <span className="block min-w-0 truncate whitespace-nowrap">{connectionUrl}</span>
          </code>
          <button
            type="button"
            onClick={onCopyConnectionUrl}
            className="group flex min-h-11 min-w-11 items-center justify-center rounded-[10px] px-3 transition-colors duration-300"
            style={{
              background: connectionUrlCopied
                ? 'rgba(var(--color-accent-400), 0.12)'
                : g.innerBorder,
              border: connectionUrlCopied
                ? '1px solid rgba(var(--color-accent-400), 0.2)'
                : `1px solid ${g.trackBg}`,
              color: connectionUrlCopied ? 'rgb(var(--color-accent-400))' : g.textMuted,
            }}
            aria-label={t('subscription.copyLink')}
            title={t('subscription.copyLink')}
          >
            {connectionUrlCopied ? (
              <CheckIcon />
            ) : (
              <CopyIcon className="transition-colors duration-200 group-hover:text-accent-400" />
            )}
          </button>
        </div>
      )}

      {/* ─── Stats row: Tariff + Days Left ─── */}
      <div className="mb-3 flex gap-2.5">
        {/* Tariff badge. Neutral chrome: the tariff name has
            no traffic-zone semantics, so tinting it by the traffic zone
            (DESIGN.md Status-Hue Lockout) was wrong. */}
        <div
          className="flex-1 rounded-[14px] p-3 transition-colors"
          style={{
            background: g.innerBg,
            border: `1px solid ${g.innerBorder}`,
          }}
        >
          <div
            className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: g.textFaint }}
          >
            {t('dashboard.tariff')}
          </div>
          <div className="min-w-0 truncate text-base font-bold leading-tight tracking-tight text-dark-50">
            {subscription.tariff_name || t('subscription.currentPlan')}
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-dark-50/30">
            {t('dashboard.validUntil', { date: formattedDate })}
          </div>
        </div>

        {/* Days remaining */}
        <div
          className="flex-1 rounded-[14px] p-3 transition-colors duration-300"
          style={{
            background: g.innerBg,
            border:
              daysLeft <= 3
                ? '1px solid rgba(var(--color-warning-400), 0.2)'
                : `1px solid ${g.innerBorder}`,
          }}
        >
          <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-dark-50/35">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-[7px] transition-colors duration-300"
              style={{
                background: daysLeft <= 3 ? 'rgba(var(--color-warning-400), 0.1)' : g.hoverBg,
              }}
            >
              <span
                style={{
                  color: daysLeft <= 3 ? 'rgb(var(--color-warning-400))' : g.textSecondary,
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
              style={{ color: daysLeft <= 3 ? 'rgb(var(--color-warning-400))' : g.text }}
            >
              {daysLeft}
            </span>
            <span className="text-xs font-medium text-dark-50/25">
              {t('subscription.daysShort')}
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={managementOpen}
        onClick={onManageSubscription}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] bg-accent-500/[0.06] px-4 py-3 text-center text-sm font-semibold text-dark-200 transition-colors hover:bg-accent-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950"
      >
        <SettingsIcon className="h-4 w-4 shrink-0 text-accent-400" />
        {t('dashboard.manageSubscription')}
      </button>

      {/* ─── Sparkline ─── */}
      {dailyUsage.length >= 2 && (
        <div
          className="rounded-[14px] p-3.5 pb-3"
          style={{ background: g.innerBg, border: `1px solid ${g.innerBorder}` }}
        >
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-[11px] font-medium uppercase tracking-wider text-dark-50/40">
              {t('dashboard.usageLast14Days')}
            </span>
            <span className="font-mono text-[11px] text-dark-50/25">
              {t('dashboard.maxUsage', { amount: formatTraffic(Math.max(...dailyUsage)) })}
            </span>
          </div>
          <Sparkline data={dailyUsage} width={440} height={44} color={zone.mainVar} />
        </div>
      )}
    </section>
  );
}
