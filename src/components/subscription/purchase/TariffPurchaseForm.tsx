import { tariffTrafficLabel } from '@/utils/tariffTrafficLabel';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getErrorMessage, getSavedCartTopUpPath } from '../../../utils/subscriptionHelpers';
import { useCurrency } from '../../../hooks/useCurrency';
import { usePromoDiscount } from '../../../hooks/usePromoDiscount';
import { usePlatform } from '../../../platform';
import { openPaymentUrl } from '../../../utils/openPaymentUrl';
import { getDailyPriceQuote, getMonthlyPriceKopeks } from '../../../utils/pricing';
import { pickBestValue } from '../../../utils/bestValue';
import { TariffDeviceSelector } from './TariffDeviceSelector';
import { useRecurringTariffQuote } from './useRecurringTariffQuote';
import { CisPayPurchaseButton } from './CisPayPurchaseButton';
import { useTariffDeviceQuote } from './useTariffDeviceQuote';
import { Skeleton } from '../../ui/skeleton';
import { customDaysPrice } from './customDaysPrice';
import { PurchaseFundingNotice } from './PurchaseFundingNotice';
import type { Tariff, TariffPeriod } from '../../../types';
import { PeriodCardContent } from '../PeriodCardContent';
import { CasheraPurchaseAction } from './CasheraPurchaseAction';

// ──────────────────────────────────────────────────────────────────
// TariffPurchaseForm
//
// The full per-tariff purchase form: period picker (or daily-tariff
// activate), custom-days toggle + slider, custom-traffic toggle +
// slider, summary, and the confirm CTA. Self-owns:
//   - the purchaseTariff mutation
//   - the auto-scroll-into-view ref + effect on mount
//   - selectedTariffPeriod / customDays / customTrafficGb /
//     useCustomDays / useCustomTraffic (form-internal state, reset
//     by re-mount when the parent passes a new `tariff` via key=)
//
// The parent (SubscriptionPurchase) supplies the chosen tariff,
// the current balance (for inline insufficient-balance prompts),
// the subscription id (for the renew-this-subscription flow), and
// onBack to clear its own selection state.
// ──────────────────────────────────────────────────────────────────

export interface TariffPurchaseFormProps {
  tariff: Tariff;
  subscriptionId: number | undefined;
  balanceKopeks: number | undefined;
  /** СБП-оформление (Platega recurrent) доступно — показать вторую CTA. */
  sbpPurchaseEnabled?: boolean;
  /** Оформление привязкой Lava доступно — показать вторую CTA. */
  lavaPurchaseEnabled?: boolean;
  casheraPurchaseEnabled?: boolean;
  cispayPurchaseEnabled?: boolean;
  cispaySubscriptionId?: number;
  onBack: () => void;
}

