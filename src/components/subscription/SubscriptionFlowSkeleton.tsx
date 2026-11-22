import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { PurchaseContext } from '../../hooks/usePurchaseContext';
import { Card } from '../data-display';
import { Skeleton, SkeletonGroup } from '../ui/skeleton';
import { PeriodOptionsSkeleton } from './PeriodOptionsSkeleton';
import { PurchaseContextBanners } from './purchase/PurchaseContextBanners';
import { RenewalPeriodHeading } from './renewal/RenewalOptions';

interface Props {
  mode: 'renewal' | 'classic' | 'tariffs' | 'unknown';
  context: PurchaseContext;
  count?: number;
  conditions?: ReactNode;
  stepHeader?: ReactNode;
}

/** Real headers stay outside this body. Unknown catalogue sizes remain placeholders. */
export function SubscriptionFlowSkeleton({ mode, context, count, conditions, stepHeader }: Props) {
  const { t } = useTranslation();
  const showContext = context.isLoading || context.promoGroupName || context.showTrialUpgrade;
  const previewContext =
    context.isLoading && !context.promoGroupName
      ? { ...context, promoGroupName: t('common.loading') }
      : context;
  return (
    <SkeletonGroup className={mode === 'renewal' ? 'space-y-4' : 'flex flex-col gap-6'}>
      {showContext && (
        <div className="relative" data-sales-context-loading>
          <div className="invisible" aria-hidden="true">
            <PurchaseContextBanners context={previewContext} measuring />
          </div>
          <Skeleton variant="card" className="absolute inset-0 h-full" />
        </div>
      )}
      {mode === 'renewal' ? (
        <>
          {conditions ? (
            <div className="relative" data-renewal-conditions-loading>
              <div className="invisible" aria-hidden="true">
                {conditions}
              </div>
              <Skeleton variant="card" className="absolute inset-0 h-full" />
            </div>
          ) : (
            <Skeleton variant="card" className="h-64" />
          )}
          <div className="space-y-3">
            <RenewalPeriodHeading showHint={(count ?? 0) > 1} />
            <PeriodOptionsSkeleton count={count ?? 1} compact />
            {count === 0 && (
              <Card>
                <Skeleton className="h-5 w-36" />
              </Card>
            )}
          </div>
          <Skeleton variant="card" className="h-44" />
        </>
      ) : mode === 'classic' && count !== 0 ? (
        <div className="space-y-6">
          {stepHeader}
          <div className="text-lg font-medium text-dark-100">{t('subscription.stepPeriod')}</div>
          <PeriodOptionsSkeleton count={count ?? 1} />
          <Skeleton variant="card" className="h-12" />
        </div>
      ) : mode === 'tariffs' && count ? (
        <div>
          {conditions && (
            <div className="invisible" aria-hidden="true">
              {conditions}
            </div>
          )}
          <div
            className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2"
            data-tariff-options-loading
          >
            {Array.from({ length: count }, (_, index) => (
              <Card key={index} size="sm" className="flex min-w-0 flex-col sm:p-4">
                <div className="mb-2 space-y-1">
                  <Skeleton className="h-6 w-1/2 sm:h-7" />
                  <Skeleton className="h-5 w-3/4" />
                </div>
                <div className="mb-2">
                  <Skeleton className="h-5 w-2/3" />
                </div>
                <div className="mt-auto border-t border-dark-700/50 pt-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="mt-2">
                  <Skeleton className="h-11 sm:h-9" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <Skeleton variant="card" className="h-24" />
      )}
    </SkeletonGroup>
  );
}
