import { useTranslation } from 'react-i18next';
import type { getGlassColors } from '../../utils/glassTheme';
import { cn } from '@/lib/utils';

interface Props {
  enabled: boolean;
  daysBefore: number;
  pending: boolean;
  onToggle: () => void;
  accentColor: string;
  glassColors: ReturnType<typeof getGlassColors>;
  compactOnMobile?: boolean;
}

/** Existing balance-autopay presentation; the management page owns the mutation. */
export function SubscriptionAutopayToggle({
  enabled,
  daysBefore,
  pending,
  onToggle,
  accentColor,
  glassColors: g,
  compactOnMobile = false,
}: Props) {
  const { t } = useTranslation();
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-[14px] p-3.5',
        compactOnMobile && 'gap-2 px-3 py-2 sm:gap-0 sm:p-3.5',
      )}
      style={{ background: g.innerBg, border: `1px solid ${g.innerBorder}` }}
    >
      <div className={compactOnMobile ? 'min-w-0' : undefined}>
        <div className="text-sm font-semibold text-dark-50">{t('subscription.autoRenewal')}</div>
        <div className="mt-0.5 text-[11px] text-dark-500">
          {t('subscription.daysBeforeExpiry', { count: daysBefore })}
        </div>
      </div>
      <button
        onClick={onToggle}
        disabled={pending}
        role="switch"
        aria-checked={enabled}
        aria-label={t('subscription.autopay', 'Auto-payment')}
        className={cn(
          'relative h-7 w-[52px] rounded-full',
          compactOnMobile && 'h-11 shrink-0 sm:h-7',
        )}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-1/2 h-7 w-[52px] -translate-y-1/2 rounded-full transition-colors duration-300"
          style={{ background: enabled ? accentColor : g.textGhost }}
        >
          <span
            className="absolute left-[3px] top-[3px] h-[22px] w-[22px] rounded-full bg-white transition-transform duration-300"
            style={{
              transform: enabled ? 'translateX(23px)' : 'translateX(0)',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }}
          />
        </span>
      </button>
    </div>
  );
}
