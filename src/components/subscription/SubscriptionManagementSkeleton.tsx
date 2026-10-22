import { Card } from '../data-display';
import { Skeleton, SkeletonGroup } from '../ui/skeleton';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { PurchaseCTAPresentation } from './PurchaseCTAPresentation';

/** Same reserved footprint as the management purchase action, without a live link. */
export function SubscriptionPurchaseSkeleton({ children }: { children?: ReactNode }) {
  const { t } = useTranslation();
  return (
    <div className="relative" data-subscription-purchase-loading>
      <SkeletonGroup>
        <div className="invisible" aria-hidden="true">
          {children ?? (
            <PurchaseCTAPresentation
              title={t('subscription.extend')}
              hint={t('subscription.classicRenewHint')}
              reserveSpace
              compactOnMobile
            />
          )}
        </div>
        <Skeleton variant="card" className="absolute inset-0 h-full w-full" />
      </SkeletonGroup>
    </div>
  );
}

/** The page wrapper already owns the heading and back button. */
export function SubscriptionManagementSkeleton() {
  return (
    <div data-subscription-management-loading>
      <SkeletonGroup className="space-y-4">
        <Card className="min-h-64 space-y-4 text-sm" data-subscription-overview-skeleton>
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-[26px] w-20 rounded-lg" />
            <Skeleton className="h-[26px] w-36 rounded-lg" />
          </div>
          <div className="flex items-start gap-3">
            <Skeleton className="h-5 w-5 shrink-0" />
            <div className="min-w-0 flex-1 space-y-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-6 w-2/3" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[0, 1].map((item) => (
              <div key={item} className="min-w-0 rounded-xl bg-accent-500/10 p-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-0.5 h-5 w-2/3" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-dark-700/65 pt-4">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-20" />
          </div>
        </Card>
        <SubscriptionPurchaseSkeleton />
        <div data-subscription-devices-placeholder>
          <Skeleton variant="card" className="h-16 sm:h-20" />
        </div>
        <Card
          size="sm"
          className="space-y-2 sm:space-y-3 sm:p-4"
          data-subscription-additional-options-skeleton
        >
          <Skeleton className="h-5 w-40" />
          <Skeleton variant="card" className="h-16 sm:h-20" />
          <Skeleton variant="card" className="h-20" count={2} />
          <Skeleton variant="card" className="h-16" />
        </Card>
        <Skeleton variant="card" className="h-20 sm:h-24" />
      </SkeletonGroup>
    </div>
  );
}
