import type { ReactNode } from 'react';
import { Card } from '../data-display';
import { InfoIcon } from '../icons';
import { cn } from '@/lib/utils';

/** Informational next-step guidance, distinct from a failed payment alert. */
export function FundingNotice({
  children,
  action,
  className,
}: {
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Card
      size="sm"
      role="note"
      className={cn(
        'flex flex-col gap-3 rounded-xl border-accent-500/20 bg-accent-500/10 text-sm text-dark-300 shadow-none sm:flex-row sm:items-center',
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-start gap-2">
        <span aria-hidden="true" className="mt-0.5 shrink-0 text-accent-400">
          <InfoIcon className="h-4 w-4" />
        </span>
        <div className="min-w-0 leading-relaxed">{children}</div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Card>
  );
}
