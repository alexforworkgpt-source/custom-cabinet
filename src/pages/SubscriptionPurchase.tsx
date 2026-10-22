import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Navigate, useSearchParams } from 'react-router';
import { subscriptionApi } from '../api/subscription';
import { WebBackButton } from '../components/WebBackButton';
import { getGlassColors } from '../utils/glassTheme';
import { useTheme } from '../hooks/useTheme';
import type { Tariff, ClassicPurchaseOptions } from '../types';
import { useCloseOnSuccessNotification } from '../store/successNotification';
import { SwitchTariffSheet } from '../components/subscription/sheets/SwitchTariffSheet';
import { TariffPurchaseForm } from '../components/subscription/purchase/TariffPurchaseForm';
import { needsTariff } from '../utils/legacySubscription';
import { TariffPickerGrid } from '../components/subscription/purchase/TariffPickerGrid';
import { ClassicPurchaseWizard } from '../components/subscription/purchase/ClassicPurchaseWizard';
import { PurchaseContextBanners } from '../components/subscription/purchase/PurchaseContextBanners';
import { ExclamationIcon } from '@/components/icons';
import { SubscriptionFlowSkeleton } from '../components/subscription/SubscriptionFlowSkeleton';
import { usePurchaseContext } from '../hooks/usePurchaseContext';

