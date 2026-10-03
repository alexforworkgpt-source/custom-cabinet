import { useTranslation } from 'react-i18next';
import type { Subscription } from '../../../types';
import { Card } from '../../data-display';
import { CalendarIcon, DevicesIcon, RefreshIcon, ServerIcon, TrafficIcon } from '../../icons';

interface Props {
  subscription: Subscription;
  endDate: string | null;
  isClassic: boolean;
}

export function RenewalSubscriptionInfo({ subscription, endDate, isClassic }: Props) {
  const { t } = useTranslation();
  return (
    <Card className="space-y-3 text-sm text-dark-400" data-renewal-info>
      {endDate && (
        <p className="flex items-start gap-2 font-medium text-dark-100">
          <span aria-hidden="true" className="shrink-0 text-accent-400">
            <CalendarIcon className="h-5 w-5" />
          </span>
          <span>{t('subscription.renewCurrentEnd', { date: endDate })}</span>
        </p>
      )}
      {isClassic && (
        <p className="flex items-start gap-2">
          <span aria-hidden="true" className="shrink-0 text-accent-400">
            <RefreshIcon className="h-5 w-5" />
          </span>
          <span>{t('subscription.classicRenewHint')}</span>
        </p>
      )}
      <p className="flex items-start gap-2">
        <span aria-hidden="true" className="shrink-0 text-accent-400">
          <TrafficIcon className="h-5 w-5" />
        </span>
        <span>
          {t('subscription.traffic')}:{' '}
          {subscription.traffic_limit_gb || t('subscription.unlimited')}
          {subscription.traffic_limit_gb > 0 && ` ${t('common.units.gb')}`}
        </span>
      </p>
      <p className="flex items-start gap-2">
        <span aria-hidden="true" className="shrink-0 text-accent-400">
          <DevicesIcon className="h-5 w-5" />
        </span>
        <span>
          {t('subscription.devices')}: {subscription.device_limit || t('subscription.unlimited')}
        </span>
      </p>
      {subscription.servers.length > 0 && (
        <p className="flex items-start gap-2">
          <span aria-hidden="true" className="shrink-0 text-accent-400">
            <ServerIcon className="h-5 w-5" />
          </span>
          <span>
            {t('subscription.serversLabel')}:{' '}
            {subscription.servers.map((server) => server.name).join(', ')}
          </span>
        </p>
      )}
    </Card>
  );
}
