import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { TREND_STYLES } from './constants';
import { Skeleton } from '../ui/skeleton';

export interface StatCardDelta {
  /** Signed percent change vs the comparison period. */
  percent: number;
  trend: 'up' | 'down' | 'stable';
}

/** Soft tinted chip + matching value colour, in the spirit of the Remnawave stats. */
const TONE = {
  neutral: { chip: 'text-dark-300 tile-wide:bg-dark-700/60', value: 'text-dark-100' },
  success: { chip: 'text-success-400 tile-wide:bg-success-500/15', value: 'text-success-400' },
  accent: { chip: 'text-accent-400 tile-wide:bg-accent-500/15', value: 'text-accent-400' },
  warning: { chip: 'text-warning-400 tile-wide:bg-warning-500/15', value: 'text-warning-400' },
  error: { chip: 'text-error-400 tile-wide:bg-error-500/15', value: 'text-error-400' },
} as const;

const LONG_VALUE_CHARS = 11;

interface StatCardProps {
  className?: string;
  label?: string;
  labelClassName?: string;
  value?: string | number;

  icon?: ReactNode;
  /** Tints the icon chip and (unless valueClassName is set) the value colour. */
  tone?: keyof typeof TONE;
  valueClassName?: string;
  /** Optional secondary line shown under the value (e.g. a subtitle or context). */
  subValue?: string;
  /** When true, shows a skeleton placeholder instead of the value. */
  loading?: boolean;
  /** Accessible name announced while either value is loading. */
  loadingLabel?: string;
  /** Reserve the secondary value while it is being fetched. */
  subValueLoading?: boolean;
  /** Optional node rendered at the right edge of the label row (e.g. a chevron for nav cards). */
  trailing?: ReactNode;
  /** Optional period-over-period change shown under the value. */
  delta?: StatCardDelta | null;
}

export function StatCard({
  className,
  label,
  labelClassName,
  value,
  icon,
  tone = 'neutral',
  valueClassName,
  subValue,
  loading,
  loadingLabel,
  subValueLoading,
  trailing,
  delta,
}: StatCardProps) {
  const toneStyle = TONE[tone];
  const valueClass = valueClassName ?? toneStyle.value;
  const trendStyle = delta ? (TREND_STYLES[delta.trend] ?? TREND_STYLES.stable) : null;
  const longValue = value !== undefined && String(value).length > LONG_VALUE_CHARS;

  return (
    <div
      className={cn(
        'h-full rounded-xl border border-dark-700/60 bg-dark-900/90 p-3 shadow-[0_10px_24px_-22px_rgba(0,0,0,0.9)] transition-colors [container:stat-tile/inline-size] hover:border-dark-600/80 hover:bg-dark-800/85',
        className,
      )}
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-1.5 gap-y-1.5 tile-wide:gap-x-2.5">
        <div
          className={cn(
            'row-start-1 flex min-w-0 items-center justify-between gap-2',
            icon ? 'col-start-2 tile-wide:col-span-2 tile-wide:col-start-1' : 'col-span-2',
          )}
        >
          {loading && !label ? (
            <Skeleton className="h-[15px] w-24 sm:h-5" />
          ) : (
            <span
              className={cn(
                'line-clamp-2 hyphens-auto text-xs leading-tight text-dark-500 sm:text-sm',
                labelClassName,
              )}
            >
              {label}
            </span>
          )}
          {trailing}
        </div>
        {icon && (
          <span
            className={`col-start-1 row-start-1 flex h-4 w-4 shrink-0 items-center justify-center self-start rounded-lg tile-wide:row-start-2 tile-wide:h-9 tile-wide:w-9 tile-wide:self-center [&>svg]:h-4 [&>svg]:w-4 tile-wide:[&>svg]:h-5 tile-wide:[&>svg]:w-5 ${toneStyle.chip}`}
          >
            {icon}
          </span>
        )}
        <div
          className={cn(
            'col-span-2 row-start-2 min-w-0',
            icon && 'tile-wide:col-span-1 tile-wide:col-start-2',
          )}
          role={loading || subValueLoading ? 'status' : undefined}
          aria-label={loading || subValueLoading ? (loadingLabel ?? label) : undefined}
        >
          {loading ? (
            <Skeleton className="h-7 w-20 rounded" />
          ) : (
            <div
              className={cn(
                'font-semibold [overflow-wrap:anywhere] tile-wide:text-lg sm:tile-wide:text-xl',
                longValue ? 'text-[length:clamp(0.75rem,10cqi,1rem)]' : 'text-base',
                valueClass,
              )}
            >
              {value}
            </div>
          )}
          {subValueLoading ? (
            <Skeleton className="mt-0.5 h-4 w-24 rounded" />
          ) : (
            subValue && (
              <div className="text-xs text-dark-500 [overflow-wrap:anywhere]">{subValue}</div>
            )
          )}
        </div>
      </div>
      {trendStyle && delta && (
        <div className={`mt-1.5 text-xs font-medium ${trendStyle.className}`}>
          {trendStyle.arrow} {Math.abs(delta.percent)}%
        </div>
      )}
    </div>
  );
}
