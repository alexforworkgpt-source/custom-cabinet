import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { subscriptionApi } from '../api/subscription';
import { WebBackButton } from '../components/WebBackButton';
import { getGlassColors } from '../utils/glassTheme';
import { useTheme } from '../hooks/useTheme';
import type { Tariff, ClassicPurchaseOptions } from '../types';
import { useCloseOnSuccessNotification } from '../store/successNotification';
import { SwitchTariffSheet } from '../components/subscription/sheets/SwitchTariffSheet';
import { TariffPurchaseForm } from '../components/subscription/purchase/TariffPurchaseForm';
import { canOpenTariffSwitch, needsTariff } from '../utils/legacySubscription';
import { TariffPickerGrid } from '../components/subscription/purchase/TariffPickerGrid';
import { ClassicPurchaseWizard } from '../components/subscription/purchase/ClassicPurchaseWizard';
import { PurchaseContextBanners } from '../components/subscription/purchase/PurchaseContextBanners';
import { ExclamationIcon } from '@/components/icons';
import { SubscriptionFlowSkeleton } from '../components/subscription/SubscriptionFlowSkeleton';
import { usePurchaseContext } from '../hooks/usePurchaseContext';
import { PageEntrance, PageEntranceItem } from '@/components/motion/PageEntrance';
import { hasTargetBotContract } from '../config/upstreamBotContract';
import { canSetupCisPayTariff, resolveCisPayTarget } from '@/utils/cispayRecurring';
import { useAuthStore } from '../store/auth';
import { usePageMobileNavigation } from '@/components/layout/AppShell/MobileNavigation';

