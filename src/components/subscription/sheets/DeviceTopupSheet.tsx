import { useTranslation } from 'react-i18next';
import { getErrorMessage } from '../../../utils/subscriptionHelpers';
import InsufficientBalancePrompt from '../../InsufficientBalancePrompt';
import { ChevronRightIcon } from '../../icons';
import type { PurchaseOptions, Subscription } from '../../../types';
import { deviceUnavailableText } from '../deviceReasons';
import { useDevicePurchase } from '@/hooks/useDevicePurchase';
import { formatDateOrRaw } from '@/utils/format';
import { subscriptionActionStyles as styles } from './subscriptionActionStyles';

// ──────────────────────────────────────────────────────────────────
// Existing buy-devices presentation. useDevicePurchase owns fresh server terms,
// scoped local intent and explicit payment confirmation. purchaseOptions remains
// accepted for compatibility with existing management callers; balance is re-read.
//
// Extracted from Subscription.tsx to drop ~190 lines from the god page.
// ──────────────────────────────────────────────────────────────────

export interface DeviceTopupSheetProps {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  subscription: Subscription;
  subscriptionId: number | undefined;
  devicesToAdd: number;
  onDevicesToAddChange: (n: number) => void;
  purchaseOptions: PurchaseOptions | undefined;
  isDark: boolean;
  compactOnMobile?: boolean;
}

