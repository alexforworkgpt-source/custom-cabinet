import { useState, type ReactNode } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Subscription } from '../../types';
import { subscriptionActionStyles as actionStyles } from './sheets/subscriptionActionStyles';
import { Skeleton, SkeletonSurface } from '../ui/skeleton';
import { SubscriptionPurchaseSkeleton } from './SubscriptionPurchaseSkeleton';
import {
  inactiveSubscriptionOverviewState,
  SubscriptionOverviewCard,
} from './SubscriptionOverviewCard';

import { PageEntrance } from '../motion/PageEntrance';
import { SubscriptionLoadingHeight } from './SubscriptionLoadingHeight';

export function SubscriptionManagementLayout({
  loading,
  overview,
  purchase,
  smoothLoading,
  children,
}: {
  loading?: { subscription: Subscription | null };
  overview?: ReactNode;
  purchase: ReactNode;
  smoothLoading: boolean;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const [startedCold] = useState(() => Boolean(loading && !loading.subscription));
  const keepInitial =
    startedCold &&
    reducedMotion &&
    Boolean(loading && inactiveSubscriptionOverviewState(loading.subscription));
  const known = loading && !keepInitial ? loading.subscription : null;
  const stage = !loading ? 'ready' : known ? 'known' : 'pending';
  const smooth = smoothLoading && !reducedMotion;

  return (
    <PageEntrance
      className={loading ? 'space-y-4 motion-safe:animate-pulse' : 'space-y-4'}
      data-subscription-management-loading={loading ? true : undefined}
      role={loading ? 'status' : undefined}
      aria-busy={loading ? true : undefined}
      aria-label={loading ? t('common.loading') : undefined}
    >
      <div className="space-y-4">
        <SubscriptionLoadingHeight stage={stage} smooth={smooth} overview>
          {loading ? (
            known ? (
              <SubscriptionOverviewCard subscription={known} measuring />
            ) : (
              <div className="space-y-4" data-subscription-overview-placeholder>
                <Skeleton
                  variant="card"
                  animate={false}
                  className="h-[239px] rounded-3xl sm:h-[228px]"
                />
                <Skeleton variant="card" animate={false} className="h-[41.5px] rounded-2xl" />
              </div>
            )
          ) : (
            overview
          )}
        </SubscriptionLoadingHeight>
        <SubscriptionLoadingHeight stage={stage} smooth={smooth}>
          {loading && !known ? <SubscriptionPurchaseSkeleton announce={false} /> : purchase}
        </SubscriptionLoadingHeight>
      </div>
      {loading && (
        <div data-subscription-devices-placeholder>
          <Skeleton variant="card" animate={false} className="h-16 sm:h-[78px]" />
        </div>
      )}
      {loading && !known && (
        <div
          className="rounded-3xl border border-dark-700/60 p-3"
          data-subscription-additional-options-placeholder
        >
          <Skeleton animate={false} className="h-5 w-44" />
          <div className="mt-2 space-y-2 sm:mt-3 sm:space-y-3">
            <Skeleton variant="card" animate={false} className="h-16 rounded-xl sm:h-[82px]" />
            <Skeleton variant="card" animate={false} className="h-16 rounded-xl sm:h-[82px]" />
            <Skeleton variant="card" animate={false} className="h-16 rounded-xl" />
          </div>
        </div>
      )}
      {(!loading || !keepInitial) && children}
    </PageEntrance>
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
