import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronRightIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

export function ConnectionSelectionCard({
  label,
  name,
  icon,
  expanded,
  onToggle,
  ...attributes
}: {
  label: string;
  name: string;
  icon: ReactNode;
  expanded?: boolean;
  onToggle?: () => void;
  'data-selected-platform'?: boolean;
}) {
  const { t } = useTranslation();
  const Surface = onToggle ? 'button' : 'div';
  return (
    <Surface
      {...attributes}
      {...(onToggle
        ? { type: 'button' as const, onClick: onToggle, 'aria-expanded': expanded }
        : {})}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-2xl border border-accent-500/50 bg-accent-500/10 p-2.5 text-start',
        onToggle &&
          'transition-colors hover:bg-accent-500/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500',
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400 [&>svg]:h-6 [&>svg]:w-6"
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block break-words text-xs font-semibold uppercase tracking-[0.14em] text-accent-400">
          {label}
        </span>
        <span className="mt-0.5 block break-words text-base leading-5 font-semibold text-dark-100">
          {name}
        </span>
      </span>
      {onToggle && (
        <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-dark-300 sm:text-sm">
          {t('subscription.connection.changeSelection', 'Change')}
          <ChevronRightIcon
            aria-hidden="true"
            className={cn('h-4 w-4', expanded ? 'rotate-90' : 'rtl:rotate-180')}
          />
        </span>
      )}
    </Surface>
  );
}