export function DeviceTopupSheet({
  open,
  onOpen,
  onClose,
  subscription,
  subscriptionId,
  devicesToAdd,
  onDevicesToAddChange,
  isDark,
  compactOnMobile = false,
}: DeviceTopupSheetProps) {
  const { t, i18n } = useTranslation();
  const {
    priceQuery,
    purchaseMutation: devicePurchaseMutation,
    buy,
    prepareFunding,
    notice,
    needsSelection,
    selectDevices,
    balance,
    ready,
    checking,
    supported,
    failedQuery,
    currentSubscription,
  } = useDevicePurchase({
    open,
    subscription,
    subscriptionId,
    devicesToAdd,
    onDevicesToAddChange,
    onClose,
  });
  const devicePriceData = priceQuery.data;
  const canReselectDevices =
    devicePriceData?.reason_code === 'can_add_limited' && (devicePriceData.can_add ?? 0) > 0;

  const formatPrice = (kopeks: number) => {
    const rubles = kopeks / 100;
    return rubles % 1 === 0 ? `${rubles} ₽` : `${rubles.toFixed(2)} ₽`;
  };

  if (!open) {
    return (
      <button onClick={onOpen} className={styles.trigger(isDark, compactOnMobile)}>
        <div className={styles.row(compactOnMobile)}>
          <div className={styles.text(compactOnMobile)}>
            <div className={styles.title(compactOnMobile)}>
              {t('subscription.additionalOptions.buyDevices')}
            </div>
            <div className={styles.description(compactOnMobile)}>
              {t('subscription.additionalOptions.currentDeviceLimit', {
                count: subscription.device_limit,
              })}
            </div>
          </div>
          <ChevronRightIcon className={styles.chevron(compactOnMobile)} />
        </div>
      </button>
    );
  }

  return (
    <div className={styles.panel(isDark)}>
      <div className={styles.header}>
        <h3 className="font-medium text-dark-100">{t('subscription.buyDevices')}</h3>
        <button
          onClick={onClose}
          disabled={checking || devicePurchaseMutation.isPending}
          className={styles.close}
          aria-label={t('common.close', 'Close')}
        >
          ✕
        </button>
      </div>

      {devicePriceData?.available === false && !canReselectDevices ? (
        <div className="py-4 text-center text-sm text-dark-400">
          {deviceUnavailableText(
            t,
            devicePriceData,
            'subscription.additionalOptions.devicesUnavailable',
          )}
        </div>
      ) : (
        <div className={styles.fields}>
          {devicePriceData?.available === false && (
            <p role="status" className="text-center text-sm text-dark-400">
              {deviceUnavailableText(
                t,
                devicePriceData,
                'subscription.additionalOptions.devicesUnavailable',
              )}
            </p>
          )}
          <div className="space-y-1 text-center text-sm text-dark-300">
            <p>
              {t('subscription.additionalOptions.currentDeviceLimit', {
                count: currentSubscription.device_limit,
              })}
              {' → '}
              {t('subscription.additionalOptions.newDeviceLimit', {
                count: currentSubscription.device_limit + devicesToAdd,
              })}
            </p>
            <p>
              {t('subscription.expiresAt')}:{' '}
              {formatDateOrRaw(currentSubscription.end_date, i18n?.language ?? 'ru', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
          {/* Device counter */}
          <div className={styles.counter}>
            <button
              onClick={() => selectDevices(Math.max(1, devicesToAdd - 1))}
              disabled={devicesToAdd <= 1 || checking || devicePurchaseMutation.isPending}
              className="btn-secondary flex h-12 w-12 items-center justify-center !p-0 text-2xl"
              aria-label={t('subscription.additionalOptions.decrementDevices', 'Уменьшить')}
            >
              -
            </button>
            <div className="text-center">
              <div className="text-4xl font-bold text-dark-100">{devicesToAdd}</div>
              <div className="text-sm text-dark-500">
                {t('subscription.additionalOptions.devicesUnit')}
              </div>
            </div>
            <button
              onClick={() => selectDevices(devicesToAdd + 1)}
              disabled={
                checking ||
                devicePurchaseMutation.isPending ||
                devicePriceData?.available === false ||
                devicesToAdd >= 100 ||
                (devicePriceData?.max_device_limit
                  ? (devicePriceData.current_device_limit || 0) + devicesToAdd >=
                    devicePriceData.max_device_limit
                  : false)
              }
              className="btn-secondary flex h-12 w-12 items-center justify-center !p-0 text-2xl"
              aria-label={t('subscription.additionalOptions.incrementDevices', 'Увеличить')}
            >
              +
            </button>
          </div>

          {devicePriceData?.max_device_limit && (
            <div className="text-center text-sm text-dark-400">
              {t('subscription.additionalOptions.currentDeviceLimit', {
                count: devicePriceData.current_device_limit || subscription.device_limit,
              })}{' '}
              /{' '}
              {t('subscription.additionalOptions.maxDevices', {
                count: devicePriceData.max_device_limit,
              })}
            </div>
          )}

          {/* Price info */}
          {devicePriceData?.available && devicePriceData.price_per_device_label && (
            <div className="text-center">
              <div className="mb-2 text-sm text-dark-400">
                {devicePriceData.discount_percent &&
                devicePriceData.discount_percent > 0 &&
                devicePriceData.original_price_per_device_kopeks ? (
                  <span>
                    <span className="text-dark-500 line-through">
                      {formatPrice(devicePriceData.original_price_per_device_kopeks)}
                    </span>
                    <span className="mx-1">{devicePriceData.price_per_device_label}</span>
                  </span>
                ) : (
                  devicePriceData.price_per_device_label
                )}
                /{t('subscription.perDevice').replace('/ ', '')} (
                {t('subscription.days', { count: devicePriceData.days_left })})
              </div>
              {devicePriceData.discount_percent && devicePriceData.discount_percent > 0 && (
                <div className="mb-2">
                  <span className="inline-block rounded-full bg-success-500/20 px-2.5 py-0.5 text-sm font-medium text-success-400">
                    -{devicePriceData.discount_percent}%
                  </span>
                </div>
              )}
              {devicePriceData.total_price_kopeks === 0 ? (
                <div className="text-2xl font-bold text-success-400">
                  {t('subscription.switchTariff.free')}
                </div>
              ) : (
                <div className="text-2xl font-bold text-accent-400">
                  {devicePriceData.discount_percent &&
                    devicePriceData.discount_percent > 0 &&
                    devicePriceData.base_total_price_kopeks && (
                      <span className="mr-2 text-lg text-dark-500 line-through">
                        {formatPrice(devicePriceData.base_total_price_kopeks)}
                      </span>
                    )}
                  {devicePriceData.total_price_label}
                </div>
              )}
            </div>
          )}

          {/* Insufficient balance */}
          {devicePriceData?.available &&
            ready &&
            supported &&
            balance !== undefined &&
            devicePriceData.total_price_kopeks &&
            devicePriceData.total_price_kopeks > balance && (
              <InsufficientBalancePrompt
                missingAmountKopeks={devicePriceData.total_price_kopeks - balance}
                compact
                returnTo={`/subscriptions/${subscriptionId ?? subscription.id}?section=additional-options&action=devices`}
                onBeforeTopUp={prepareFunding}
              />
            )}

          <button
            onClick={buy}
            disabled={
              devicePurchaseMutation.isPending ||
              !ready ||
              !supported ||
              checking ||
              needsSelection ||
              !devicePriceData?.available ||
              !!(
                devicePriceData?.total_price_kopeks &&
                balance !== undefined &&
                devicePriceData.total_price_kopeks > balance
              )
            }
            className="btn-primary w-full py-3"
          >
            {devicePurchaseMutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              </span>
            ) : (
              t('subscription.additionalOptions.buy')
            )}
          </button>

          {devicePurchaseMutation.isError && (
            <div className="text-center text-sm text-error-400">
              {getErrorMessage(devicePurchaseMutation.error)}
            </div>
          )}
          {notice && (
            <p role="status" className="text-sm text-dark-300">
              {t(notice)}
            </p>
          )}
          {ready && !supported && devicePriceData?.available && (
            <p role="alert" className="text-sm text-dark-300">
              {t('subscription.devicePayment.unavailable')}
            </p>
          )}
          {failedQuery && (
            <div role="alert" className="space-y-2 text-sm text-error-400">
              <p>{t('subscription.devicePayment.loadError')}</p>
              <button className="btn-secondary" onClick={() => failedQuery.refetch()}>
                {t('common.retry')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
