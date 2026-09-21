import { useTranslation } from 'react-i18next';
import { CalendarIcon, TagIcon } from '@/components/icons';
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton';

/** The same three vertical areas as an active subscription: usage, actions, link. */
export default function SubscriptionCardSkeleton() {
  const { t } = useTranslation();

  return (
    <SkeletonGroup className="space-y-3">
      <section className="overflow-hidden rounded-3xl border border-dark-700/60 bg-dark-900 px-5 py-5 sm:px-6">
        <div className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <Skeleton className="mb-1 h-4 w-28 rounded" />
            <h2 className="text-lg font-bold tracking-tight text-dark-100">
              {t('dashboard.trafficUsageTitle')}
            </h2>
          </div>
          <div className="text-right" aria-hidden="true">
            <Skeleton className="ml-auto h-8 w-20 rounded" />
            <Skeleton className="mt-1 h-3 w-24 rounded" />
          </div>
        </div>
        <div className="mb-2.5 space-y-2" aria-hidden="true">
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-3 w-28 rounded" />
        </div>
        <div className="flex gap-2.5 pt-4">
          <div className="min-w-0 flex-1 border-t border-dark-700/60 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-dark-400">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-dark-800"
                aria-hidden="true"
              >
                <TagIcon className="h-[13px] w-[13px]" />
              </span>
              {t('dashboard.tariff')}
            </div>
            <Skeleton className="h-5 w-3/4 rounded" />
            <Skeleton className="mt-1 h-3 w-full rounded" />
          </div>
          <div className="my-2 w-px shrink-0 self-stretch bg-dark-700/60" aria-hidden="true" />
          <div className="min-w-0 flex-1 border-t border-dark-700/60 p-3">
            <div className="mb-1 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-dark-400">
              <span
                className="flex h-6 w-6 items-center justify-center rounded-[7px] bg-dark-800"
                aria-hidden="true"
              >
                <CalendarIcon className="h-[13px] w-[13px]" />
              </span>
              {t('dashboard.remaining')}
            </div>
            <Skeleton className="h-7 w-12 rounded" />
          </div>
        </div>
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
      <Skeleton className="min-h-11 w-full rounded-[14px]" />
    </SkeletonGroup>
  );
}
