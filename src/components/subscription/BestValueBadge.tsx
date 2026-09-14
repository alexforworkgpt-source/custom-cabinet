import { useTranslation } from 'react-i18next';
import { StarIcon } from '@/components/icons';

/** Shared semantic marker for the operator-recommended tariff or period. */
export function BestValueBadge({ className }: { className?: string }) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full bg-urgent-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-urgent-400 ${className ?? ''}`}
    >
      <StarIcon filled className="h-3 w-3" />
      {t('subscription.bestValue')}
    </span>
  );
}

export const BEST_VALUE_BORDER = 'rgb(var(--color-urgent-400))';
