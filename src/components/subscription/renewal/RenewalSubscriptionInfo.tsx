import { useTranslation } from 'react-i18next';
import type { Subscription } from '../../../types';
import { Card } from '../../data-display';
import { renewalDeviceGuidance } from '../../../utils/renewalDeviceGuidance';
import { FundingNotice } from '../FundingNotice';
import { SubscriptionConditions } from '../SubscriptionConditions';
import { SubscriptionIdentityBadges } from '../SubscriptionIdentityBadges';

interface Props {
  subscription: Subscription;
  endDate: string | null;
  maxDeviceLimit?: number;
}

export function RenewalSubscriptionInfo({ subscription, endDate, maxDeviceLimit }: Props) {
  const { t } = useTranslation();
  const deviceHint = renewalDeviceGuidance(subscription, maxDeviceLimit);
  return (
    <Card className="space-y-4 text-sm" data-renewal-info>
      <SubscriptionIdentityBadges subscription={subscription} />
      <SubscriptionConditions subscription={subscription} endDate={endDate} />
      {deviceHint && <FundingNotice>{t(deviceHint)}</FundingNotice>}
    </Card>
  );
}
