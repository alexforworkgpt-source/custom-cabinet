import { useTranslation } from 'react-i18next';
import { BestValueBadge } from '../BestValueBadge';
import { useNavigate } from 'react-router';
import { useTheme } from '../../../hooks/useTheme';
import { useCurrency } from '../../../hooks/useCurrency';
import { usePromoDiscount } from '../../../hooks/usePromoDiscount';
import { getGlassColors } from '../../../utils/glassTheme';
import { getDailyPriceQuote } from '../../../utils/pricing';
import { needsTariff } from '../../../utils/legacySubscription';
import { ArrowDownIcon, DevicesIcon, RestartIcon } from '@/components/icons';
import type { Tariff, Subscription, PurchaseOptions } from '../../../types';

// ──────────────────────────────────────────────────────────────────
// TariffPickerGrid
//
// The tariff selection surface inside SubscriptionPurchase. Renders:
//   - an optional promo-group banner when any tariff carries a
//     promo_group_name
//   - the "all tariffs purchased" empty state (multi-tariff mode)
//   - the grid itself (1 col mobile, 2 cols sm+) with promo prices,
//     per-tariff CTAs differentiated by user state (extend / switch /
//     purchase / legacy renewal)
//
// Owns nothing — pure presentation that calls back into the parent
// for selection (`onSelectTariff`) and switch (`onSwitchTariff`).
// ──────────────────────────────────────────────────────────────────

export interface TariffPickerGridProps {
  tariffs: Tariff[];
  subscription: Subscription | null;
  purchaseOptions: PurchaseOptions | undefined;
  isTariffsMode: boolean;
  isMultiTariff: boolean;
  onSelectTariff: (tariff: Tariff) => void;
  onSwitchTariff: (tariffId: number) => void;
}

