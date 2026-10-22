import { useTranslation } from 'react-i18next';
import type { Subscription } from '../../types';
import { CalendarIcon, ChartIcon, DevicesIcon, ServerIcon } from '../icons';
import { getFlagEmoji } from '../../utils/subscriptionHelpers';

interface Props {
  subscription: Subscription;
  endDate: string | null;
  serverFlagsOnly?: boolean;
}

/** Shared read-only conditions for management and renewal; no queries or actions. */
export function SubscriptionConditions({ subscription, endDate, serverFlagsOnly = false }: Props) {
  const { t } = useTranslation();
  const servers = subscription.servers ?? [];
  return (
    <div className="space-y-4">
      {endDate && (
        <div className="flex items-start gap-3">
          <span aria-hidden="true" className="shrink-0 text-accent-400">
            <CalendarIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-dark-400">
              {t(
                subscription.is_expired || subscription.status === 'expired'
                  ? 'subscription.renewExpiredValid'
                  : 'subscription.renewCurrentValid',
              )}
            </p>
            <p className="mt-1 text-base font-semibold text-dark-100">
              <time dateTime={subscription.end_date}>
                {t('subscription.renewUntil', { date: endDate })}
              </time>
            </p>
          </div>
        </div>
      )}
      <dl className="grid grid-cols-2 gap-2">
        <div className="min-w-0 rounded-xl bg-accent-500/10 p-3">
          <dt className="flex items-start gap-2 text-xs text-dark-400">
            <span aria-hidden="true" className="shrink-0 text-accent-400">
              <ChartIcon className="h-4 w-4" />
            </span>
            {t('subscription.traffic')}
          </dt>
          <dd className="mt-0.5 break-words font-semibold text-dark-100 min-[375px]:ms-6">
            {subscription.traffic_limit_gb || t('subscription.unlimited')}
            {subscription.traffic_limit_gb > 0 && ` ${t('common.units.gb')}`}
          </dd>
        </div>
        <div className="min-w-0 rounded-xl bg-accent-500/10 p-3">
          <dt className="flex items-start gap-2 text-xs text-dark-400">
            <span aria-hidden="true" className="shrink-0 text-accent-400">
              <DevicesIcon className="h-4 w-4" />
            </span>
            {t('subscription.devices')}
          </dt>
          <dd className="mt-0.5 break-words font-semibold text-dark-100 min-[375px]:ms-6">
            {subscription.device_limit
              ? t('subscription.devices', { count: subscription.device_limit })
              : t('subscription.unlimited')}
          </dd>
        </div>
      </dl>
      {servers.length > 0 && (
        <dl className="border-t border-dark-700/65 pt-4">
          <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3">
            <dt className="flex items-start gap-2 text-xs text-dark-400">
              <span aria-hidden="true" className="shrink-0 text-accent-400">
                <ServerIcon className="h-4 w-4" />
              </span>
              {t('subscription.serversLabel')}
            </dt>
            <dd className="min-w-0 break-words text-end text-xs font-medium leading-relaxed text-dark-200">
              {servers.map((server, index) => (
                <span key={server.uuid} title={server.name}>
                  {index > 0 && ' · '}
                  {serverFlagsOnly ? getFlagEmoji(server.country_code) || server.name : server.name}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}