export function TariffPurchaseForm({
  tariff,
  subscriptionId,
  balanceKopeks,
  sbpPurchaseEnabled = false,
  lavaPurchaseEnabled = false,
  casheraPurchaseEnabled = false,
  cispayPurchaseEnabled = false,
  cispaySubscriptionId = subscriptionId,
  onBack,
}: TariffPurchaseFormProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { formatAmount, currencySymbol } = useCurrency();
  const { activeDiscount, applyPromoDiscount } = usePromoDiscount();
  const dailyQuote = getDailyPriceQuote(tariff, activeDiscount);
  const { openLink, platform } = usePlatform();
  const ref = useRef<HTMLDivElement>(null);
  const purchaseInFlightRef = useRef(false);
  const [casheraPurchasePending, setCasheraPurchasePending] = useState(false);

  const formatPrice = (kopeks: number) =>
    kopeks === 0
      ? t('subscription.free', 'Бесплатно')
      : `${formatAmount(kopeks / 100)} ${currencySymbol}`;

  // Form-internal state — seeded from the tariff prop. Resets via
  // `key={tariff.id}` on the parent's render.
  const [selectedTariffPeriod, setSelectedTariffPeriod] = useState<TariffPeriod | null>(
    pickBestValue(tariff.periods) || tariff.periods[0] || null,
  );
  const [customDays, setCustomDays] = useState<number>(30);
  const [customTrafficGb, setCustomTrafficGb] = useState<number>(50);
  const [useCustomDays, setUseCustomDays] = useState(false);
  const [useCustomTraffic, setUseCustomTraffic] = useState(false);
  const customPeriodPrice = customDaysPrice(tariff, customDays);
  const isDaily = Boolean(tariff.is_daily || (tariff.daily_price_kopeks ?? 0) > 0);
  const deviceQuoteEnabled = tariff.purchase_device_selection_supported === true;
  const checkout = useTariffDeviceQuote(
    deviceQuoteEnabled,
    {
      tariff_id: tariff.id,
      period_days: isDaily ? 1 : useCustomDays ? customDays : (selectedTariffPeriod?.days ?? 30),
      traffic_gb: useCustomTraffic && tariff.custom_traffic_enabled ? customTrafficGb : undefined,
      subscription_id: subscriptionId,
    },
    isDaily,
  );
  const devicePolicy = checkout.policy;
  const recurringEnabled =
    deviceQuoteEnabled &&
    Boolean(devicePolicy?.selectable || checkout.quote?.recurrent_checkout_pending) &&
    checkout.quote?.purchase_kind !== 'trial_conversion';
  const recurring = useRecurringTariffQuote({
    enabled: recurringEnabled,
    ready: !checkout.blocked && !checkout.uncertain,
    available: {
      platega: sbpPurchaseEnabled,
      lava: lavaPurchaseEnabled,
      cashera: casheraPurchaseEnabled,
    },
    tariffId: tariff.id,
    subscriptionId,
    limit: checkout.selected ?? devicePolicy?.effective_limit,
  });
  type RecurringProvider = Parameters<typeof recurring.current>[0];
  const recurringDisabled = (provider: RecurringProvider) => {
    const state = recurring.current(provider);
    return !state.previous && (checkout.blocked || checkout.uncertain || state.blocked);
  };
  const recurringPrice = (provider: RecurringProvider) => {
    if (!recurringEnabled) return null;
    const state = recurring.current(provider);
    return (
      <div aria-live="polite" className="mt-1 text-center text-xs text-dark-400">
        {state.query.isError && !state.previous ? (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => void state.query.refetch()}
          >
            {t('subscription.purchaseDevices.priceUnavailable')} · {t('common.retry')}
          </button>
        ) : state.blocked || state.amount === undefined ? (
          t('subscription.purchaseDevices.waitForPrice')
        ) : (
          t('subscription.purchaseDevices.recurringPrice', {
            price: formatPrice(state.amount),
            days: state.days,
          })
        )}
      </div>
    );
  };
  const sendRecurring = (provider: RecurringProvider) =>
    recurring.purchase(
      provider,
      t('subscription.purchaseDevices.waitForPrice'),
      t('subscription.purchaseDevices.reviewPrice'),
    );
  const canSelectDevices =
    devicePolicy?.selectable && devicePolicy.min_limit !== null && devicePolicy.max_limit !== null;
  const quotePrice = checkout.amount;
  const waitingForQuote = checkout.awaitingQuote && !checkout.uncertain;
  const quoteTotal = (legacyPrice: number) =>
    waitingForQuote ? (
      <Skeleton className="inline-block h-6 w-24" />
    ) : (
      formatPrice(quotePrice ?? legacyPrice)
    );
  const deviceSelector = deviceQuoteEnabled && (
    <div className="my-3 space-y-2">
      {canSelectDevices && devicePolicy.min_limit !== null && devicePolicy.max_limit !== null && (
        <TariffDeviceSelector
          value={checkout.selected ?? devicePolicy.effective_limit}
          min={devicePolicy.min_limit}
          max={devicePolicy.max_limit}
          included={devicePolicy.included_limit}
          disabled={purchaseInFlightRef.current}
          onChange={checkout.choose}
          onValidityChange={checkout.validate}
        />
      )}
      {devicePolicy && !devicePolicy.selectable && devicePolicy.reason && (
        <p className="text-xs text-dark-400">
          {t(`subscription.purchaseDevices.reasons.${devicePolicy.reason}`, {
            defaultValue: t('subscription.purchaseDevices.fixedReason', {
              count: devicePolicy.effective_limit,
            }),
          })}
        </p>
      )}
      {checkout.quoteError && !checkout.uncertain && (
        <button type="button" className="btn-secondary" onClick={() => void checkout.retryQuote()}>
          {t('subscription.purchaseDevices.priceUnavailable')} · {t('common.retry')}
        </button>
      )}
      {checkout.uncertain && (
        <p role="alert" className="text-sm text-warning-400">
          {t('subscription.purchaseOutcomeUnknown')}
        </p>
      )}
    </div>
  );

  const purchaseMutation = useMutation({
    retry: false,
    mutationFn: () =>
      checkout.purchase(
        t('subscription.purchaseDevices.waitForPrice'),
        t('subscription.purchaseDevices.reviewPrice'),
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-options'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      navigate('/subscriptions', { replace: true });
    },
    onError: (error) => {
      const topUpPath = getSavedCartTopUpPath(
        error,
        undefined,
        `${location.pathname}${location.search}`,
      );
      if (topUpPath) navigate(topUpPath);
    },
    onSettled: () => {
      purchaseInFlightRef.current = false;
    },
  });

  const submitPurchase = () => {
    if (checkout.blocked || purchaseInFlightRef.current) return;
    purchaseInFlightRef.current = true;
    purchaseMutation.mutate();
  };

  // СБП-оформление: первое списание = подтверждение привязки в банке; период
  // на форме не участвует — списания идут по каденс-правилу тарифа.
  const sbpPurchaseMutation = useMutation({
    retry: false,
    mutationFn: () => sendRecurring('platega'),
    onSettled: () => {
      purchaseInFlightRef.current = false;
    },
    onSuccess: (data) => {
      if (data.redirect_url) {
        openPaymentUrl(data.redirect_url, platform, openLink);
      }
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-options'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
      queryClient.invalidateQueries({ queryKey: ['sbp-recurring', data.subscription_id] });
      navigate('/subscriptions', { replace: true });
    },
  });

  const sbpPurchaseButton = sbpPurchaseEnabled && (
    <>
      <button
        onClick={() => {
          if (purchaseInFlightRef.current || recurringDisabled('platega')) return;
          purchaseInFlightRef.current = true;
          sbpPurchaseMutation.mutate();
        }}
        disabled={
          recurringDisabled('platega') ||
          sbpPurchaseMutation.isPending ||
          purchaseMutation.isPending ||
          casheraPurchasePending
        }
        className="mt-2 w-full rounded-xl border border-accent-500/40 bg-accent-500/10 py-3 text-sm font-medium text-accent-400 transition-colors hover:bg-accent-500/20 disabled:opacity-50"
      >
        {sbpPurchaseMutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {t('common.loading')}
          </span>
        ) : (
          t('subscription.sbpRecurring.purchaseButton')
        )}
      </button>
      <div className="mt-1.5 text-center text-[11px] text-dark-500">
        {t('subscription.sbpRecurring.purchaseHint')}
      </div>
      {recurringPrice('platega')}
      {sbpPurchaseMutation.isError && (
        <div className="mt-2 text-center text-sm text-error-400">
          {getErrorMessage(sbpPurchaseMutation.error)}
        </div>
      )}
    </>
  );

  const lavaPurchaseMutation = useMutation({
    retry: false,
    mutationFn: () => sendRecurring('lava'),
    onSettled: () => {
      purchaseInFlightRef.current = false;
    },
    onSuccess: (data) => {
      if (data.redirect_url) {
        openPaymentUrl(data.redirect_url, platform, openLink);
      }
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-options'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
      queryClient.invalidateQueries({ queryKey: ['lava-recurring', data.subscription_id] });
      navigate('/subscriptions', { replace: true });
    },
  });

  const lavaPurchaseButton = lavaPurchaseEnabled && (
    <>
      <button
        onClick={() => {
          if (purchaseInFlightRef.current || recurringDisabled('lava')) return;
          purchaseInFlightRef.current = true;
          lavaPurchaseMutation.mutate();
        }}
        disabled={
          recurringDisabled('lava') ||
          lavaPurchaseMutation.isPending ||
          purchaseMutation.isPending ||
          casheraPurchasePending
        }
        className="mt-2 w-full rounded-xl border border-accent-500/40 bg-accent-500/10 py-3 text-sm font-medium text-accent-400 transition-colors hover:bg-accent-500/20 disabled:opacity-50"
      >
        {lavaPurchaseMutation.isPending ? (
          <span className="flex items-center justify-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {t('common.loading')}
          </span>
        ) : (
          t('subscription.lavaRecurring.purchaseButton')
        )}
      </button>
      <div className="mt-1.5 text-center text-[11px] text-dark-500">
        {t('subscription.lavaRecurring.purchaseHint')}
      </div>
      {recurringPrice('lava')}
      {lavaPurchaseMutation.isError && (
        <div className="mt-2 text-center text-sm text-error-400">
          {getErrorMessage(lavaPurchaseMutation.error)}
        </div>
      )}
    </>
  );

  const casheraPurchaseButton = casheraPurchaseEnabled && (
    <>
      <CasheraPurchaseAction
        tariffId={tariff.id}
        purchaseTariff={() => sendRecurring('cashera')}
        disabled={
          recurringDisabled('cashera') ||
          purchaseMutation.isPending ||
          sbpPurchaseMutation.isPending ||
          lavaPurchaseMutation.isPending
        }
        onPendingChange={setCasheraPurchasePending}
        claimPurchase={() => {
          if (purchaseInFlightRef.current) return false;
          purchaseInFlightRef.current = true;
          return true;
        }}
        releasePurchase={() => {
          purchaseInFlightRef.current = false;
        }}
      />
      {recurringPrice('cashera')}
    </>
  );
  const cisPayButton = cispayPurchaseEnabled && !isDaily && !useCustomTraffic && (
    <CisPayPurchaseButton
      tariffId={tariff.id}
      subscriptionId={cispaySubscriptionId}
      periodDays={useCustomDays ? customDays : selectedTariffPeriod?.days}
      deviceLimit={checkout.selected}
      disabled={checkout.blocked || checkout.uncertain || purchaseInFlightRef.current}
      claimPurchase={() => {
        if (purchaseInFlightRef.current) return false;
        purchaseInFlightRef.current = true;
        return true;
      }}
      releasePurchase={() => {
        purchaseInFlightRef.current = false;
      }}
    />
  );

  // Smooth scroll the form into view when first mounted.
  useEffect(() => {
    if (ref.current) {
      const timer = setTimeout(() => {
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div ref={ref} className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h3 className="min-w-0 truncate text-lg font-medium text-dark-100">{tariff.name}</h3>
        <button onClick={onBack} className="shrink-0 text-dark-400 hover:text-dark-200">
          ← {t('common.back')}
        </button>
      </div>

      {/* Tariff Info */}
      <div className="rounded-xl bg-dark-800/50 p-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div>
            <span className="text-dark-500">{t('subscription.traffic')}:</span>
            <span className="ml-2 text-dark-200">
              {tariffTrafficLabel(tariff.traffic_limit_gb, t)}
            </span>
          </div>
          <div>
            <span className="text-dark-500">{t('subscription.devices')}:</span>
            <span className="ml-2 text-dark-200">
              {tariff.device_limit === 0 ? '∞' : tariff.device_limit}
              {tariff.extra_devices_count > 0 && (
                <span className="ml-1 text-xs text-accent-400">
                  (+{tariff.extra_devices_count})
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {deviceSelector}

      {/* Daily Tariff Purchase */}
      {tariff.is_daily || (tariff.daily_price_kopeks && tariff.daily_price_kopeks > 0) ? (
        <div className="rounded-xl border border-accent-500/30 bg-accent-500/10 p-5">
          <div className="mb-4 text-center">
            <div className="mb-2 text-sm text-dark-400">
              {t('subscription.dailyPurchase.costPerDay')}
            </div>
            <div className="text-3xl font-bold text-accent-400">
              {quoteTotal(dailyQuote?.price ?? 0)}
            </div>
            {!deviceQuoteEnabled &&
              dailyQuote?.original &&
              dailyQuote.original > dailyQuote.price && (
                <div className="mt-1 flex items-center justify-center gap-2 text-sm">
                  <span className="text-dark-500 line-through">
                    {formatPrice(dailyQuote.original)}
                  </span>
                  {dailyQuote.percent && dailyQuote.percent > 0 && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs ${
                        dailyQuote.isPromoGroup
                          ? 'bg-success-500/20 text-success-400'
                          : 'bg-warning-500/20 text-warning-400'
                      }`}
                    >
                      -{dailyQuote.percent}%
                    </span>
                  )}
                </div>
              )}
          </div>
          {quotePrice !== undefined &&
            checkout.quote?.next_daily_charge_kopeks != null &&
            checkout.quote.next_daily_charge_kopeks !== quotePrice && (
              <p className="mb-2 text-center text-sm text-dark-400">
                {t('subscription.dailyPurchase.nextCharge', {
                  price: formatPrice(checkout.quote.next_daily_charge_kopeks),
                })}
              </p>
            )}
          <div className="space-y-2 text-sm text-dark-400">
            <div className="flex items-start gap-2">
              <span className="text-accent-400">•</span>
              <span>{t('subscription.dailyPurchase.chargedDaily')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent-400">•</span>
              <span>{t('subscription.dailyPurchase.canPause')}</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-accent-400">•</span>
              <span>{t('subscription.dailyPurchase.pausedOnLowBalance')}</span>
            </div>
          </div>

          {(() => {
            const dailyPrice = dailyQuote?.price ?? 0;
            const missingAmount = deviceQuoteEnabled
              ? waitingForQuote
                ? 0
                : (checkout.quote?.missing_kopeks ?? 0)
              : balanceKopeks === undefined
                ? 0
                : dailyPrice - balanceKopeks;

            return (
              <div className="mt-6">
                {missingAmount > 0 && !purchaseMutation.isError && (
                  <div className="mb-4">
                    <PurchaseFundingNotice missingAmountKopeks={missingAmount} />
                  </div>
                )}

                <button
                  onClick={submitPurchase}
                  disabled={
                    checkout.blocked || purchaseMutation.isPending || casheraPurchasePending
                  }
                  aria-busy={purchaseMutation.isPending}
                  className="btn-primary w-full py-3"
                >
                  {purchaseMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      {t('common.loading')}
                    </span>
                  ) : (
                    t('subscription.pay')
                  )}
                </button>

                {sbpPurchaseButton}
                {lavaPurchaseButton}
                {casheraPurchaseButton}

                {purchaseMutation.isError && (
                  <div className="mt-3 text-center text-sm text-error-400">
                    {getErrorMessage(purchaseMutation.error)}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      ) : (
        <>
          {/* Period Selection for non-daily tariffs */}
          <div>
            <div className="mb-3 text-sm text-dark-400">{t('subscription.selectPeriod')}</div>

            {tariff.periods.length > 0 && !useCustomDays && (
              <div className="mb-4 grid auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
                {tariff.periods.map((period) => {
                  const promoPeriod = applyPromoDiscount(
                    period.price_kopeks,
                    period.original_price_kopeks,
                  );
                  const displayDiscount = promoPeriod.percent;
                  const displayOriginal = promoPeriod.original;
                  const displayPrice = promoPeriod.price;
                  const displayPerMonth =
                    period.days === 30
                      ? displayPrice
                      : getMonthlyPriceKopeks(displayPrice, period.days);

                  return (
                    <button
                      key={period.days}
                      onClick={() => {
                        setSelectedTariffPeriod(period);
                        setUseCustomDays(false);
                      }}
                      className={`relative flex min-w-0 flex-col rounded-xl p-3 text-start transition-all sm:p-4 ${
                        selectedTariffPeriod?.days === period.days && !useCustomDays
                          ? period.is_highlighted
                            ? 'border-2 border-urgent-400 bg-accent-500/10 ring-1 ring-inset ring-accent-500'
                            : 'border border-accent-500 bg-accent-500/10'
                          : period.is_highlighted
                            ? 'border-2 border-urgent-400 bg-dark-800/50'
                            : 'border border-dark-700/50 bg-dark-800/50 hover:border-dark-600'
                      }`}
                    >
                      <PeriodCardContent
                        label={period.label}
                        periodDays={period.days}
                        price={formatPrice(displayPrice)}
                        originalPrice={
                          displayOriginal && displayOriginal > displayPrice
                            ? formatPrice(displayOriginal)
                            : null
                        }
                        monthlyPrice={
                          displayPerMonth !== null
                            ? `${formatAmount(displayPerMonth / 100, 0)} ${currencySymbol}/${t('subscription.month')}`
                            : null
                        }
                        discountPercent={displayDiscount}
                        discountClassName={
                          promoPeriod.isPromoGroup
                            ? 'bg-success-500 text-white'
                            : 'bg-warning-500 text-white'
                        }
                        highlighted={period.is_highlighted}
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* No periods available fallback */}
            {tariff.periods.length === 0 &&
              !useCustomDays &&
              !(tariff.custom_days_enabled && (tariff.price_per_day_kopeks ?? 0) > 0) && (
                <div className="rounded-xl border border-warning-500/30 bg-warning-500/10 p-4 text-center">
                  <div className="mb-2 text-sm font-medium text-warning-400">
                    {t('subscription.noPeriodsAvailable')}
                  </div>
                  <div className="text-xs text-dark-400">
                    {t('subscription.noPeriodsAvailableHint')}
                  </div>
                  <button onClick={onBack} className="btn-secondary mt-3 px-4 py-2 text-sm">
                    {t('subscription.chooseDifferentTariff')}
                  </button>
                </div>
              )}

            {/* Custom days option */}
            {tariff.custom_days_enabled && (tariff.price_per_day_kopeks ?? 0) > 0 && (
              <div className="rounded-xl border border-dark-700/50 bg-dark-800/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium text-dark-200">
                    {t('subscription.customDays.title')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUseCustomDays(!useCustomDays)}
                    role="switch"
                    aria-checked={useCustomDays}
                    aria-label={t('subscription.customDays.title')}
                    className={`relative h-6 w-10 rounded-full transition-colors ${
                      useCustomDays ? 'bg-accent-500' : 'bg-dark-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                        useCustomDays ? 'left-5' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
                {useCustomDays && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={tariff.min_days ?? 1}
                        max={tariff.max_days ?? 365}
                        value={customDays}
                        onChange={(e) => setCustomDays(parseInt(e.target.value, 10))}
                        className="flex-1 accent-accent-500"
                      />
                      <input
                        type="number"
                        value={customDays}
                        min={tariff.min_days ?? 1}
                        max={tariff.max_days ?? 365}
                        onChange={(e) =>
                          setCustomDays(
                            Math.max(
                              tariff.min_days ?? 1,
                              Math.min(
                                tariff.max_days ?? 365,
                                parseInt(e.target.value, 10) || (tariff.min_days ?? 1),
                              ),
                            ),
                          )
                        }
                        className="w-20 rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-center text-dark-100"
                      />
                    </div>
                    {(() => {
                      const promoCustom = applyPromoDiscount(
                        customPeriodPrice.price,
                        customPeriodPrice.original,
                      );
                      return (
                        <div className="flex justify-between text-sm">
                          <span className="text-dark-400">
                            {t('subscription.days', { count: customDays })} ×{' '}
                            {formatPrice(tariff.price_per_day_kopeks ?? 0)}/
                            {t('subscription.customDays.perDay')}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-accent-400">
                              {formatPrice(promoCustom.price)}
                            </span>
                            {promoCustom.original && promoCustom.original > promoCustom.price && (
                              <>
                                <span className="text-xs text-dark-500 line-through">
                                  {formatPrice(promoCustom.original)}
                                </span>
                                <span
                                  className={`rounded px-1.5 py-0.5 text-xs ${
                                    promoCustom.isPromoGroup
                                      ? 'bg-success-500/20 text-success-400'
                                      : 'bg-warning-500/20 text-warning-400'
                                  }`}
                                >
                                  -{promoCustom.percent}%
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Custom traffic option */}
          {tariff.custom_traffic_enabled && (tariff.traffic_price_per_gb_kopeks ?? 0) > 0 && (
            <div>
              <div className="mb-3 text-sm text-dark-400">
                {t('subscription.customTraffic.label')}
              </div>
              <div className="rounded-xl border border-dark-700/50 bg-dark-800/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-medium text-dark-200">
                    {t('subscription.customTraffic.selectVolume')}
                  </span>
                  <button
                    type="button"
                    onClick={() => setUseCustomTraffic(!useCustomTraffic)}
                    role="switch"
                    aria-checked={useCustomTraffic}
                    aria-label={t('subscription.customTraffic.selectVolume')}
                    className={`relative h-6 w-10 rounded-full transition-colors ${
                      useCustomTraffic ? 'bg-accent-500' : 'bg-dark-600'
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                        useCustomTraffic ? 'left-5' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
                {!useCustomTraffic && (
                  <div className="text-sm text-dark-400">
                    {t('subscription.customTraffic.default', {
                      label: tariffTrafficLabel(tariff.traffic_limit_gb, t),
                    })}
                  </div>
                )}
                {useCustomTraffic && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={tariff.min_traffic_gb ?? 1}
                        max={tariff.max_traffic_gb ?? 1000}
                        value={customTrafficGb}
                        onChange={(e) => setCustomTrafficGb(parseInt(e.target.value, 10))}
                        className="flex-1 accent-accent-500"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={customTrafficGb}
                          min={tariff.min_traffic_gb ?? 1}
                          max={tariff.max_traffic_gb ?? 1000}
                          onChange={(e) =>
                            setCustomTrafficGb(
                              Math.max(
                                tariff.min_traffic_gb ?? 1,
                                Math.min(
                                  tariff.max_traffic_gb ?? 1000,
                                  parseInt(e.target.value, 10) || (tariff.min_traffic_gb ?? 1),
                                ),
                              ),
                            )
                          }
                          className="w-20 rounded-lg border border-dark-600 bg-dark-700 px-3 py-2 text-center text-dark-100"
                        />
                        <span className="text-dark-400">{t('common.units.gb')}</span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-dark-400">
                        {customTrafficGb} {t('common.units.gb')} ×{' '}
                        {formatPrice(tariff.traffic_price_per_gb_kopeks ?? 0)}/
                        {t('common.units.gb')}
                      </span>
                      <span className="font-medium text-accent-400">
                        +{formatPrice(customTrafficGb * (tariff.traffic_price_per_gb_kopeks ?? 0))}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Summary & Purchase */}
          {(selectedTariffPeriod || useCustomDays) && (
            <div className="rounded-xl bg-dark-800/50 p-5">
              {(() => {
                const basePeriodPrice = useCustomDays
                  ? customPeriodPrice.price
                  : selectedTariffPeriod?.price_kopeks || 0;
                const existingPeriodOriginal = useCustomDays
                  ? customPeriodPrice.original
                  : selectedTariffPeriod?.original_price_kopeks &&
                      selectedTariffPeriod.original_price_kopeks > selectedTariffPeriod.price_kopeks
                    ? selectedTariffPeriod.original_price_kopeks
                    : undefined;
                const promoPeriod = applyPromoDiscount(basePeriodPrice, existingPeriodOriginal);

                const trafficPrice =
                  useCustomTraffic && tariff.custom_traffic_enabled
                    ? customTrafficGb * (tariff.traffic_price_per_gb_kopeks ?? 0)
                    : 0;

                const totalPrice = quotePrice ?? promoPeriod.price + trafficPrice;
                const missingAmount = deviceQuoteEnabled
                  ? waitingForQuote
                    ? 0
                    : (checkout.quote?.missing_kopeks ?? 0)
                  : totalPrice - (balanceKopeks ?? totalPrice);
                const originalTotal = promoPeriod.original
                  ? promoPeriod.original + trafficPrice
                  : null;

                return (
                  <>
                    {!deviceQuoteEnabled && (
                      <div className="mb-4 space-y-2">
                        {useCustomDays ? (
                          <div className="flex justify-between text-sm text-dark-300">
                            <span>
                              {t('subscription.stepPeriod')}:{' '}
                              {t('subscription.days', { count: customDays })}
                            </span>
                            <div className="flex items-center gap-2">
                              <span>{formatPrice(promoPeriod.price)}</span>
                              {promoPeriod.original && promoPeriod.original > promoPeriod.price && (
                                <span className="text-xs text-dark-500 line-through">
                                  {formatPrice(promoPeriod.original)}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          selectedTariffPeriod &&
                          ((selectedTariffPeriod.extra_devices_count ?? 0) > 0 &&
                          selectedTariffPeriod.base_tariff_price_kopeks ? (
                            <>
                              <div className="flex justify-between text-sm text-dark-300">
                                <span>
                                  {t('subscription.baseTariff')}: {selectedTariffPeriod.label}
                                </span>
                                <span>
                                  {formatPrice(selectedTariffPeriod.base_tariff_price_kopeks)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm text-dark-300">
                                <span>
                                  {t('subscription.extraDevices')} (
                                  {selectedTariffPeriod.extra_devices_count})
                                </span>
                                <span>
                                  +
                                  {formatPrice(selectedTariffPeriod.extra_devices_cost_kopeks ?? 0)}
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex justify-between text-sm text-dark-300">
                              <span>
                                {t('subscription.summary.period', {
                                  label: selectedTariffPeriod.label,
                                })}
                              </span>
                              <div className="flex items-center gap-2">
                                <span>{formatPrice(promoPeriod.price)}</span>
                                {promoPeriod.original &&
                                  promoPeriod.original > promoPeriod.price && (
                                    <span className="text-xs text-dark-500 line-through">
                                      {formatPrice(promoPeriod.original)}
                                    </span>
                                  )}
                              </div>
                            </div>
                          ))
                        )}
                        {useCustomTraffic && tariff.custom_traffic_enabled && (
                          <div className="flex justify-between text-sm text-dark-300">
                            <span>
                              {t('subscription.summary.traffic', { gb: customTrafficGb })}
                            </span>
                            <span>+{formatPrice(trafficPrice)}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {!deviceQuoteEnabled && promoPeriod.percent && (
                      <div className="mb-4 flex items-center justify-center gap-2 rounded-lg border border-warning-500/30 bg-warning-500/10 p-2">
                        <span className="text-sm font-medium text-warning-400">
                          {t('promo.discountApplied')} -{promoPeriod.percent}%
                        </span>
                      </div>
                    )}

                    <div className="mb-4 flex items-center justify-between border-t border-dark-700/50 pt-2">
                      <span className="font-medium text-dark-100">{t('subscription.total')}</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-accent-400">
                          {quoteTotal(totalPrice)}
                        </span>
                        {!deviceQuoteEnabled && originalTotal && (
                          <div className="text-sm text-dark-500 line-through">
                            {formatPrice(originalTotal)}
                          </div>
                        )}
                      </div>
                    </div>

                    {missingAmount > 0 && !purchaseMutation.isError && (
                      <div className="mb-4">
                        <PurchaseFundingNotice missingAmountKopeks={missingAmount} />
                      </div>
                    )}

                    <button
                      onClick={submitPurchase}
                      disabled={
                        checkout.blocked || purchaseMutation.isPending || casheraPurchasePending
                      }
                      aria-busy={purchaseMutation.isPending}
                      className="btn-primary w-full py-3"
                    >
                      {purchaseMutation.isPending ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          {t('common.loading')}
                        </span>
                      ) : (
                        t('subscription.pay')
                      )}
                    </button>

                    {sbpPurchaseButton}
                    {lavaPurchaseButton}
                    {casheraPurchaseButton}
                    {cisPayButton}
                  </>
                );
              })()}

              {purchaseMutation.isError && (
                <div className="mt-3 text-center text-sm text-error-400">
                  {getErrorMessage(purchaseMutation.error)}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
