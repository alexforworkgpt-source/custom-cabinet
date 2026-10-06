import { useTranslation } from 'react-i18next';
import { StarIcon } from '@/components/icons';

/** Shared semantic marker for the operator-recommended tariff or period. */
export function BestValueBadge({
  className,
  iconOnly = false,
}: {
  className?: string;
  iconOnly?: boolean;
}) {
  const { t } = useTranslation();

  return (
    <span
      role={iconOnly ? 'img' : undefined}
      aria-label={iconOnly ? t('subscription.bestValue') : undefined}
      title={iconOnly ? t('subscription.bestValue') : undefined}
      className={`inline-flex items-center text-urgent-400 ${iconOnly ? 'shrink-0' : 'gap-1 rounded-full bg-urgent-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide'} ${className ?? ''}`}
    >
      {iconOnly ? (
        <span aria-hidden="true" className="inline-flex">
          <StarIcon filled className="h-4 w-4" />
        </span>
      ) : (
        <StarIcon filled className="h-3 w-3" />
      )}
      {!iconOnly && t('subscription.bestValue')}
    </span>
  );
}

export const BEST_VALUE_BORDER = 'rgb(var(--color-urgent-400))';
