import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { BestValueBadge } from './BestValueBadge';

interface Props {
  label: ReactNode;
  periodDays: number;
  price: string;
  originalPrice?: string | null;
  monthlyPrice?: string | null;
  discountPercent?: number | null;
  discountClassName?: string;
  highlighted?: boolean;
  compactHighlight?: boolean;
}

/** Presentation only: callers retain pricing and selection behavior. */
export function PeriodCardContent({
  label,
  periodDays,
  price,
  originalPrice,
  monthlyPrice,
  discountPercent,
  discountClassName = 'bg-success-500 text-white',
  highlighted,
  compactHighlight = false,
}: Props) {
  const { t } = useTranslation();
  const priceCaption =
    monthlyPrice ??
    (periodDays === 30
      ? `${price}/${t('subscription.month')}`
      : periodDays > 0 && periodDays < 30
        ? t('subscription.priceForPeriod', { count: periodDays })
        : null);
  return (
    <>
      <span className="flex items-start justify-between gap-0.5 sm:gap-1.5">
        <span className="min-w-0 break-words text-xs font-semibold leading-5 text-dark-100 min-[375px]:text-sm sm:text-base sm:leading-6">
          {label}
        </span>
        <span
          className={`flex shrink-0 items-center sm:gap-1 ${compactHighlight ? 'gap-0' : 'gap-0.5'}`}
        >
          {highlighted && compactHighlight && <BestValueBadge iconOnly />}
          {!!discountPercent && discountPercent > 0 && (
            <span
              className={`shrink-0 rounded-full px-1 py-0.5 text-xs font-medium leading-4 sm:px-1.5 ${discountClassName}`}
            >
              -{discountPercent}%
            </span>
          )}
        </span>
      </span>
      {highlighted && !compactHighlight && <BestValueBadge className="mt-1 self-start" />}
      <span className="mt-auto block pt-2">
        <span className="block break-words text-xl font-semibold leading-7 text-accent-400 sm:text-2xl sm:leading-8">
          {price}
        </span>
        <span className="block min-h-4 text-xs leading-4 text-dark-500 line-through">
          {originalPrice}
        </span>
        <div className="min-h-4 text-xs leading-4 text-dark-400">{priceCaption}</div>
      </span>
    </>
  );
}
