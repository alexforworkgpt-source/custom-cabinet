import { useTranslation } from 'react-i18next';
import { ChevronRightIcon, DevicesIcon, RefreshIcon, WarningIcon } from '@/components/icons';
import { Button } from '@/components/primitives/Button';
import { cn } from '@/lib/utils';
import { HoverBorderGradient } from '../ui/hover-border-gradient';
import type { ConnectFooterState } from './connectFooterState';

interface SubscriptionConnectFooterProps {
  state: ConnectFooterState;
  variant?: 'compact' | 'prominent';
  borderColor?: string;
  mutedColor?: string;
  className?: string;
  managementOpen?: boolean;
  onConnect: () => void;
  onManage: () => void;
  onRetry: () => void;
}

export function SubscriptionConnectFooter({
  state,
  variant = 'compact',
  borderColor,
  mutedColor,
  className,
  managementOpen = false,
  onConnect,
  onManage,
  onRetry,
}: SubscriptionConnectFooterProps) {
  const { t } = useTranslation();
  const prominent = variant === 'prominent';

  if (state.kind === 'hidden') return null;

  if (state.kind === 'loading') {
    return (
      <div
        className={cn(
          prominent
            ? 'flex min-h-[60px] items-center gap-3 rounded-[14px] p-3'
            : 'flex min-h-11 items-center gap-2.5 border-t px-4 py-2.5',
          className,
        )}
        style={prominent ? undefined : { borderColor }}
        role="status"
        aria-label={t('common.loading')}
        data-onboarding={prominent ? 'connect-devices' : undefined}
      >
        <div className="skeleton h-9 w-9 shrink-0 rounded-[10px]" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="skeleton h-3.5 w-36 rounded" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
      </div>
    );
  }

  if (state.kind === 'error') {
    const errorContent = (
      <>
        <RefreshIcon className="h-4 w-4 shrink-0" />
        <span className="min-w-0 flex-1 text-left">
          <span className="block text-sm font-semibold">
            {t('dashboard.deviceUsageUnavailable')}
          </span>
          {prominent && (
            <span className="mt-0.5 block text-[11px] opacity-65">{t('common.retry')}</span>
          )}
        </span>
        <ChevronRightIcon className="h-4 w-4 shrink-0 opacity-50" />
      </>
    );

    if (prominent) {
      return (
        <Button
          type="button"
          variant="destructive"
          size="lg"
          fullWidth
          onClick={onRetry}
          data-onboarding="connect-devices"
          className={cn(
            'min-h-[60px] justify-start gap-3 rounded-[14px] border-error-500/20 bg-error-500/10 p-3 text-error-300 hover:bg-error-500/15',
            className,
          )}
        >
          {errorContent}
        </Button>
      );
    }

    return (
      <Button
        type="button"
        variant="ghost"
        size="lg"
        fullWidth
        onClick={onRetry}
        className={cn(
          'justify-start gap-2.5 rounded-none border-t px-4 py-2.5 text-error-400 hover:bg-error-500/10',
          className,
        )}
        style={{ borderColor }}
      >
        {errorContent}
      </Button>
    );
  }

  const full = state.kind === 'full';
  const highlight = state.kind === 'connect' && state.highlight;
  const counter =
    state.kind === 'connect' && state.unlimited
      ? `${state.used} · ∞`
      : `${state.used} / ${state.limit}`;
  const action = full ? onManage : onConnect;
  const label = full ? t('subscription.myDevices') : t('dashboard.connectDevice');
  const detail = full
    ? t('dashboard.deviceLimitReached')
    : state.unlimited
      ? t('dashboard.devicesConnectedUnlimited', { used: state.used })
      : t('dashboard.devicesOfMax', { used: state.used, max: state.limit });

  if (prominent) {
    return (
      <HoverBorderGradient
        as="button"
        onClick={action}
        aria-haspopup="dialog"
        aria-expanded={full ? managementOpen : undefined}
        className={cn(
          'connect-device-gradient-button flex min-h-[60px] w-full items-center justify-start gap-3 rounded-[14px] p-3 text-left transition-shadow duration-300',
          className,
        )}
        data-onboarding="connect-devices"
        style={{ fontFamily: 'inherit' }}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-on-accent/15 text-on-accent">
          {full ? <WarningIcon className="h-4 w-4" /> : <DevicesIcon className="h-4 w-4" />}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold tracking-tight text-on-accent">{label}</span>
          <span className="mt-0.5 block text-[11px] text-on-accent/65">{detail}</span>
        </span>
        <span className="shrink-0 font-mono text-xs tabular-nums text-on-accent/70">{counter}</span>
        <ChevronRightIcon className="h-4 w-4 shrink-0 text-on-accent/60 rtl:rotate-180" />
      </HoverBorderGradient>
    );
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="lg"
      fullWidth
      onClick={action}
      aria-haspopup="dialog"
      aria-expanded={full ? managementOpen : undefined}
      className={cn(
        'justify-start gap-2.5 rounded-none border-t px-4 py-2.5 text-left hover:bg-accent-500/10',
        className,
      )}
      style={{ borderColor }}
    >
      {full ? (
        <WarningIcon className="h-4 w-4 shrink-0 text-warning-400" />
      ) : (
        <DevicesIcon
          className={cn('h-4 w-4 shrink-0', highlight ? 'text-accent-400' : 'opacity-40')}
        />
      )}
      <span
        className={cn(
          'text-[13px] font-medium',
          full && 'text-warning-400',
          highlight && 'text-accent-400',
        )}
        style={full || highlight ? undefined : { color: mutedColor }}
      >
        {label}
      </span>
      <span
        className={cn('ms-auto text-[11px] tabular-nums', full && 'text-warning-400')}
        style={full ? undefined : { color: mutedColor }}
      >
        {counter}
      </span>
      <ChevronRightIcon className="h-3.5 w-3.5 shrink-0 opacity-30 rtl:rotate-180" />
    </Button>
  );
}
