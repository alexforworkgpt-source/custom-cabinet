import { Card } from '../data-display';
import { PeriodCardContent } from './PeriodCardContent';

/** Same typography and grid footprint as actual period cards, without selectable prices. */
export function PeriodOptionsSkeleton({
  count = 6,
  compact = false,
}: {
  count?: number;
  compact?: boolean;
}) {
  return (
    <div
      className="grid auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3"
      data-period-options-loading
    >
      {Array.from({ length: count }, (_, index) => (
        <Card
          key={index}
          size="sm"
          className={
            compact
              ? 'flex min-w-0 flex-col !px-1.5 !py-2 min-[375px]:!p-3 sm:!p-4'
              : 'flex min-w-0 flex-col sm:p-4'
          }
        >
          <PeriodCardContent label="" price="" periodDays={30} loading />
        </Card>
      ))}
    </div>
  );
}
