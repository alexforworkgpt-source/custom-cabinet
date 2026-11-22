import { useTranslation } from 'react-i18next';
import type { PurchaseStep } from '../../../utils/subscriptionHelpers';
import { Skeleton } from '../../ui/skeleton';

export function ClassicPurchaseStepHeader({
  steps,
  index,
  loading = false,
}: {
  steps: PurchaseStep[];
  index: number;
  loading?: boolean;
}) {
  const { t } = useTranslation();
  return (
    <div className="mb-6 flex items-center justify-between gap-2">
      <div className="min-w-0 text-sm text-dark-400">
        {loading ? (
          <Skeleton className="h-5 w-20 max-w-full" />
        ) : (
          t('subscription.step', { current: index + 1, total: steps.length })
        )}
      </div>
      <div className="flex shrink-0 gap-2" data-classic-step-indicator>
        {steps.map((step, position) =>
          loading ? (
            <Skeleton key={step} className="h-1 w-8 rounded-full" />
          ) : (
            <span
              key={step}
              className={`h-1 w-8 rounded-full transition-colors ${position <= index ? 'bg-accent-500' : 'bg-dark-700'}`}
            />
          ),
        )}
      </div>
    </div>
  );
}
