import type { ComponentType } from 'react';
import {
  ArrowDownIcon,
  CalendarIcon,
  DevicesIcon,
  DocumentIcon,
  ServerIcon,
  TagIcon,
  WalletIcon,
} from '../../icons';

interface IconProps {
  className?: string;
}

interface PurchaseOrderSummaryProps {
  breakdown: { label: string; value: string }[];
  details?: Partial<Record<BreakdownKind, string>>;
  totalLabel: string;
  totalValue: string;
  originalTotalValue?: string | null;
  discountLabel?: string;
  discountValue?: string | null;
}

type BreakdownKind = 'devices' | 'traffic' | 'servers' | 'period' | 'other';

const breakdownMatchers: Array<[RegExp, BreakdownKind, ComponentType<IconProps>]> = [
  [/device|устрой|دستگاه|设备/i, 'devices', DevicesIcon],
  [/traffic|траф|ترافیک|流量/i, 'traffic', ArrowDownIcon],
  [/server|сервер|سرور|服务器/i, 'servers', ServerIcon],
  [/period|month|day|период|месяц|дн|دوره|روز|周期|天/i, 'period', CalendarIcon],
];

function getBreakdownPresentation(label: string) {
  const match = breakdownMatchers.find(([pattern]) => pattern.test(label));
  return match
    ? { kind: match[1], icon: match[2] }
    : { kind: 'other' as const, icon: DocumentIcon };
}

function RowIcon({
  icon: Icon,
  tone = 'accent',
}: {
  icon: ComponentType<IconProps>;
  tone?: 'accent' | 'success';
}) {
  return (
    <span
      data-order-summary-icon-tone={tone}
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
        tone === 'success'
          ? 'bg-success-500/10 text-success-400'
          : 'bg-accent-500/10 text-accent-400'
      }`}
    >
      <Icon className="h-4 w-4" />
    </span>
  );
}

export function PurchaseOrderSummary({
  breakdown,
  details,
  totalLabel,
  totalValue,
  originalTotalValue,
  discountLabel,
  discountValue,
}: PurchaseOrderSummaryProps) {
  return (
    <div data-order-summary className="w-full space-y-3 rounded-xl bg-dark-800/70 p-4 sm:p-5">
      {breakdown.map((item, idx) => {
        const { kind, icon: Icon } = getBreakdownPresentation(item.label);
        const detail = details?.[kind];
        return (
          <div
            key={`${item.label}-${idx}`}
            data-order-summary-row
            className="flex items-center gap-2.5 text-xs sm:gap-3 sm:text-sm"
          >
            <RowIcon icon={Icon} />
            <div className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 sm:gap-4">
              <span className="min-w-0 text-dark-300">{item.label}</span>
              {detail ? (
                <span data-order-summary-detail className="shrink-0 text-dark-200">
                  {detail}
                </span>
              ) : null}
              <span className="shrink-0 font-medium text-dark-100">{item.value}</span>
            </div>
          </div>
        );
      })}

      {discountLabel && discountValue ? (
        <div
          data-order-summary-row
          className="flex items-center gap-3 border-t border-dark-700/50 pt-3 text-sm"
        >
          <RowIcon icon={TagIcon} tone="success" />
          <span className="min-w-0 flex-1 text-success-400">{discountLabel}</span>
          <span className="shrink-0 font-medium text-success-400">{discountValue}</span>
        </div>
      ) : null}

      <div
        data-order-summary-row
        className="flex items-center gap-3 border-t border-dark-700/50 pt-3 text-sm"
      >
        <RowIcon icon={WalletIcon} />
        <span className="min-w-0 flex-1 font-semibold text-dark-200">{totalLabel}</span>
        <div className="shrink-0 text-right">
          <div className="text-xl font-bold text-accent-400">{totalValue}</div>
          {originalTotalValue ? (
            <div className="text-xs text-dark-500 line-through">{originalTotalValue}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
