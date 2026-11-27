import { useTranslation } from 'react-i18next';
import type { Subscription } from '../../types';
import { formatDateOrRaw } from '../../utils/format';
import { Card } from '../data-display';
import { SubscriptionConditions, SubscriptionServers } from './SubscriptionConditions';
import { SubscriptionHero, type SubscriptionHeroTraffic } from './SubscriptionHero';
import { SubscriptionIdentityBadges } from './SubscriptionIdentityBadges';

import ManagedTrafficSummary from './ManagedTrafficSummary';

export function inactiveSubscriptionOverviewState(subscription: Subscription | null) {
  if (!subscription) return;

  const expired = subscription.is_expired || subscription.status === 'expired';
  if (subscription.is_daily && expired) return 'expired' as const;
  if (subscription.is_daily && subscription.is_daily_paused) return 'paused' as const;
  if (subscription.status === 'disabled') return 'disabled' as const;
  if (subscription.is_daily_paused) return;

  if (expired) return subscription.is_trial ? 'expired-trial' : 'expired';
  if (subscription.is_limited || subscription.status === 'limited') return 'limited' as const;
}

/** Compact read-only overview. Existing management retains its queries and actions. */

export function SubscriptionOverviewCard({
  subscription,
  measuring = false,
  refreshed,
}: {
  subscription: Subscription;
  measuring?: boolean;
  refreshed?: SubscriptionHeroTraffic | null;
}) {
  const { i18n } = useTranslation();
  const expired = subscription.is_expired || subscription.status === 'expired';
  const limited = subscription.is_limited || subscription.status === 'limited';
  const suspended = subscription.is_daily_paused || subscription.status === 'disabled';
  const inactiveState = inactiveSubscriptionOverviewState(subscription);
  const endDate = formatDateOrRaw(subscription.end_date, i18n?.language ?? 'ru', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const active = subscription.is_active && !expired && !limited && !suspended;
  if (active || inactiveState) {
    return (
      <div className="space-y-4" data-subscription-overview={measuring ? undefined : true}>
        <SubscriptionHero
          subscription={subscription}
          trafficData={refreshed ?? null}
          layout="management"
          managementState={inactiveState}
        />
        <SubscriptionServers servers={subscription.servers} flagsOnly panel />
      </div>
    );
  }
  return (
    <Card
      className="min-h-64 space-y-4 text-sm"
      data-subscription-overview={measuring ? undefined : true}
    >
      <SubscriptionIdentityBadges subscription={subscription} />
      <SubscriptionConditions subscription={subscription} endDate={endDate} serverFlagsOnly />
      <ManagedTrafficSummary subscription={subscription} />
    </Card>
  );
}