export default function SubscriptionPurchase() {
  const { t } = useTranslation();
  const accountId = useAuthStore((state) => state.user?.id);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
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
  const scopedSwitch =
    hasTargetBotContract() &&
    searchParams.get('mode') === 'switch' &&
    isTariffsMode &&
    subscriptionId !== undefined &&
    subscription?.id === subscriptionId &&
    canOpenTariffSwitch(subscription) &&
    !purchaseOptions.subscription_on_free_tariff;
  const catalogueTariffs = scopedSwitch
    ? tariffs.filter((tariff) => tariff.id !== subscription?.tariff_id && !tariff.is_purchased)
    : tariffs;

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
  const cisPaySetup =
    searchParams.get('mode') === 'cispay' &&
    isTariffsMode &&
    purchaseOptions.cispay_recurrent_enabled === true &&
    subscription?.id === subscriptionId &&
    !!subscriptionId;
  const currentTariff = cisPaySetup
    ? tariffs.find((tariff) => tariff.id === subscription?.tariff_id)
    : undefined;
  const cisPaySetupTariff = canSetupCisPayTariff(currentTariff) ? currentTariff : undefined;
  const purchaseTariff = cisPaySetupTariff ?? selectedTariff;
  const showPurchaseForm = Boolean(cisPaySetupTariff) || showTariffPurchase;
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
    showPromoGroup: !isTariffsMode || !showPurchaseForm,
    enabled:
      !invalidId &&
      !initiallyLoading &&
      !subscriptionError &&
      !optionsError &&
      (!classicOptions || !multiSubQuery.isError) &&
      !paidClassic,
  });
  usePageMobileNavigation(
    !invalidId && isTariffsMode && !optionsError && !showPurchaseForm && switchTariffId === null
      ? 'catalogue'
      : 'action',
  );
  const pageHeader = (
    <PageEntranceItem className="flex items-center gap-3">
      {subscriptionId && <WebBackButton to={`/subscriptions/${subscriptionId}`} />}
      <h1 className="text-2xl font-bold text-dark-50 sm:text-3xl">
        {scopedSwitch
          ? t('subscription.switchTariff.title')
          : needsTariff(subscription)
            ? t('subscription.cta.moveToTariff')
            : isMultiTariff && !subscriptionId
              ? t('subscription.newTariff', 'Новый тариф')
              : !isMultiTariff && subscription?.is_daily && !subscription?.is_trial
                ? t('subscription.switchTariff.title')
                : t('subscription.getSubscription')}
      </h1>
    </PageEntranceItem>
  );

  // (switch preview query + switchTariffMutation moved into <SwitchTariffSheet>)

  // (tariffPurchaseMutation moved into <TariffPurchaseForm>)
  // (auto-scroll effects: switch-modal into <SwitchTariffSheet>,
  //  tariff-purchase into <TariffPurchaseForm>)

  // (classic-mode helpers moved into <ClassicPurchaseWizard>)

  if (invalidId) return <Navigate to="/subscriptions" replace />;
  if (initiallyLoading || purchaseContext.isLoading) {
    return (
      <PageEntrance className="space-y-6">
        {pageHeader}
        <SubscriptionFlowSkeleton
          mode={purchaseOptions ? (isTariffsMode ? 'tariffs' : 'classic') : 'unknown'}
          context={purchaseContext}
          count={isTariffsMode ? tariffs.length : classicOptions?.periods.length}
        />
      </PageEntrance>
    );
  }

  if (
    subscriptionError ||
    (!isTariffsMode && multiSubQuery.isError) ||
    optionsError ||
    (!purchaseOptions && !optionsLoading)
  ) {
    return (
      <PageEntrance className="space-y-6">
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
      </PageEntrance>
    );
  }

  if (subscriptionId && subscription?.id !== subscriptionId) {
    return <Navigate to="/subscriptions" replace />;
  }
  if (paidClassic) return <Navigate to={`/subscriptions/${paidClassic.id}`} replace />;

  return (
    <PageEntrance className="space-y-6">
      {/* Header */}
      {pageHeader}

      {purchaseOptions && <PurchaseContextBanners context={purchaseContext} />}

      {/* Tariffs Section */}
      {isTariffsMode && tariffs.length > 0 && (
        <PageEntranceItem>
          <section data-purchase-layout="tariffs">
            {/* Expired subscription notice */}
            {isTariffsMode &&
              purchaseOptions &&
              'subscription_is_expired' in purchaseOptions &&
              purchaseOptions.subscription_is_expired && (
                <div
                  className="mb-6 rounded-[14px] p-4"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,59,92,0.08), rgba(255,184,0,0.06))',
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

            {scopedSwitch &&
              !showPurchaseForm &&
              switchTariffId === null &&
              catalogueTariffs.length === 0 && (
                <p className="py-4 text-sm text-dark-400">
                  {t('subscription.switchTariff.noAlternatives')}
                </p>
              )}
            {!showPurchaseForm &&
            scopedSwitch &&
            switchTariffId !== null ? null : !showPurchaseForm ? (
              <TariffPickerGrid
                tariffs={catalogueTariffs}
                subscription={subscription}
                purchaseOptions={purchaseOptions}
                isTariffsMode={isTariffsMode}
                isMultiTariff={isMultiTariff}
                switchOnly={scopedSwitch}
                onSelectTariff={(tariff) => {
                  setSelectedTariff(tariff);
                  setShowTariffPurchase(true);
                }}
                onSwitchTariff={(tariffId) => setSwitchTariffId(tariffId)}
              />
            ) : (
              purchaseTariff && (
                /* Tariff Purchase Form (extracted into its own component) */
                <TariffPurchaseForm
                  key={`${accountId}:${subscriptionId}:${purchaseTariff.id}`}
                  tariff={purchaseTariff}
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
                  cispayPurchaseEnabled={
                    isTariffsMode && purchaseOptions.cispay_recurrent_enabled === true
                  }
                  cispaySubscriptionId={resolveCisPayTarget(
                    subscriptionId,
                    subscription,
                    purchaseTariff.id,
                    isMultiTariff,
                  )}
                  onBack={() => {
                    if (cisPaySetupTariff) {
                      navigate('/subscriptions/' + subscriptionId, { replace: true });
                      return;
                    }
                    setShowTariffPurchase(false);
                    setSelectedTariff(null);
                  }}
                />
              )
            )}
          </section>
        </PageEntranceItem>
      )}

      {/* Purchase/Extend Section - Classic Mode */}
      {classicOptions && classicOptions.periods.length > 0 && (
        <PageEntranceItem>
          <ClassicPurchaseWizard
            classicOptions={classicOptions}
            subscription={subscription}
            subscriptionId={subscriptionId}
          />
        </PageEntranceItem>
      )}

      {/* No options available fallback */}
      {purchaseOptions &&
        !optionsLoading &&
        !(isTariffsMode && tariffs.length > 0) &&
        !(classicOptions && classicOptions.periods.length > 0) && (
          <PageEntranceItem
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
          </PageEntranceItem>
        )}
    </PageEntrance>
  );
}
