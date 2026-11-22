import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { Subscription } from '../../types';
import { subscriptionActionStyles as actionStyles } from './sheets/subscriptionActionStyles';
import { Skeleton, SkeletonGroup, SkeletonSurface } from '../ui/skeleton';
import { SubscriptionPurchaseSkeleton } from './SubscriptionPurchaseSkeleton';
import { SubscriptionOverviewCard } from './SubscriptionOverviewCard';

export function SubscriptionManagementSkeleton({
  subscription,
  purchase,
  children,
}: {
  subscription: Subscription | null;
  purchase: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div data-subscription-management-loading>
      <SkeletonGroup className="space-y-4 motion-safe:animate-pulse">
        <div data-subscription-overview-skeleton>
          {subscription ? (
            <SkeletonSurface>
              <SubscriptionOverviewCard subscription={subscription} measuring />
            </SkeletonSurface>
          ) : (
            <Skeleton variant="card" animate={false} className="h-64" />
          )}
        </div>
        {subscription ? purchase : <SubscriptionPurchaseSkeleton announce={false} />}
        <div data-subscription-devices-placeholder>
          <Skeleton variant="card" animate={false} className="h-16 sm:h-20" />
        </div>
        {children}
      </SkeletonGroup>
    </div>
  );
}

export function SubscriptionAddonsSkeleton({
  subscription,
  showDevices,
  showTraffic,
  isDark,
}: {
  subscription: Subscription;
  showDevices: boolean;
  showTraffic: boolean;
  isDark: boolean;
}) {
  const { t } = useTranslation();
  const actions = [
    ...(showDevices
      ? [
          {
            title: t('subscription.additionalOptions.buyDevices'),
            description: t('subscription.additionalOptions.currentDeviceLimit', {
              count: subscription.device_limit,
            }),
          },
          {
            title: t('subscription.additionalOptions.reduceDevices'),
            description: t('subscription.additionalOptions.reduceDevicesDescription'),
          },
        ]
      : []),
    ...(showTraffic
      ? [
          {
            title: t('subscription.additionalOptions.buyTraffic'),
            description: t('subscription.additionalOptions.currentTrafficLimit', {
              limit: subscription.traffic_limit_gb,
              used: subscription.traffic_used_gb.toFixed(1),
            }),
          },
        ]
      : []),
  ];
  return (
    <div
      className="rounded-3xl border border-dark-700/60 p-3"
      data-subscription-additional-options-skeleton
    >
      <div className="invisible text-sm font-semibold tracking-tight" aria-hidden="true">
        {t('subscription.additionalOptions.title')}
      </div>
      <div className="mt-2 space-y-2 sm:mt-3 sm:space-y-3">
        {actions.map(({ title, description }) => (
          <div key={title} data-subscription-addon-placeholder>
            <SkeletonSurface>
              <div className={actionStyles.trigger(isDark, true)}>
                <div className={actionStyles.row(true)}>
                  <div className={actionStyles.text(true)}>
                    <div className={actionStyles.title(true)}>{title}</div>
                    <div className={actionStyles.description(true)}>{description}</div>
                  </div>
                  <span className="h-5 w-5 shrink-0" />
                </div>
              </div>
            </SkeletonSurface>
          </div>
        ))}
        <div data-subscription-addon-placeholder>
          <SkeletonSurface>
            <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
              <div>
                <div className="text-sm font-medium">{t('subscription.revoke.button')}</div>
                <div className="mt-0.5 text-xs">{t('subscription.revoke.description')}</div>
              </div>
              <span className="h-5 w-5 shrink-0" />
            </div>
          </SkeletonSurface>
        </div>
      </div>
    </div>
  );
}
