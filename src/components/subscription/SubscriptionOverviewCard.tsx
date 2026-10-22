import { useTranslation } from 'react-i18next';
import type { Subscription } from '../../types';
import { formatDateOrRaw } from '../../utils/format';
import { Card } from '../data-display';
import { SubscriptionConditions } from './SubscriptionConditions';
import { SubscriptionIdentityBadges } from './SubscriptionIdentityBadges';

/** Compact read-only overview. Existing management retains its queries and actions. */
export function SubscriptionOverviewCard({ subscription }: { subscription: Subscription }) {
  const { i18n } = useTranslation();
  const endDate = formatDateOrRaw(subscription.end_date, i18n?.language ?? 'ru', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  return (
    <Card className="min-h-64 space-y-4 text-sm" data-subscription-overview>
      <SubscriptionIdentityBadges subscription={subscription} />
      <SubscriptionConditions subscription={subscription} endDate={endDate} serverFlagsOnly />
    </Card>
  );
}
