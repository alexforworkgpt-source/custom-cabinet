import { useTranslation } from 'react-i18next';
import type { Subscription } from '../../types';
import { planTitle } from '../../utils/legacySubscription';
import { ClockIcon, ExclamationIcon, GiftIcon, PauseIcon, TariffsIcon } from '../icons';
import { cn } from '@/lib/utils';

// Same compact typography, icon sizes and badge geometry as the Dashboard header.
const badge =
  'inline-flex min-w-0 max-w-full items-center gap-1.5 rounded-lg border px-2 py-1 text-xs uppercase';
const trialBadge = 'border-warning-500/30 bg-warning-500/15 text-warning-400';

function statusPresentation(subscription: Subscription) {
  if (subscription.is_daily_paused)
    return { label: 'subscription.pause.paused', color: trialBadge, Icon: PauseIcon };
  if (subscription.status === 'disabled')
    return {
      label: 'subscription.pause.suspended',
      color: 'border-dark-700/50 bg-dark-800/50 text-dark-400',
      Icon: PauseIcon,
    };
  if (subscription.is_expired || subscription.status === 'expired')
    return {
      label: 'subscription.expired',
      color: 'border-error-500/30 bg-error-500/15 text-error-400',
      Icon: ClockIcon,
    };
  if (subscription.is_limited || subscription.status === 'limited')
    return { label: 'subscription.trafficLimited', color: trialBadge, Icon: ExclamationIcon };
  if (subscription.is_trial)
    return { label: 'subscription.trialStatusShort', color: trialBadge, Icon: GiftIcon };
  if (subscription.is_active || subscription.status === 'active')
    return {
      label: 'subscription.active',
      color: 'border-success-500/25 bg-success-500/10 text-success-400 light:text-success-500',
      Icon: null,
    };
  return {
    label: 'subscription.inactive',
    color: 'border-dark-700/50 bg-dark-800/50 text-dark-400',
    Icon: ClockIcon,
  };
}

/** Read-only identity for the two conditions cards; no query or subscription action. */
export function SubscriptionIdentityBadges({ subscription }: { subscription: Subscription }) {
  const { t } = useTranslation();
  const status = statusPresentation(subscription);
  const activeTrial = subscription.is_trial && status.label === 'subscription.trialStatusShort';

  return (
    <div className="flex min-w-0 flex-wrap items-center gap-2" data-subscription-identity>
      {!activeTrial && (
        <span className={cn(badge, 'font-semibold', status.color)} data-subscription-status>
          {status.Icon ? (
            <span aria-hidden="true" className="shrink-0">
              <status.Icon className="h-3 w-3" />
            </span>
          ) : (
            <span className="h-2 w-2 shrink-0 rounded-full bg-current" aria-hidden="true" />
          )}
          <span className="min-w-0 break-words">{t(status.label)}</span>
        </span>
      )}
      <h2
        className={cn(
          badge,
          subscription.is_trial
            ? cn('font-semibold', trialBadge)
            : 'border-dark-700/65 bg-dark-800/50 font-medium text-dark-300',
        )}
        data-subscription-plan
      >
        <span aria-hidden="true" className="shrink-0">
          {subscription.is_trial ? (
            <GiftIcon className="h-3 w-3" />
          ) : (
            <TariffsIcon className="h-3 w-3" />
          )}
        </span>
        <span className="min-w-0 break-words">
          {subscription.is_trial ? t('subscription.trialStatusShort') : planTitle(subscription, t)}
        </span>
      </h2>
    </div>
  );
}
