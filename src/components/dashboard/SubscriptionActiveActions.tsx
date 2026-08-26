import { useTranslation } from 'react-i18next';
import { CheckIcon, CopyIcon, SettingsIcon } from '@/components/icons';
import { useTheme } from '@/hooks/useTheme';
import { getGlassColors } from '@/utils/glassTheme';
import type { Subscription } from '@/types';
import { SubscriptionConnectFooter } from '../subscription/SubscriptionConnectFooter';
import { connectFooterState } from '../subscription/connectFooterState';

interface SubscriptionActiveActionsProps {
  subscription: Subscription;
  connectedDevices: number | undefined;
  devicesError: boolean;
  connectionUrl?: string | null;
  connectionUrlCopied?: boolean;
  onCopyConnectionUrl?: () => void;
  onConnectDevice: () => void;
  onManageDevices: () => void;
  onRetryDevices: () => void;
  devicesOpen: boolean;
  onManageSubscription: () => void;
  managementOpen: boolean;
}

export function SubscriptionActiveActions({
  subscription,
  connectedDevices,
  devicesError,
  connectionUrl,
  connectionUrlCopied = false,
  onCopyConnectionUrl,
  onConnectDevice,
  onManageDevices,
  onRetryDevices,
  devicesOpen,
  onManageSubscription,
  managementOpen,
}: SubscriptionActiveActionsProps) {
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const g = getGlassColors(isDark);
  const connectState = connectFooterState({
    status: subscription.status,
    subscriptionUrl: subscription.subscription_url,
    deviceLimit: subscription.device_limit,
    connected: connectedDevices,
    hasError: devicesError,
  });

  return (
    <>
      <SubscriptionConnectFooter
        state={connectState}
        variant="prominent"
        managementOpen={devicesOpen}
        onConnect={onConnectDevice}
        onManage={onManageDevices}
        onRetry={onRetryDevices}
      />

      {connectionUrl && (
        <div className="flex gap-2">
          <code
            className="flex min-h-11 min-w-0 flex-1 items-center rounded-[14px] bg-dark-900/95 px-3 py-2 font-mono text-[11px] lg:bg-dark-900/90"
            style={{
              border: `1px solid ${g.cardBorder}`,
              boxShadow: g.shadow,
              color: g.textMuted,
            }}
            title={connectionUrl}
          >
            <span className="block min-w-0 truncate whitespace-nowrap">{connectionUrl}</span>
          </code>
          <button
            type="button"
            onClick={onCopyConnectionUrl}
            className="group flex min-h-11 min-w-11 items-center justify-center rounded-[14px] bg-dark-900/95 px-3 transition-colors duration-300 lg:bg-dark-900/90"
            style={{
              background: connectionUrlCopied ? 'rgba(var(--color-accent-400), 0.12)' : undefined,
              border: connectionUrlCopied
                ? '1px solid rgba(var(--color-accent-400), 0.2)'
                : `1px solid ${g.cardBorder}`,
              boxShadow: g.shadow,
              color: connectionUrlCopied ? 'rgb(var(--color-accent-400))' : g.textMuted,
            }}
            aria-label={t('subscription.copyLink')}
            title={t('subscription.copyLink')}
          >
            {connectionUrlCopied ? (
              <CheckIcon />
            ) : (
              <CopyIcon className="transition-colors duration-200 group-hover:text-accent-400" />
            )}
          </button>
        </div>
      )}

      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={managementOpen}
        onClick={onManageSubscription}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-accent-400/20 bg-accent-500/15 px-4 py-3 text-center text-sm font-semibold text-accent-400 shadow-sm transition-[background-color,box-shadow,transform] duration-200 ease-out active:scale-[0.98] active:bg-accent-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950 motion-reduce:transform-none motion-reduce:transition-none md:hover:-translate-y-0.5 md:hover:bg-accent-500/20 md:hover:shadow-md"
      >
        <SettingsIcon className="h-4 w-4 shrink-0 text-accent-400" />
        {t('dashboard.manageSubscription')}
      </button>
    </>
  );
}