export default function SubscriptionPurchase() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const rawSubscriptionId = searchParams.get('subscriptionId');
  const subscriptionId =
    rawSubscriptionId && /^\d+$/.test(rawSubscriptionId) ? Number(rawSubscriptionId) : undefined;
  const invalidId =
    rawSubscriptionId !== null && (!subscriptionId || !Number.isSafeInteger(subscriptionId));
  const { isDark } = useTheme();
  const g = getGlassColors(isDark);

  // Purchase options
  const {
    data: purchaseOptions,
    isLoading: optionsLoading,
    isError: optionsError,
    refetch: refetchOptions,
  } = useQuery({
    queryKey: ['purchase-options', subscriptionId],
    queryFn: () => subscriptionApi.getPurchaseOptions(subscriptionId),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  // Sales mode detection
  const isTariffsMode = purchaseOptions?.sales_mode === 'tariffs';
  const classicOptions = !isTariffsMode ? (purchaseOptions as ClassicPurchaseOptions) : null;
  const tariffs =
    isTariffsMode && purchaseOptions && 'tariffs' in purchaseOptions ? purchaseOptions.tariffs : [];
  const subscriptionRequired = !isTariffsMode || subscriptionId !== undefined;
  const {
    data: subscriptionResponse,
    isLoading,
    isError: primarySubscriptionError,
    refetch: refetchSubscription,
  } = useQuery({
    queryKey: ['subscription', subscriptionId],
    queryFn: () => subscriptionApi.getSubscription(subscriptionId),
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
    enabled: !invalidId && !!purchaseOptions && subscriptionRequired,
  });
  const subscription = subscriptionRequired ? (subscriptionResponse?.subscription ?? null) : null;
  const subscriptionError = subscriptionRequired && primarySubscriptionError;

  // Multi-tariff: check via subscriptions list query
  const multiSubQuery = useQuery({
    queryKey: ['subscriptions-list'],
    queryFn: () => subscriptionApi.getSubscriptions(),
    staleTime: 60_000,
    retry: false,
  });
  const multiSubData = multiSubQuery.data;
  const isMultiTariff = multiSubData?.multi_tariff_enabled ?? false;

  // (active promo discount + applyPromoDiscount live in usePromoDiscount;
  //  consumed directly by the sub-components, not threaded as props)

  // (classic-mode state moved into <ClassicPurchaseWizard>)

  // Tariffs mode state
  const [selectedTariff, setSelectedTariff] = useState<Tariff | null>(null);
  const [showTariffPurchase, setShowTariffPurchase] = useState(false);
  // (selectedTariffPeriod / customDays / customTrafficGb / useCustomDays /
  //  useCustomTraffic moved into <TariffPurchaseForm>; form remounts with
  //  fresh state via key=tariff.id when the parent picks a new tariff)

  // (tariffPurchaseRef moved into <TariffPurchaseForm>; switch-modal ref
  //  moved into <SwitchTariffSheet>)

  // Tariff switch
  const [switchTariffId, setSwitchTariffId] = useState<number | null>(null);

  // Auto-close all modals on success notification
  const handleCloseAllModals = () => {
    // setShowPurchaseForm moved into <ClassicPurchaseWizard>'s own useCloseOnSuccessNotification
    setShowTariffPurchase(false);
    setSwitchTariffId(null);

    setSelectedTariff(null);
    // (selectedTariffPeriod lives inside <TariffPurchaseForm> now; unmount clears it)
  };
  useCloseOnSuccessNotification(handleCloseAllModals);
  const initiallyLoading =
    isLoading || optionsLoading || (!isTariffsMode && multiSubQuery.isPending);
  const paidClassic = classicOptions
    ? subscription && !subscription.is_trial
      ? subscription
      : multiSubData?.subscriptions.find((sub) => !sub.is_trial)
    : undefined;
  const purchaseContext = usePurchaseContext({
    subscription,
    purchaseOptions,
    tariffs,
    showPromoGroup: !isTariffsMode || !showTariffPurchase,
    enabled:
      !invalidId &&
      !initiallyLoading &&
      !subscriptionError &&
      !optionsError &&
      (!classicOptions || !multiSubQuery.isError) &&
      !paidClassic,
  });
  const pageHeader = (
    <div className="flex items-center gap-3">
      {subscriptionId && <WebBackButton to={`/subscriptions/${subscriptionId}`} />}
      <h1 className="text-2xl font-bold text-dark-50 sm:text-3xl">
        {needsTariff(subscription)
          ? t('subscription.cta.moveToTariff')
          : isMultiTariff && !subscriptionId
            ? t('subscription.newTariff', 'Новый тариф')
            : !isMultiTariff && subscription?.is_daily && !subscription?.is_trial
              ? t('subscription.switchTariff.title')
              : t('subscription.getSubscription')}
      </h1>
    </div>
  );

  // (switch preview query + switchTariffMutation moved into <SwitchTariffSheet>)

  // (tariffPurchaseMutation moved into <TariffPurchaseForm>)
  // (auto-scroll effects: switch-modal into <SwitchTariffSheet>,
  //  tariff-purchase into <TariffPurchaseForm>)

  // (classic-mode helpers moved into <ClassicPurchaseWizard>)

  if (invalidId) return <Navigate to="/subscriptions" replace />;
  if (initiallyLoading || purchaseContext.isLoading) {
    return (
      <div className="space-y-6">
        {pageHeader}
        <SubscriptionFlowSkeleton
          mode={purchaseOptions ? (isTariffsMode ? 'tariffs' : 'classic') : 'unknown'}
          context={purchaseContext}
          count={isTariffsMode ? tariffs.length : classicOptions?.periods.length}
        />
      </div>
    );
  }

  if (
    subscriptionError ||
    (!isTariffsMode && multiSubQuery.isError) ||
    optionsError ||
    (!purchaseOptions && !optionsLoading)
  ) {
    return (
      <div className="space-y-6">
        {pageHeader}
        <div
          className="rounded-3xl p-6 text-center"
          style={{
            background: g.cardBg,
            border: `1px solid ${g.cardBorder}`,
          }}
        >
          <p className="mb-4 text-dark-300">
            {t('subscription.loadError', 'Не удалось загрузить варианты подписки')}
          </p>
          <button
            onClick={() => {
              if (subscriptionError) void refetchSubscription();
              else if (multiSubQuery.isError) void multiSubQuery.refetch();
              else void refetchOptions();
            }}
            className="rounded-xl bg-accent-500 px-6 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-600"
          >
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  if (subscriptionId && subscription?.id !== subscriptionId) {
    return <Navigate to="/subscriptions" replace />;
  }
  if (paidClassic) return <Navigate to={`/subscriptions/${paidClassic.id}`} replace />;

  return (
    <div className="space-y-6">
      {/* Header */}
      {pageHeader}

      {purchaseOptions && <PurchaseContextBanners context={purchaseContext} />}

      {/* Tariffs Section */}
      {isTariffsMode && tariffs.length > 0 && (
        <section data-purchase-layout="tariffs">
          {/* Expired subscription notice */}
          {isTariffsMode &&
            purchaseOptions &&
            'subscription_is_expired' in purchaseOptions &&
            purchaseOptions.subscription_is_expired && (
              <div
                className="mb-6 rounded-[14px] p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,59,92,0.08), rgba(255,184,0,0.06))',
                  border: '1px solid rgba(255,59,92,0.15)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px]"
                    style={{
                      background: 'rgba(255,59,92,0.12)',
                      color: 'rgb(var(--color-critical-500))',
                    }}
                  >
                    <ExclamationIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <div
                      className="text-sm font-semibold"
                      style={{ color: 'rgb(var(--color-critical-500))' }}
                    >
                      {t('subscription.expiredBanner.title')}
                    </div>
                    <div className="mt-1 text-[12px] text-dark-400">
                      {t('subscription.expiredBanner.selectTariff')}
                    </div>
                  </div>
                </div>
              </div>
            )}

          {/* Legacy subscription notice */}
          {needsTariff(subscription) && (
            <div className="mb-6 rounded-xl border border-accent-500/30 bg-accent-500/10 p-4">
              <div className="mb-2 font-medium text-accent-400">
                {t('subscription.legacy.selectTariffTitle')}
              </div>
              <div className="text-sm text-dark-300">
                {t('subscription.legacy.selectTariffDescription')}
              </div>
              <div className="mt-2 text-xs text-dark-500">
                {t('subscription.legacy.currentSubContinues')}
              </div>
            </div>
          )}

          {/* Switch Tariff Preview Modal */}
          <SwitchTariffSheet
            open={switchTariffId !== null}
            tariffId={switchTariffId}
            subscriptionId={subscriptionId}
            tariffs={tariffs}
            onClose={() => setSwitchTariffId(null)}
            onExpiredFallback={(tariff) => {
              setSelectedTariff(tariff);
              setShowTariffPurchase(true);
            }}
          />

          {!showTariffPurchase ? (
            <TariffPickerGrid
              tariffs={tariffs}
              subscription={subscription}
              purchaseOptions={purchaseOptions}
              isTariffsMode={isTariffsMode}
              isMultiTariff={isMultiTariff}
              onSelectTariff={(tariff) => {
                setSelectedTariff(tariff);
                setShowTariffPurchase(true);
              }}
              onSwitchTariff={(tariffId) => setSwitchTariffId(tariffId)}
            />
          ) : (
            selectedTariff && (
              /* Tariff Purchase Form (extracted into its own component) */
              <TariffPurchaseForm
                key={selectedTariff.id}
                tariff={selectedTariff}
                subscriptionId={subscriptionId}
                balanceKopeks={purchaseOptions?.balance_kopeks}
                sbpPurchaseEnabled={
                  isTariffsMode &&
                  purchaseOptions !== undefined &&
                  'platega_recurrent_enabled' in purchaseOptions &&
                  purchaseOptions.platega_recurrent_enabled === true
                }
                lavaPurchaseEnabled={
                  isTariffsMode &&
                  purchaseOptions !== undefined &&
                  'lava_recurrent_enabled' in purchaseOptions &&
                  purchaseOptions.lava_recurrent_enabled === true
                }
                casheraPurchaseEnabled={
                  isTariffsMode &&
                  purchaseOptions !== undefined &&
                  'cashera_recurrent_enabled' in purchaseOptions &&
                  purchaseOptions.cashera_recurrent_enabled === true
                }
                onBack={() => {
                  setShowTariffPurchase(false);
                  setSelectedTariff(null);
                }}
              />
            )
          )}
        </section>
      )}

      {/* Purchase/Extend Section - Classic Mode */}
      {classicOptions && classicOptions.periods.length > 0 && (
        <ClassicPurchaseWizard
          classicOptions={classicOptions}
          subscription={subscription}
          subscriptionId={subscriptionId}
        />
      )}

      {/* No options available fallback */}
      {purchaseOptions &&
        !optionsLoading &&
        !(isTariffsMode && tariffs.length > 0) &&
        !(classicOptions && classicOptions.periods.length > 0) && (
          <div
            className="rounded-3xl p-6 text-center"
            style={{
              background: g.cardBg,
              border: `1px solid ${g.cardBorder}`,
            }}
          >
            <p className="mb-4 text-dark-300">
              {t('subscription.noOptionsAvailable', 'Нет доступных вариантов подписки')}
            </p>
            <button
              onClick={() => refetchOptions()}
              className="rounded-xl bg-accent-500 px-6 py-2 text-sm font-medium text-on-accent transition-colors hover:bg-accent-600"
            >
              {t('common.retry')}
            </button>
          </div>
        )}
    </div>
  );
}