export function TariffPickerGrid({
  tariffs,
  subscription,
  purchaseOptions,
  isTariffsMode,
  isMultiTariff,
  onSelectTariff,
  onSwitchTariff,
}: TariffPickerGridProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const g = getGlassColors(isDark);
  const { formatAmount, currencySymbol } = useCurrency();
  const { activeDiscount, applyPromoDiscount } = usePromoDiscount();

  const formatPrice = (kopeks: number) =>
    kopeks === 0
      ? t('subscription.free', 'Бесплатно')
      : `${formatAmount(kopeks / 100)} ${currencySymbol}`;

  return (
    <>
      {/* Tariff Grid */}
      {isMultiTariff &&
        purchaseOptions &&
        'all_tariffs_purchased' in purchaseOptions &&
        purchaseOptions.all_tariffs_purchased && (
          <div
            className="rounded-2xl border p-6 text-center"
            style={{ background: g.cardBg, borderColor: g.cardBorder }}
          >
            <div className="mb-2 text-3xl">✅</div>
            <h3 className="mb-1 text-lg font-semibold" style={{ color: g.text }}>
              {t('subscription.allTariffsPurchased', 'Все тарифы подключены')}
            </h3>
            <p className="mb-4 text-sm" style={{ color: g.textSecondary }}>
              {t(
                'subscription.allTariffsPurchasedDesc',
                'Вы уже приобрели все доступные тарифы. Продлить подписку можно на странице тарифа.',
              )}
            </p>
            <button
              onClick={() => navigate('/subscriptions')}
              className="rounded-xl bg-accent-500 px-6 py-2.5 text-sm font-medium text-on-accent transition-colors hover:bg-accent-600"
            >
              {t('subscription.backToList', 'Мои подписки')}
            </button>
          </div>
        )}
      <div className="grid auto-rows-fr grid-cols-1 gap-3 sm:grid-cols-2">
        {[...tariffs]
          .filter((tariff) => {
            // In multi-tariff mode: hide already purchased tariffs
            if (isMultiTariff && tariff.is_purchased) return false;
            if (subscription?.is_trial && tariff.name.toLowerCase().includes('trial')) {
              return false;
            }
            return true;
          })
          .sort((a, b) => {
            const aIsCurrent = a.is_current || a.id === subscription?.tariff_id;
            const bIsCurrent = b.is_current || b.id === subscription?.tariff_id;
            if (aIsCurrent && !bIsCurrent) return -1;
            if (!aIsCurrent && bIsCurrent) return 1;
            return 0;
          })
          .map((tariff) => {
            const isCurrentTariff = tariff.is_current || tariff.id === subscription?.tariff_id;
            const isSubscriptionExpired =
              isTariffsMode &&
              purchaseOptions &&
              'subscription_is_expired' in purchaseOptions &&
              purchaseOptions.subscription_is_expired === true;
            // Free (0₽) source tariff: the backend blocks the prorated switch
            // (free_tariff_cannot_switch) — offer the purchase flow instead.
            const isOnFreeTariff =
              isTariffsMode &&
              purchaseOptions &&
              'subscription_on_free_tariff' in purchaseOptions &&
              purchaseOptions.subscription_on_free_tariff === true;
            const canSwitch =
              !isMultiTariff &&
              subscription &&
              subscription.tariff_id &&
              !isCurrentTariff &&
              !subscription.is_trial &&
              !isSubscriptionExpired &&
              !isOnFreeTariff &&
              (subscription.is_active || subscription.is_limited);
            const isLegacySubscription = needsTariff(subscription);
            const dailyQuote = getDailyPriceQuote(tariff, activeDiscount);
            const firstPeriod = tariff.periods[0];
            const quote =
              dailyQuote ??
              (firstPeriod
                ? applyPromoDiscount(
                    firstPeriod.price_kopeks || 0,
                    firstPeriod.original_price_kopeks,
                  )
                : null);

            return (
              <div
                key={tariff.id}
                className={`bento-card-hover flex min-w-0 flex-col !p-3 text-start transition-all sm:!p-4 ${
                  isCurrentTariff
                    ? 'bento-card-glow border-accent-500'
                    : tariff.is_highlighted
                      ? 'border-2 border-urgent-400'
                      : ''
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 break-words text-base font-semibold text-dark-100 sm:text-lg">
                        {tariff.name}
                      </div>
                      {!!quote?.percent && quote.percent > 0 && (
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${quote.isPromoGroup ? 'bg-success-500/20 text-success-400' : 'bg-warning-500/20 text-warning-400'}`}
                        >
                          -{quote.percent}%
                        </span>
                      )}
                    </div>
                    {tariff.description && (
                      <div className="mt-1 whitespace-pre-line text-sm text-dark-400">
                        {tariff.description}
                      </div>
                    )}
                  </div>
                  {isCurrentTariff && (
                    <span className="badge-success text-xs">{t('subscription.currentTariff')}</span>
                  )}
                </div>
                {tariff.is_highlighted && !isCurrentTariff && (
                  <BestValueBadge className="mb-2 self-start" />
                )}
                <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
                  <div className="flex items-center gap-1.5">
                    <ArrowDownIcon className="h-4 w-4 text-accent-400" />
                    <span className="font-medium text-dark-200">{tariff.traffic_limit_label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DevicesIcon className="h-4 w-4 text-dark-400" />
                    <span className="text-dark-300">
                      {tariff.device_limit === 0
                        ? '∞'
                        : t('subscription.devices', { count: tariff.device_limit })}
                    </span>
                  </div>
                  {tariff.traffic_reset_mode && tariff.traffic_reset_mode !== 'NO_RESET' && (
                    <div className="flex items-center gap-1.5">
                      <RestartIcon className="h-4 w-4 text-dark-400" />
                      <span className="text-dark-300">
                        {t(`subscription.trafficReset.${tariff.traffic_reset_mode}`)}
                      </span>
                    </div>
                  )}
                </div>
                {/* Price info */}
                <div className="mt-auto border-t border-dark-700/50 pt-2 text-sm text-dark-400">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    {quote && !dailyQuote && <span>{t('subscription.from')}</span>}
                    <span className="break-words text-2xl font-medium text-accent-400">
                      {quote ? formatPrice(quote.price) : t('subscription.tariff.flexiblePayment')}
                    </span>
                    {dailyQuote && <span>{t('subscription.tariff.perDay')}</span>}
                  </div>
                  <div className="min-h-4 text-xs leading-4 text-dark-500 line-through">
                    {quote?.original && quote.original > quote.price
                      ? formatPrice(quote.original)
                      : null}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-2 flex gap-2">
                  {isCurrentTariff ? (
                    subscription?.is_daily ? (
                      <div className="flex-1 py-2 text-center text-sm text-dark-500">
                        {t('subscription.currentTariff')}
                      </div>
                    ) : (
                      <button
                        onClick={() => onSelectTariff(tariff)}
                        className="btn-primary flex-1 py-2 text-sm"
                      >
                        {t('subscription.extend')}
                      </button>
                    )
                  ) : isLegacySubscription ? (
                    <button
                      onClick={() => onSelectTariff(tariff)}
                      className="btn-primary flex-1 py-2 text-sm"
                    >
                      {t('subscription.cta.moveToTariff')}
                    </button>
                  ) : canSwitch ? (
                    <button
                      onClick={() => onSwitchTariff(tariff.id)}
                      className="btn-secondary flex-1 py-2 text-sm"
                    >
                      {t('subscription.switchTariff.switch')}
                    </button>
                  ) : (
                    <button
                      onClick={() => onSelectTariff(tariff)}
                      className="btn-primary flex-1 py-2 text-sm"
                    >
                      {t('subscription.purchase')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
}
