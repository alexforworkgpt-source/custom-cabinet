import { useTranslation } from 'react-i18next';
import type { Subscription } from '../../types';
import type { getGlassColors } from '../../utils/glassTheme';
import { getErrorMessage, getInsufficientBalanceError } from '../../utils/subscriptionHelpers';
import { uiLocale } from '../../utils/uiLocale';
import { PauseIcon } from '../icons';
import InsufficientBalancePrompt from '../InsufficientBalancePrompt';

export function SubscriptionDailyManagement({
  subscription,
  glassColors: g,
  priceLabel,
  onPause,
  pending = false,
  error,
}: {
  subscription: Subscription;
  glassColors: ReturnType<typeof getGlassColors>;
  priceLabel: string | undefined;
  onPause?: () => void;
  pending?: boolean;
  error?: unknown;
}) {
  const { t } = useTranslation();
  const Action = onPause ? 'button' : 'span';
  return (
    <div
      className="relative overflow-hidden rounded-3xl"
      style={{
        background: g.cardBg,
        border: `1px solid ${g.cardBorder}`,
        boxShadow: g.shadow,
        padding: '24px 28px',
      }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold tracking-tight text-dark-50">
            {t('subscription.pause.title')}
          </h2>
          <div className="mt-1 text-[12px] text-dark-400">
            {subscription.is_limited
              ? t('subscription.trafficLimited')
              : subscription.status === 'disabled'
                ? t('subscription.pause.suspended')
                : subscription.is_daily_paused
                  ? t('subscription.pause.paused')
                  : t('subscription.pause.active')}
          </div>
        </div>
        <Action
          {...(onPause ? { onClick: onPause, disabled: pending } : {})}
          className="rounded-[10px] px-4 py-2 text-sm font-semibold transition-colors duration-300"
          style={{
            background:
              subscription.is_daily_paused || subscription.status === 'disabled'
                ? 'rgba(var(--color-accent-400), 0.12)'
                : 'rgba(255,184,0,0.12)',
            border:
              subscription.is_daily_paused || subscription.status === 'disabled'
                ? '1px solid rgba(var(--color-accent-400), 0.2)'
                : '1px solid rgba(255,184,0,0.2)',
            color:
              subscription.is_daily_paused || subscription.status === 'disabled'
                ? 'rgb(var(--color-accent-400))'
                : 'rgb(var(--color-urgent-400))',
          }}
        >
          {pending ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            </span>
          ) : subscription.is_daily_paused || subscription.status === 'disabled' ? (
            t('subscription.pause.resumeBtn')
          ) : (
            t('subscription.pause.pauseBtn')
          )}
        </Action>
      </div>

      {/* Pause mutation error */}
      {error != null &&
        (() => {
          const balanceError = getInsufficientBalanceError(error);
          if (balanceError) {
            const missingAmount = balanceError.required - balanceError.balance;
            return (
              <div className="mt-4">
                <InsufficientBalancePrompt
                  missingAmountKopeks={missingAmount}
                  message={t('subscription.pause.insufficientBalance')}
                  compact
                />
              </div>
            );
          }
          return (
            <div
              className="mt-4 rounded-[10px] p-3 text-center text-sm"
              style={{
                background: 'rgba(255,59,92,0.08)',
                border: '1px solid rgba(255,59,92,0.15)',
                color: 'rgb(var(--color-critical-500))',
              }}
            >
              {getErrorMessage(error)}
            </div>
          );
        })()}

      {/* Paused info or Next charge progress bar */}
      {subscription.is_daily_paused ? (
        <div
          className="mt-4 rounded-[12px] p-4"
          style={{
            background: 'rgba(255,184,0,0.06)',
            border: '1px solid rgba(255,184,0,0.12)',
          }}
        >
          <div className="flex items-start gap-3">
            <PauseIcon
              className="h-5 w-5 shrink-0"
              style={{ color: 'rgb(var(--color-urgent-400))' }}
            />
            <div>
              <div
                className="text-sm font-semibold"
                style={{ color: 'rgb(var(--color-urgent-400))' }}
              >
                {t('subscription.pause.pausedInfo')}
              </div>
              <div className="mt-1 text-[12px] text-dark-400">
                {t('subscription.pause.pausedDescription')}{' '}
                {new Date(subscription.end_date).toLocaleDateString(uiLocale())} (
                {t('subscription.pause.days', { count: subscription.days_left })})
              </div>
            </div>
          </div>
        </div>
      ) : (
        subscription.next_daily_charge_at &&
        (() => {
          const now = new Date();
          const nextChargeStr = subscription.next_daily_charge_at.endsWith('Z')
            ? subscription.next_daily_charge_at
            : `${subscription.next_daily_charge_at}Z`;
          const nextCharge = new Date(nextChargeStr);
          const totalMs = 24 * 60 * 60 * 1000;
          const remainingMs = Math.max(0, nextCharge.getTime() - now.getTime());
          const elapsedMs = totalMs - remainingMs;
          const progress = Math.min(100, (elapsedMs / totalMs) * 100);

          const hours = Math.floor(remainingMs / (1000 * 60 * 60));
          const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

          return (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[11px] font-medium uppercase tracking-wider text-dark-400">
                  {t('subscription.pause.nextCharge')}
                </span>
                <span className="font-mono text-[12px] font-semibold text-dark-50">
                  {hours > 0
                    ? `${hours}${t('subscription.pause.hours')} ${minutes}${t('subscription.pause.minutes')}`
                    : `${minutes}${t('subscription.pause.minutes')}`}
                </span>
              </div>
              <div
                className="relative h-2 overflow-hidden rounded-full"
                style={{ background: g.trackBg }}
              >
                <div
                  className="absolute inset-0 origin-left rounded-full transition-transform duration-500"
                  style={{
                    transform: `scaleX(${progress / 100})`,
                    background:
                      'linear-gradient(90deg, rgb(var(--color-accent-500)), rgb(var(--color-accent-400)))',
                  }}
                />
              </div>
              {subscription.daily_price_kopeks && (
                <div className="mt-2 text-center text-[11px] text-dark-500">
                  {t('subscription.pause.willBeCharged')}: {priceLabel}
                </div>
              )}
            </div>
          );
        })()
      )}
    </div>
  );
}
