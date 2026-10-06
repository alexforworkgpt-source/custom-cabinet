import { useTranslation } from 'react-i18next';
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton';

/** Reserve the same status, metrics, management, connection and link areas as the loaded card. */
export default function SubscriptionCardSkeleton() {
  const { t } = useTranslation();
  return (
    <SkeletonGroup className="space-y-3">
      <section className="overflow-hidden rounded-3xl border border-dark-700/60 bg-dark-900 px-5 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-2" aria-hidden="true">
          <div className="flex min-w-0 gap-2">
            <Skeleton className="h-7 w-20 rounded-lg" />
            <Skeleton className="h-7 w-24 rounded-lg" />
          </div>
          <Skeleton className="h-11 w-20 shrink-0 rounded-xl" />
        </div>
        <h2 className="sr-only">{t('dashboard.yourSubscription')}</h2>
        <div className="mt-2 grid grid-cols-2 border-t border-dark-700/60 pt-3" aria-hidden="true">
          <div className="min-w-0 pe-3 sm:pe-5">
            <Skeleton className="mb-1 h-8 w-3/4 rounded-xl" />
            <Skeleton className="h-8 w-20 rounded" />
            <Skeleton className="mt-1 h-4 w-24 rounded" />
          </div>
          <div className="min-w-0 border-s border-dark-700/60 ps-3 sm:ps-5">
            <Skeleton className="mb-1 h-8 w-3/4 rounded-xl" />
            <Skeleton className="h-8 w-full rounded" />
          </div>
        </div>
        <Skeleton className="mt-3 min-h-11 w-full rounded-[14px]" />
      </section>
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
      <div className="flex min-h-11 gap-2" aria-hidden="true">
        <Skeleton className="min-w-0 flex-1 rounded-[14px]" />
        <Skeleton className="w-11 shrink-0 rounded-[14px]" />
        <Skeleton className="w-11 shrink-0 rounded-[14px]" />
      </div>
    </SkeletonGroup>
  );
}
