import { useId, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import guardianWelcome from '@/assets/cabinet-robot/guardian-welcome.webp';
import guardianWelcomeGift from '@/assets/cabinet-robot/guardian-welcome-gift.webp';
import guardianTraffic from '@/assets/cabinet-robot/guardian-traffic.webp';
import guardianPaused from '@/assets/cabinet-robot/guardian-paused.webp';
import guardianDisabled from '@/assets/cabinet-robot/guardian-disabled.webp';
import type { DashboardSubscriptionScenario } from '@/utils/subscriptionHelpers';
import guardian from '@/assets/cabinet-robot/guardian-full.webp';
import expiredTrialGuardian from '@/assets/cabinet-robot/guardian-trial-expired.webp';
import expiredPaidGuardian from '@/assets/cabinet-robot/guardian-paid-expired.webp';
import {
  ChartIcon,
  ClockIcon,
  DevicesIcon,
  ExclamationIcon,
  GiftIcon,
  InfinityIcon,
  TariffsIcon,
} from '@/components/icons';
import TrafficProgressBar from '@/components/dashboard/TrafficProgressBar';
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber';
import type { Subscription, TrafficAccountingSummary } from '@/types';
import { formatTraffic } from '@/utils/formatTraffic';
import { hasUnknownManagedTraffic } from '@/utils/trafficAccounting';
import { uiLocale } from '@/utils/uiLocale';
import { formatDateOrRaw } from '@/utils/format';
import { cn } from '@/lib/utils';
import ManagedTrafficSummary from './ManagedTrafficSummary';
import { SubscriptionIdentityBadges } from './SubscriptionIdentityBadges';
import './SubscriptionHero.css';
import './SubscriptionHero.management.css';

export type SubscriptionHeroTraffic = TrafficAccountingSummary & {
  traffic_used_gb: number;
  traffic_used_percent: number;
  is_unlimited: boolean;
};

function SubscriptionHeroMetric({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="subscription-hero-metric">
      <span className="subscription-hero-icon" aria-hidden="true">
        {icon}
      </span>
      <dt className="text-xs leading-[14px]">{label}</dt>
      <dd className="min-w-0 break-words text-[clamp(12px,3.65vw,14px)] font-bold leading-4 text-champagne-50">
        {value}
      </dd>
    </div>
  );
}

const managementPortraits = {
  expired: expiredPaidGuardian,
  'expired-trial': expiredTrialGuardian,
  limited: guardianTraffic,
  paused: guardianPaused,
  disabled: guardianDisabled,
};

export function SubscriptionHero({
  subscription,
  trafficData,
  action,
  layout = 'dashboard',
  managementState,
}: {
  subscription: Subscription;
  trafficData: SubscriptionHeroTraffic | null;
  action?: ReactNode;
  layout?: 'dashboard' | 'management';
  managementState?: keyof typeof managementPortraits;
}) {
  const { t, i18n } = useTranslation();
  const planId = useId();
  const management = layout === 'management';
  const state = management ? managementState : undefined;
  const portrait = state ? managementPortraits[state] : undefined;
  const usedPercent = trafficData?.traffic_used_percent ?? subscription.traffic_used_percent;
  const unknownTraffic = hasUnknownManagedTraffic(subscription, trafficData);
  const unlimited = trafficData?.is_unlimited ?? subscription.traffic_limit_gb === 0;
  const usedGb = trafficData?.traffic_used_gb ?? subscription.traffic_used_gb;
  const reduceMotion = useReducedMotion();
  const animatedPercent = useAnimatedNumber(usedPercent, reduceMotion ? 0 : undefined);
  const { days_left: days, end_date: endDate } = subscription;
  const date = management
    ? formatDateOrRaw(endDate, i18n?.language ?? 'ru', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : endDate && new Date(endDate).toLocaleDateString(uiLocale());

  return (
    <section
      aria-labelledby={management ? planId : 'subscription-summary-title'}
      className={cn(
        'subscription-hero',
        management && 'subscription-hero--management',
        state && 'subscription-hero--management-inactive',
        state && `subscription-hero--management-${state}`,
      )}
    >
      {!management && (
        <h2 id="subscription-summary-title" className="sr-only">
          {t(
            subscription.is_trial
              ? 'dashboard.subscriptionTrialTitle'
              : 'dashboard.subscriptionActiveTitle',
          )}
        </h2>
      )}
      <SubscriptionHeroArtwork portrait={portrait} />
      <div className="subscription-hero-badges">
        <SubscriptionIdentityBadges
          subscription={subscription}
          planAsHeading={management}
          planId={management ? planId : undefined}
        />
      </div>
      <div className="subscription-hero-term">
        {management ? (
          <>
            <p className="mb-1 text-xs">
              {t(
                subscription.is_expired || subscription.status === 'expired'
                  ? 'subscription.renewExpiredValid'
                  : 'subscription.renewCurrentValid',
              )}
            </p>
            <time dateTime={endDate || undefined} className="subscription-hero-date">
              {date ? t('subscription.renewUntil', { date }) : '—'}
            </time>
          </>
        ) : (
          <>
            <p className="text-xs">{t('dashboard.remaining')}</p>
            <p className="my-1 flex flex-wrap items-baseline gap-1 text-[clamp(32px,9vw,42px)] font-bold leading-[1.12] tracking-tight">
              <span className={days <= 3 ? 'text-warning-300' : 'text-champagne-50'}>{days}</span>
              <span className="text-lg text-champagne-50">{t('subscription.daysShort')}</span>
            </p>
            <time dateTime={endDate || undefined} className="block text-xs">
              {t('dashboard.validUntil', { date: date || '—' })}
            </time>
          </>
        )}
      </div>
      <div className="subscription-hero-details">
        <dl className={management ? 'grid grid-cols-2 gap-2' : 'subscription-hero-metrics'}>
          <SubscriptionHeroMetric
            icon={unlimited && !unknownTraffic ? <InfinityIcon /> : <ChartIcon />}
            label={t('subscription.traffic')}
            value={
              state ? (
                subscription.traffic_limit_gb > 0 ? (
                  `${subscription.traffic_limit_gb} ${t('common.units.gb')}`
                ) : (
                  t('subscription.unlimited')
                )
              ) : unknownTraffic ? (
                '—'
              ) : unlimited ? (
                t('dashboard.unlimited')
              ) : (
                <span data-traffic-percentage>
                  {(reduceMotion ? usedPercent : animatedPercent).toFixed(0)}%
                </span>
              )
            }
          />
          <SubscriptionHeroMetric
            icon={<DevicesIcon />}
            label={t('subscription.devices')}
            value={
              subscription.device_limit > 0
                ? t('subscription.devices', { count: subscription.device_limit })
                : t('dashboard.unlimited')
            }
          />
        </dl>
        {!state && !unlimited && !unknownTraffic && (
          <div className="subscription-hero-usage">
            <div className="flex flex-wrap justify-between gap-x-2">
              <span>{t('dashboard.trafficUsageTitle')}</span>
              <span>
                {formatTraffic(usedGb)} / {formatTraffic(subscription.traffic_limit_gb)}
              </span>
            </div>
            <TrafficProgressBar
              usedGb={usedGb}
              limitGb={subscription.traffic_limit_gb}
              percent={usedPercent}
              isUnlimited={false}
              compact
              inverseSurface={!management}
            />
          </div>
        )}
        <ManagedTrafficSummary
          className="subscription-hero-managed"
          subscription={subscription}
          refreshed={trafficData}
        />
        {action}
      </div>
    </section>
  );
}

function SubscriptionHeroArtwork({ portrait = guardian }: { portrait?: string }) {
  return (
    <>
      <div className="subscription-hero-horizon" aria-hidden="true" />
      <div className="subscription-hero-portrait" aria-hidden="true">
        <img src={portrait} alt="" draggable={false} />
      </div>
    </>
  );
}

const scenarioPortraits = {
  'expired-trial': expiredTrialGuardian,
  'expired-paid': expiredPaidGuardian,
  'expired-daily': expiredPaidGuardian,
  limited: guardianTraffic,
  paused: guardianPaused,
  disabled: guardianDisabled,
  welcome: guardianWelcome,
  'welcome-trial': guardianWelcomeGift,
} as const;

export function SubscriptionScenarioHero({
  scenario,
  title,
  summary,
  action,
  className,
}: {
  scenario: DashboardSubscriptionScenario | 'welcome' | 'welcome-trial';
  title: string;
  summary?: ReactNode;
  action: ReactNode;
  className?: string;
}) {
  const titleId = useId();
  const Icon =
    scenario === 'limited'
      ? ExclamationIcon
      : scenario === 'welcome-trial'
        ? GiftIcon
        : scenario === 'welcome'
          ? TariffsIcon
          : ClockIcon;

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        'subscription-hero subscription-hero--scenario',
        scenario.startsWith('expired') && 'subscription-hero--expired',
        scenario === 'welcome-trial' && 'subscription-hero--welcome',
        scenario === 'expired-daily' && 'subscription-hero--expired-paid',
        `subscription-hero--${scenario}`,
        className,
      )}
    >
      <SubscriptionHeroArtwork portrait={scenarioPortraits[scenario]} />
      <div className="subscription-hero-term subscription-hero-expired-copy">
        <span className="subscription-hero-expired-icon" aria-hidden="true">
          <Icon className="h-5 w-5" />
        </span>
        <h2 id={titleId} className="subscription-hero-expired-title text-champagne-50">
          {title}
        </h2>
        {summary}
      </div>
      <div className="subscription-hero-details">{action}</div>
    </section>
  );
}
