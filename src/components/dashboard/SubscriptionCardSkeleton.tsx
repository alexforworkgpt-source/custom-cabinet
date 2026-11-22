import type { SubscriptionListItem } from '@/types';
import { needsTariff } from '@/utils/legacySubscription';
import { hasUnknownManagedTraffic } from '@/utils/trafficAccounting';
import { uiLocale } from '@/utils/uiLocale';
import { useTranslation } from 'react-i18next';
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton';
import ManagedTrafficSummary from '../subscription/ManagedTrafficSummary';
import { connectFooterState } from '../subscription/connectFooterState';

/** Reserve the known sections of the selected subscription while details load. */
export default function SubscriptionCardSkeleton({
  subscription,
  hideSubscriptionLink = false,
}: {
  subscription?: SubscriptionListItem;
  hideSubscriptionLink?: boolean;
}) {
  const { t } = useTranslation();
  if (
    !subscription ||
    !['active', 'trial', 'expired', 'disabled', 'limited'].includes(subscription.status)
  ) {
    return (
      <SkeletonGroup>
        <h2 className="sr-only">{t('dashboard.yourSubscription')}</h2>
        <Skeleton variant="card" className="h-36" />
      </SkeletonGroup>
    );
  }
  const showConnection =
    connectFooterState({
      status: subscription.status,
      subscriptionUrl: subscription.subscription_url,
      deviceLimit: subscription.device_limit,
      connected: undefined,
    }).kind !== 'hidden';
  if (['expired', 'disabled', 'limited'].includes(subscription.status)) {
    return (
      <InactiveSubscriptionSkeleton subscription={subscription} showConnection={showConnection} />
    );
  }
  const showTrafficProgress =
    subscription.traffic_limit_gb > 0 && !hasUnknownManagedTraffic(subscription);
  return (
    <SkeletonGroup className="space-y-3">
      <section className="overflow-hidden rounded-3xl border border-dark-700/60 bg-dark-900 px-5 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-2" aria-hidden="true">
          <div className="flex min-w-0 gap-2">
            <Skeleton className="h-7 w-20 rounded-lg" />
            {!subscription.is_trial && <Skeleton className="h-7 w-24 rounded-lg" />}
          </div>
          <Skeleton className="h-11 w-20 shrink-0 rounded-xl" />
        </div>
        <h2 className="sr-only">{t('dashboard.yourSubscription')}</h2>
        <div className="mt-2 grid grid-cols-2 border-t border-dark-700/60 pt-3" aria-hidden="true">
          <div className="min-w-0 pe-3 sm:pe-5">
            <Skeleton className="mb-1 h-8 w-3/4 rounded-xl" />
            <Skeleton className="h-8 w-20 rounded sm:h-9" />
            <Skeleton className="mt-1 h-4 w-24 rounded" />
          </div>
          <div className="min-w-0 border-s border-dark-700/60 ps-3 sm:ps-5">
            <Skeleton className="mb-1 h-8 w-3/4 rounded-xl" />
            <Skeleton className="h-8 w-full rounded" />
          </div>
        </div>
        {showTrafficProgress && <Skeleton className="mt-2 h-2 w-full rounded-full" />}
        {subscription.traffic_accounting_mode === 'managed' && (
          <div aria-hidden="true" className="relative">
            <div className="invisible">
              <ManagedTrafficSummary subscription={subscription} />
            </div>
            <Skeleton className="absolute inset-0 h-full" />
          </div>
        )}
        <Skeleton className="mt-3 h-12 w-full rounded-[14px]" />
      </section>
      {showConnection && (
        <div
          className="flex min-h-[72px] items-center gap-3 rounded-[14px] bg-dark-900 p-3"
          aria-hidden="true"
        >
          <Skeleton className="h-9 w-9 shrink-0 rounded-[10px]" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-36 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        </div>
      )}
      {!hideSubscriptionLink &&
        (subscription.subscription_url || subscription.subscription_crypto_link) && (
          <div className="flex min-h-11 gap-2" aria-hidden="true">
            <Skeleton className="min-w-0 flex-1 rounded-[14px]" />
            <Skeleton className="w-11 shrink-0 rounded-[14px]" />
            <Skeleton className="w-11 shrink-0 rounded-[14px]" />
          </div>
        )}
    </SkeletonGroup>
  );
}

function InactiveSubscriptionSkeleton({
  subscription,
  showConnection,
}: {
  subscription: SubscriptionListItem;
  showConnection: boolean;
}) {
  const { t } = useTranslation();
  const limited = subscription.status === 'limited';
  const showAction = limited || !subscription.is_trial || needsTariff(subscription);
  return (
    <SkeletonGroup className="motion-safe:animate-pulse">
      <h2 className="sr-only">{t('dashboard.yourSubscription')}</h2>
      <div className="rounded-3xl border border-dark-700/60 px-5 py-5 sm:px-6">
        <div className="mb-4 flex min-h-11 items-center gap-3">
          <Skeleton animate={false} className="h-11 w-11 shrink-0 rounded-[14px]" />
          <Skeleton animate={false} className="h-6 w-2/3" />
        </div>
        {limited && (
          <div className="relative mb-4 text-sm">
            <p className="invisible" aria-hidden="true">
              {t('subscription.trafficLimitedDescription')}
            </p>
            <Skeleton animate={false} className="absolute inset-0 h-full" />
          </div>
        )}
        <div className="relative mb-4 rounded-[14px] border border-transparent px-3.5 py-3">
          <div className="invisible flex items-center justify-between" aria-hidden="true">
            <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center">
              <div className="mb-0.5 font-mono text-[10px] font-medium uppercase tracking-wider">
                {limited
                  ? t('dashboard.expired.activeUntil')
                  : t('dashboard.expired.expiredDate', {
                      context: subscription.is_trial ? 'trial' : '',
                    })}
              </div>
              <div className="mt-0.5 whitespace-nowrap text-base font-bold tracking-tight sm:ml-3 sm:mt-0">
                {subscription.end_date
                  ? new Date(subscription.end_date).toLocaleDateString(uiLocale())
                  : '—'}
              </div>
            </div>
            <span className="ml-3 shrink-0 text-[10px] font-medium uppercase">
              {t('dashboard.expired.balance')}
            </span>
          </div>
          <Skeleton animate={false} className="absolute inset-0 h-full" />
        </div>
        <div className="flex">
          {showAction && <Skeleton animate={false} className="h-[50.5px] rounded-[14px]" />}
        </div>
        {limited && showConnection && (
          <Skeleton animate={false} className="mt-3 h-[72px] rounded-[14px]" />
        )}
        <Skeleton animate={false} className="mt-3 h-[46px] rounded-[14px]" />
      </div>
    </SkeletonGroup>
  );
}
