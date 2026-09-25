import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
  CheckIcon,
  CopyIcon,
  QrCodeIcon,
  SettingsIcon,
  SubscriptionIcon,
} from '@/components/icons';
import { Button } from '@/components/primitives/Button';
import { Skeleton } from '@/components/ui/skeleton';
import { useTheme } from '@/hooks/useTheme';
import { getGlassColors } from '@/utils/glassTheme';
import type { Subscription } from '@/types';
import { SubscriptionConnectFooter } from '../subscription/SubscriptionConnectFooter';
import { connectFooterState } from '../subscription/connectFooterState';
import { needsTariff, tariffSelectionPath } from '@/utils/legacySubscription';

interface SubscriptionActiveActionsProps {
  subscription: Subscription;
  connectedDevices: number | undefined;
  devicesError: boolean;
  connectionUrl?: string | null;
  connectionLinkLoading?: boolean;
  connectionUrlCopied?: boolean;
  onCopyConnectionUrl?: () => void;
  onOpenConnectionQr: () => void;
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
  connectionLinkLoading = false,
  connectionUrlCopied = false,
  onCopyConnectionUrl,
  onOpenConnectionQr,
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
  const connectionActionClassName =
    'group flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-[14px] bg-dark-900/95 px-3 transition-colors duration-300 lg:bg-dark-900/90';
  const connectState = connectFooterState({
    status: subscription.status,
    subscriptionUrl: subscription.subscription_url,
    deviceLimit: subscription.device_limit,
    connected: connectedDevices,
    hasError: devicesError,
  });
  const requiresTariff = needsTariff(subscription);
  const primaryActionClassName =
    'flex min-h-11 w-full items-center justify-center gap-2 rounded-[14px] border border-accent-400/20 bg-[color-mix(in_srgb,rgba(var(--color-accent-500),0.80)_15%,rgba(var(--color-dark-900),0.80)_85%)] px-4 py-3 text-center text-sm font-semibold text-accent-400 shadow-sm transition-[background-color,box-shadow,transform] duration-200 ease-out active:scale-[0.98] active:bg-[color-mix(in_srgb,rgba(var(--color-accent-500),0.80)_25%,rgba(var(--color-dark-900),0.80)_75%)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950 motion-reduce:transform-none motion-reduce:transition-none md:hover:-translate-y-0.5 md:hover:bg-[color-mix(in_srgb,rgba(var(--color-accent-500),0.80)_20%,rgba(var(--color-dark-900),0.80)_80%)] md:hover:shadow-md lg:bg-[color-mix(in_srgb,rgba(var(--color-accent-500),0.85)_15%,rgba(var(--color-dark-900),0.85)_85%)] lg:hover:bg-[color-mix(in_srgb,rgba(var(--color-accent-500),0.85)_20%,rgba(var(--color-dark-900),0.85)_80%)] lg:active:bg-[color-mix(in_srgb,rgba(var(--color-accent-500),0.85)_25%,rgba(var(--color-dark-900),0.85)_75%)]';

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

      {connectionLinkLoading && !connectionUrl && (
        <div className="flex min-h-11 gap-2" role="status" aria-label={t('common.loading')}>
          <Skeleton className="min-w-0 flex-1 rounded-[14px]" />
          <Skeleton className="w-11 shrink-0 rounded-[14px]" />
          <Skeleton className="w-11 shrink-0 rounded-[14px]" />
        </div>
      )}

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
            className={connectionActionClassName}
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
          <Button
            type="button"
            variant="ghost"
            size={null}
            onClick={onOpenConnectionQr}
            className={connectionActionClassName}
            style={{
              border: `1px solid ${g.cardBorder}`,
              boxShadow: g.shadow,
              color: g.textMuted,
            }}
            aria-label={t('subscription.connection.openQr')}
            title={t('subscription.connection.openQr')}
          >
            <QrCodeIcon className="transition-colors duration-200 group-hover:text-accent-400" />
          </Button>
        </div>
      )}

      {requiresTariff ? (
        <Link to={tariffSelectionPath(subscription.id)} className={primaryActionClassName}>
          <SubscriptionIcon className="h-4 w-4 shrink-0 text-accent-400" />
          {t('subscription.cta.moveToTariff')}
        </Link>
      ) : (
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={managementOpen}
          onClick={onManageSubscription}
          className={primaryActionClassName}
        >
          <SettingsIcon className="h-4 w-4 shrink-0 text-accent-400" />
          {t('dashboard.manageSubscription')}
        </button>
      )}
    </>
  );
}
