import type { Subscription, SubscriptionListItem } from '@/types';
import {
  dashboardScenarioHasManagement,
  dashboardSubscriptionScenario,
  dashboardSubscriptionScenarioTitle,
} from '@/utils/subscriptionHelpers';
import { needsTariff } from '@/utils/legacySubscription';
import { hasUnknownManagedTraffic } from '@/utils/trafficAccounting';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton';
import ManagedTrafficSummary from '../subscription/ManagedTrafficSummary';
import { connectFooterState } from '../subscription/connectFooterState';

type LoadingSubscription = Subscription | SubscriptionListItem;

/** Reserve the known sections of the selected subscription while details load. */
export default function SubscriptionCardSkeleton({
  subscription,
  hideSubscriptionLink = false,
  welcome = false,
}: {
  subscription?: LoadingSubscription;
  hideSubscriptionLink?: boolean;
  welcome?: boolean;
}) {
  const { t } = useTranslation();
  const scenario = dashboardSubscriptionScenario(subscription);
  const limited = scenario === 'limited';
  const showConnection =
    !subscription ||
    connectFooterState({
      status: subscription.status,
      subscriptionUrl: subscription.subscription_url,
      deviceLimit: subscription.device_limit,
      connected: undefined,
    }).kind !== 'hidden';

  if (scenario || welcome) {
    return (
      <SkeletonGroup className={limited ? 'space-y-3' : undefined}>
        <section
          className={cn(
            'subscription-hero subscription-hero--scenario subscription-hero-loading',
            scenario?.startsWith('expired') && 'subscription-hero--expired',
            `subscription-hero--${scenario ?? 'welcome'}`,
          )}
        >
          <h2 className="sr-only">{t('dashboard.yourSubscription')}</h2>
          <div className="subscription-hero-term subscription-hero-expired-copy" aria-hidden="true">
            <Skeleton className="h-8 w-8 rounded-[9px]" />
            <div className="relative max-w-full">
              <p className="subscription-hero-expired-title invisible">
                {t(
                  scenario
                    ? dashboardSubscriptionScenarioTitle[scenario]
                    : 'dashboard.welcomeNoName',
                )}
              </p>
              <Skeleton className="absolute inset-0 h-full w-full" />
            </div>
            {scenario && scenario !== 'disabled' && <Skeleton className="h-4 w-24 max-w-full" />}
          </div>
          <div className="subscription-hero-details" aria-hidden="true">
            {limited && (
              <div className="relative">
                <p className="subscription-hero-scenario-note invisible">
                  {t('subscription.trafficLimitedDescription')}
                </p>
                <Skeleton className="absolute inset-0 h-full w-full" />
              </div>
            )}
            {(welcome || limited || needsTariff(subscription) || !subscription?.is_trial) && (
              <Skeleton className="h-11 rounded-[14px]" />
            )}
            {scenario && dashboardScenarioHasManagement(scenario) && (
              <Skeleton
                className={
                  scenario === 'expired-trial' ? 'h-11 rounded-[14px]' : 'h-[46px] rounded-[14px]'
                }
              />
            )}
          </div>
        </section>
        {limited && showConnection && (
          <div aria-hidden="true">
            <Skeleton className="h-[72px] rounded-[14px]" />
          </div>
        )}
      </SkeletonGroup>
    );
  }

  const showTrafficProgress =
    !subscription || (subscription.traffic_limit_gb > 0 && !hasUnknownManagedTraffic(subscription));
  return (
    <SkeletonGroup className="space-y-3">
      <section className="subscription-hero subscription-hero-loading">
        <h2 className="sr-only">{t('dashboard.yourSubscription')}</h2>
        <div className="subscription-hero-badges flex min-w-0 flex-wrap gap-2" aria-hidden="true">
          <Skeleton className="h-[26px] w-16 rounded-lg" />
          {!subscription?.is_trial && <Skeleton className="h-[26px] w-20 rounded-lg" />}
        </div>
        <div className="subscription-hero-term space-y-1" aria-hidden="true">
          <Skeleton className="h-4 w-16 rounded" />
          <Skeleton className="h-9 w-20 rounded" />
          <Skeleton className="h-4 w-24 rounded" />
        </div>
        <div className="subscription-hero-details" aria-hidden="true">
          <Skeleton className="h-[58px] rounded-[13px]" />
          {showTrafficProgress && <Skeleton className="h-[46px] rounded-[11px]" />}
          {subscription?.traffic_accounting_mode === 'managed' && (
            <div className="relative">
              <div className="invisible">
                <ManagedTrafficSummary subscription={subscription} />
              </div>
              <Skeleton className="absolute inset-0 h-full" />
            </div>
          )}
          <Skeleton className="h-11 rounded-[14px]" />
        </div>
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
        (!subscription ||
          subscription.subscription_url ||
          ('subscription_crypto_link' in subscription &&
            subscription.subscription_crypto_link)) && (
          <div className="flex min-h-11 gap-2" aria-hidden="true">
            <Skeleton className="min-w-0 flex-1 rounded-[14px]" />
            <Skeleton className="w-11 shrink-0 rounded-[14px]" />
            <Skeleton className="w-11 shrink-0 rounded-[14px]" />
          </div>
        )}
    </SkeletonGroup>
  );
}
