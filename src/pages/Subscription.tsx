import { uiLocale } from '@/utils/uiLocale';
import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { subscriptionApi } from '../api/subscription';
import { WebBackButton } from '../components/WebBackButton';
import { useDestructiveConfirm } from '../platform/hooks/useNativeDialog';
import TrafficProgressBar from '../components/dashboard/TrafficProgressBar';
import { HoverBorderGradient } from '../components/ui/hover-border-gradient';
import { useTrafficZone } from '../hooks/useTrafficZone';
import { formatTraffic } from '../utils/formatTraffic';
import { getGlassColors } from '../utils/glassTheme';
import { useTheme } from '../hooks/useTheme';
import InsufficientBalancePrompt from '../components/InsufficientBalancePrompt';
import { useCurrency } from '../hooks/useCurrency';
import { useCloseOnSuccessNotification } from '../store/successNotification';
import PurchaseCTAButton from '../components/subscription/PurchaseCTAButton';
import {
  PauseIcon,
  CalendarIcon,
  RefreshIcon,
  DevicesIcon,
  DownloadIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '../components/icons';
import { useHaptic, usePlatform } from '../platform';
import { getErrorMessage, getInsufficientBalanceError } from '../utils/subscriptionHelpers';
import { openPaymentUrl } from '../utils/openPaymentUrl';
import { useToast } from '../components/Toast';
import {
  isSbpFeatureDisabledError,
  sbpIntervalLabelKey,
  sbpUiState,
  type SbpUiState,
} from '../utils/sbpRecurring';
import {
  isLavaFeatureDisabledError,
  lavaPeriodLabelKey,
  lavaUiState,
  type LavaUiState,
} from '../utils/lavaRecurring';
import { DeviceTopupSheet } from '../components/subscription/sheets/DeviceTopupSheet';
import { DeviceReductionSheet } from '../components/subscription/sheets/DeviceReductionSheet';
import { TrafficTopupSheet } from '../components/subscription/sheets/TrafficTopupSheet';
import { ServerManagementSheet } from '../components/subscription/sheets/ServerManagementSheet';
import { DeleteSubscriptionSheet } from '../components/subscription/sheets/DeleteSubscriptionSheet';

/** Isolated countdown so 1s interval doesn't re-render the whole page */
const CountdownTimer = memo(function CountdownTimer({
  endDate,
  isActive,
  glassColors: g,
}: {
  endDate: string;
  isActive: boolean;
  glassColors: ReturnType<typeof getGlassColors>;
}) {
  const { t } = useTranslation();
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const endTime = new Date(endDate).getTime();
    const tick = () => {
      const diff = Math.max(0, endTime - Date.now());
      setCountdown({
        days: Math.floor(diff / 86_400_000),
        hours: Math.floor((diff % 86_400_000) / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endDate]);

  const isExpired = !isActive;
  const isUrgent = countdown.days <= 3;

  const formattedDate = new Date(endDate).toLocaleDateString(uiLocale(), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div
      className="min-w-0 overflow-hidden rounded-[14px] p-3.5"
      style={{
        background: isExpired
          ? 'rgba(255,59,92,0.06)'
          : isUrgent
            ? 'rgba(255,184,0,0.06)'
            : g.innerBg,
        border: isExpired
          ? '1px solid rgba(255,59,92,0.15)'
          : isUrgent
            ? '1px solid rgba(255,184,0,0.15)'
            : `1px solid ${g.innerBorder}`,
      }}
    >
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-dark-50/35">
        <div
          className="flex h-6 w-6 items-center justify-center rounded-[7px]"
          style={{
            background: isExpired
              ? 'rgba(255,59,92,0.1)'
              : isUrgent
                ? 'rgba(255,184,0,0.1)'
                : g.hoverBg,
          }}
        >
          <span
            style={{
              color: isExpired
                ? 'rgb(var(--color-critical-500))'
                : isUrgent
                  ? 'rgb(var(--color-urgent-400))'
                  : g.textSecondary,
            }}
          >
            <CalendarIcon className="h-[13px] w-[13px]" />
          </span>
        </div>
        {t('dashboard.remaining')}
      </div>
      {isExpired ? (
        <div
          className="text-[18px] font-bold tracking-tight"
          style={{ color: 'rgb(var(--color-critical-500))' }}
        >
          {t('subscription.expired')}
        </div>
      ) : (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <div className="flex items-baseline gap-1 font-mono tabular-nums">
            {countdown.days > 0 && (
              <>
                <span
                  className="text-[20px] font-bold tracking-tight"
                  style={{ color: isUrgent ? 'rgb(var(--color-urgent-400))' : g.text }}
                >
                  {countdown.days}
                </span>
                <span className="mr-1 text-[10px] font-medium text-dark-50/25">
                  {t('subscription.daysShort')}
                </span>
              </>
            )}
            <span
              className="text-[20px] font-bold tracking-tight"
              style={{ color: isUrgent ? 'rgb(var(--color-urgent-400))' : g.text }}
            >
              {String(countdown.hours).padStart(2, '0')}
            </span>
            <span
              className="mx-[-1px] text-[16px] font-bold opacity-30"
              style={{ color: isUrgent ? 'rgb(var(--color-urgent-400))' : g.text }}
            >
              :
            </span>
            <span
              className="text-[20px] font-bold tracking-tight"
              style={{ color: isUrgent ? 'rgb(var(--color-urgent-400))' : g.text }}
            >
              {String(countdown.minutes).padStart(2, '0')}
            </span>
            <span
              className="mx-[-1px] text-[16px] font-bold opacity-30"
              style={{ color: isUrgent ? 'rgb(var(--color-urgent-400))' : g.text }}
            >
              :
            </span>
            <span
              className="text-[20px] font-bold tracking-tight"
              style={{ color: isUrgent ? 'rgb(var(--color-urgent-400))' : g.text }}
            >
              {String(countdown.seconds).padStart(2, '0')}
            </span>
          </div>
          <div className="text-[10px] font-medium text-dark-50/25">
            {t('subscription.expiresAt')}: {formattedDate}
          </div>
        </div>
      )}
    </div>
  );
});

interface SubscriptionProps {
  embedded?: boolean;
  selectedSubscriptionId?: number;
}

export default function Subscription({
  embedded = false,
  selectedSubscriptionId,
}: SubscriptionProps = {}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { formatAmount, currencySymbol } = useCurrency();
  const navigate = useNavigate();
  const { subscriptionId: subIdParam } = useParams<{ subscriptionId?: string }>();
  const subscriptionId =
    selectedSubscriptionId ?? (subIdParam ? parseInt(subIdParam, 10) : undefined);
  const { isDark } = useTheme();
  const g = getGlassColors(isDark);
  const haptic = useHaptic();
  const { openLink, platform } = usePlatform();
  const { showToast } = useToast();
  const [showDeleteSheet, setShowDeleteSheet] = useState(false);
  const destructiveConfirm = useDestructiveConfirm();

  // Helper to format price from kopeks
  const formatPrice = (kopeks: number) =>
    kopeks === 0
      ? t('subscription.free', 'Бесплатно')
      : `${formatAmount(kopeks / 100)} ${currencySymbol}`;

  // Device/traffic topup state
  const [showDeviceTopup, setShowDeviceTopup] = useState(false);
  const [devicesToAdd, setDevicesToAdd] = useState(1);
  const [showDeviceReduction, setShowDeviceReduction] = useState(false);
  const [targetDeviceLimit, setTargetDeviceLimit] = useState<number>(1);
  const [showTrafficTopup, setShowTrafficTopup] = useState(false);
  const [selectedTrafficPackage, setSelectedTrafficPackage] = useState<number | null>(null);
  const [showServerManagement, setShowServerManagement] = useState(false);
  const [selectedServersToUpdate, setSelectedServersToUpdate] = useState<string[]>([]);
  const [showAdditionalOptions, setShowAdditionalOptions] = useState(false);

  // Traffic refresh state
  const [trafficRefreshCooldown, setTrafficRefreshCooldown] = useState(0);

  // Revoke (reissue) cooldown state
  const [revokeCooldown, setRevokeCooldown] = useState(0);
  const [trafficData, setTrafficData] = useState<{
    traffic_used_gb: number;
    traffic_used_percent: number;
    is_unlimited: boolean;
  } | null>(null);

  // Detect multi-tariff mode from cached subscriptions-list
  const { data: multiSubData } = useQuery({
    queryKey: ['subscriptions-list'],
    queryFn: () => subscriptionApi.getSubscriptions(),
    staleTime: 60_000,
  });
  const isMultiTariff = multiSubData?.multi_tariff_enabled ?? false;

  const { data: subscriptionResponse, isLoading } = useQuery({
    queryKey: ['subscription', subscriptionId],
    queryFn: () => subscriptionApi.getSubscription(subscriptionId),
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  // Extract subscription from response (null if no subscription)
  const subscription = subscriptionResponse?.subscription ?? null;

  // Traffic zone (theme-aware) — called unconditionally at top level
  const usedPercent = trafficData?.traffic_used_percent ?? subscription?.traffic_used_percent ?? 0;
  const zone = useTrafficZone(usedPercent);

  // Purchase options (needed for balance_kopeks in device/traffic/server management)
  const { data: purchaseOptions } = useQuery({
    queryKey: ['purchase-options', subscriptionId],
    queryFn: () => subscriptionApi.getPurchaseOptions(subscriptionId),
    enabled: Boolean(subscription),
    staleTime: 0,
    refetchOnMount: 'always',
  });

  const isTariffsMode = purchaseOptions?.sales_mode === 'tariffs';

  // SBP (Platega) recurring auto-payment status. Polls every 8s while a
  // payment is PENDING (waiting for bank-app confirmation) so the UI flips
  // to 'active'/'past_due' without a manual refresh; stops polling otherwise.
  const sbpQuery = useQuery({
    queryKey: ['sbp-recurring', subscriptionId],
    queryFn: () => subscriptionApi.getSbpRecurring(subscriptionId),
    enabled: !!subscription && !subscription.is_trial,
    retry: false,
    refetchInterval: (query) => (query.state.data?.status === 'PENDING' ? 8000 : false),
  });
  const sbpInfo = sbpQuery.data;
  // 403 with a specific detail means the feature itself is disabled on the
  // backend — distinct from "not resolved yet" or "other error", both of
  // which must fail quiet (render nothing) rather than flash the 'off' state.
  const sbpFeatureDisabled = isSbpFeatureDisabledError(sbpQuery.error);
  const sbpUiStateValue: SbpUiState =
    sbpInfo !== undefined || sbpFeatureDisabled
      ? sbpUiState(sbpInfo, sbpFeatureDisabled)
      : 'hidden';

  const enableSbpMutation = useMutation({
    mutationFn: () => subscriptionApi.enableSbpRecurring(subscriptionId),
    onSuccess: (data) => {
      if (data.redirect_url) {
        openPaymentUrl(data.redirect_url, platform, openLink);
      }
      queryClient.invalidateQueries({ queryKey: ['sbp-recurring', subscriptionId] });
      // Backend flips autopay_enabled off when SBP auto-pay is enabled.
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error: unknown) => {
      const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data
        ?.detail;
      showToast({
        type: 'error',
        title: typeof detail === 'string' ? detail : t('subscription.sbpRecurring.enableError'),
        message: '',
        duration: 3000,
      });
    },
  });

  const cancelSbpMutation = useMutation({
    mutationFn: () => subscriptionApi.cancelSbpRecurring(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sbp-recurring', subscriptionId] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      showToast({
        type: 'success',
        title: t('subscription.sbpRecurring.cancelled'),
        message: '',
        duration: 3000,
      });
    },
    onError: (error: unknown) => {
      const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data
        ?.detail;
      showToast({
        type: 'error',
        title: typeof detail === 'string' ? detail : t('subscription.sbpRecurring.cancelError'),
        message: '',
        duration: 3000,
      });
    },
  });

  const handleCancelSbp = async () => {
    const confirmed = await destructiveConfirm(
      t('subscription.sbpRecurring.confirmCancel'),
      t('subscription.sbpRecurring.cancel'),
    );
    if (!confirmed) return;
    cancelSbpMutation.mutate();
  };

  // Автопродление Lava — независимый от Platega движок с той же семантикой
  // состояний. Поллинг раз в 8с, пока привязка PENDING (ждём оплату первого
  // счёта), чтобы UI сам перешёл в active/past_due.
  const lavaQuery = useQuery({
    queryKey: ['lava-recurring', subscriptionId],
    queryFn: () => subscriptionApi.getLavaRecurring(subscriptionId),
    enabled: !!subscription && !subscription.is_trial,
    retry: false,
    refetchInterval: (query) => (query.state.data?.status === 'PENDING' ? 8000 : false),
  });
  const lavaInfo = lavaQuery.data;
  const lavaFeatureDisabled = isLavaFeatureDisabledError(lavaQuery.error);
  const lavaUiStateValue: LavaUiState =
    lavaInfo !== undefined || lavaFeatureDisabled
      ? lavaUiState(lavaInfo, lavaFeatureDisabled)
      : 'hidden';

  const enableLavaMutation = useMutation({
    mutationFn: () => subscriptionApi.enableLavaRecurring(subscriptionId),
    onSuccess: (data) => {
      if (data.redirect_url) {
        openPaymentUrl(data.redirect_url, platform, openLink);
      }
      queryClient.invalidateQueries({ queryKey: ['lava-recurring', subscriptionId] });
      // Бэкенд снимает autopay_enabled при включении рекуррента провайдера.
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error: unknown) => {
      const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data
        ?.detail;
      showToast({
        type: 'error',
        title: typeof detail === 'string' ? detail : t('subscription.lavaRecurring.enableError'),
        message: '',
        duration: 3000,
      });
    },
  });

  const cancelLavaMutation = useMutation({
    mutationFn: () => subscriptionApi.cancelLavaRecurring(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lava-recurring', subscriptionId] });
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      showToast({
        type: 'success',
        title: t('subscription.lavaRecurring.cancelled'),
        message: '',
        duration: 3000,
      });
    },
    onError: (error: unknown) => {
      const detail = (error as { response?: { data?: { detail?: unknown } } })?.response?.data
        ?.detail;
      showToast({
        type: 'error',
        title: typeof detail === 'string' ? detail : t('subscription.lavaRecurring.cancelError'),
        message: '',
        duration: 3000,
      });
    },
  });

  const handleCancelLava = async () => {
    const confirmed = await destructiveConfirm(
      t('subscription.lavaRecurring.confirmCancel'),
      t('subscription.lavaRecurring.cancel'),
    );
    if (!confirmed) return;
    cancelLavaMutation.mutate();
  };

  const autopayMutation = useMutation({
    mutationFn: (enabled: boolean) =>
      subscriptionApi.updateAutopay(enabled, undefined, subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
      // Enabling balance-autopay cancels SBP auto-pay server-side — refresh so
      // the SBP block doesn't keep showing a now-stale 'active'/'pending' state.
      queryClient.invalidateQueries({ queryKey: ['sbp-recurring', subscriptionId] });
    },
  });

  // Devices query
  const { data: devicesData } = useQuery({
    queryKey: ['devices', subscriptionId],
    queryFn: () => subscriptionApi.getDevices(subscriptionId),
    enabled: !!subscription,
  });

  // Pause subscription mutation
  const pauseMutation = useMutation({
    mutationFn: () => subscriptionApi.togglePause(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
    },
  });

  // Auto-close all modals/forms when success notification appears
  const handleCloseAllModals = useCallback(() => {
    setShowDeviceTopup(false);
    setShowDeviceReduction(false);
    setShowTrafficTopup(false);
    setShowServerManagement(false);
    setShowAdditionalOptions(false);
  }, []);
  useCloseOnSuccessNotification(handleCloseAllModals);

  // (device price + purchase moved into <DeviceTopupSheet>)
  // (device reduction info + mutation moved into <DeviceReductionSheet>)

  // (traffic packages + purchase moved into <TrafficTopupSheet>)
  // (countries query + update mutation moved into <ServerManagementSheet>)

  // Traffic refresh mutation
  const refreshTrafficMutation = useMutation({
    mutationFn: () => subscriptionApi.refreshTraffic(subscriptionId),
    onSuccess: (data) => {
      setTrafficData({
        traffic_used_gb: data.traffic_used_gb,
        traffic_used_percent: data.traffic_used_percent,
        is_unlimited: data.is_unlimited,
      });
      localStorage.setItem(
        `traffic_refresh_ts_${subscriptionId ?? 'default'}`,
        Date.now().toString(),
      );
      if (data.rate_limited && data.retry_after_seconds) {
        setTrafficRefreshCooldown(data.retry_after_seconds);
      } else {
        setTrafficRefreshCooldown(30);
      }
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error: {
      response?: { status?: number; headers?: { get?: (key: string) => string } };
    }) => {
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers?.get?.('Retry-After');
        setTrafficRefreshCooldown(retryAfter ? parseInt(retryAfter, 10) : 30);
      }
    },
  });

  // Track if we've already triggered auto-refresh this session
  const hasAutoRefreshed = useRef(false);

  // Cooldown timer for traffic refresh
  useEffect(() => {
    if (trafficRefreshCooldown <= 0) return;
    const timer = setInterval(() => {
      setTrafficRefreshCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [trafficRefreshCooldown]);

  // Initialize revoke cooldown from localStorage on mount
  useEffect(() => {
    const ts = localStorage.getItem(`revoke_ts_${subscriptionId ?? 'default'}`);
    if (ts) {
      const elapsed = Math.floor((Date.now() - parseInt(ts, 10)) / 1000);
      const remaining = Math.max(0, 900 - elapsed);
      setRevokeCooldown(remaining);
    }
  }, [subscriptionId]);

  // Countdown timer for revoke cooldown
  useEffect(() => {
    if (revokeCooldown <= 0) return;
    const timer = setInterval(() => {
      setRevokeCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [revokeCooldown]);

  // Revoke (reissue) subscription mutation
  const revokeMutation = useMutation({
    mutationFn: () => subscriptionApi.revokeSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['connection-link', subscriptionId] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
      // Remnawave resets device HWIDs on revoke — make sure the cabinet
      // re-reads the now-empty device list instead of showing the stale cache.
      queryClient.invalidateQueries({ queryKey: ['devices', subscriptionId] });
      haptic.notification('success');
      localStorage.setItem(`revoke_ts_${subscriptionId ?? 'default'}`, Date.now().toString());
      setRevokeCooldown(900);
    },
    onError: () => {
      haptic.notification('error');
    },
  });

  // Auto-refresh traffic on mount (with 30s caching)
  useEffect(() => {
    if (embedded) return;
    if (!subscription) return;
    if (hasAutoRefreshed.current) return;
    hasAutoRefreshed.current = true;

    const lastRefresh = localStorage.getItem(`traffic_refresh_ts_${subscriptionId ?? 'default'}`);
    const now = Date.now();
    const cacheMs = 30 * 1000;

    if (lastRefresh && now - parseInt(lastRefresh, 10) < cacheMs) {
      const elapsed = now - parseInt(lastRefresh, 10);
      const remaining = Math.ceil((cacheMs - elapsed) / 1000);
      if (remaining > 0) {
        setTrafficRefreshCooldown(remaining);
      }
      return;
    }

    refreshTrafficMutation.mutate();
  }, [embedded, subscription, refreshTrafficMutation, subscriptionId]);

  const handleRevoke = async () => {
    const confirmed = await destructiveConfirm(
      t('subscription.revoke.warning'),
      t('subscription.revoke.confirmBtn'),
      t('subscription.revoke.title'),
    );
    if (!confirmed) return;
    revokeMutation.mutate();
  };

  const hasEmbeddedSubscriptionSettings = Boolean(
    subscription &&
      ((subscription.traffic_purchases?.length ?? 0) > 0 ||
        (!subscription.is_trial && !subscription.is_daily) ||
        (!subscription.is_trial && sbpUiStateValue !== 'hidden') ||
        (!subscription.is_trial && lavaUiStateValue !== 'hidden')),
  );

  // In multi-tariff mode without a specific subscription ID, redirect to list
  if (isMultiTariff && !subscriptionId && !isLoading) {
    return <Navigate to="/subscriptions" replace />;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
      </div>
    );
  }

  if (!subscription && subscriptionId) {
    return (
      <div className="mx-auto max-w-lg p-4 text-center">
        <div className="mb-4 text-4xl">😕</div>
        <h2 className="mb-2 text-xl font-bold text-dark-50">
          {t('subscription.notFound', 'Подписка не найдена')}
        </h2>
        <p className="mb-4 text-sm text-dark-50/60">
          {t('subscription.notFoundDesc', 'Возможно, подписка была удалена или не существует')}
        </p>
        <button
          onClick={() => navigate('/subscriptions')}
          className="rounded-xl bg-accent-500 px-6 py-2.5 text-sm font-medium text-on-accent"
        >
          {t('subscription.backToList', 'Мои подписки')}
        </button>
      </div>
    );
  }

  return (
    <div className={embedded ? 'space-y-4' : 'space-y-6'}>
      {!embedded && (
        <div className="flex items-center gap-3">
          <WebBackButton to={isMultiTariff ? '/subscriptions' : '/'} />
          <h1 className="text-2xl font-bold text-dark-50 sm:text-3xl">
            {isMultiTariff && subscription?.tariff_name
              ? subscription.tariff_name
              : t('subscription.title')}
          </h1>
        </div>
      )}

      {/* Purchase / Renewal CTA */}
      <PurchaseCTAButton subscription={subscription} isMultiTariff={isMultiTariff} />

      {embedded && subscription && (
        <Link
          to={`/subscriptions/${subscription.id}?overlay=devices`}
          state={{ cabinetOverlayParent: true }}
          onClick={() => haptic.impact('light')}
          className="flex min-h-16 w-full items-center gap-3 rounded-2xl border border-dark-700/60 bg-dark-900/70 p-4 text-left transition-colors hover:border-dark-600/80 hover:bg-dark-800/70"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400">
            <DevicesIcon className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-dark-100">
              {t('subscription.myDevices')}
            </span>
            <span className="mt-0.5 block text-xs text-dark-400">
              {devicesData
                ? t('subscription.additionalOptions.connectedDevices', {
                    count: devicesData.total,
                  })
                : t('dashboard.dataUnavailable')}
            </span>
          </span>
          <ChevronRightIcon className="h-5 w-5 shrink-0 text-dark-500 rtl:rotate-180" />
        </Link>
      )}

      {/* Current Subscription */}
      {subscription && (!embedded || hasEmbeddedSubscriptionSettings) ? (
        (() => {
          const usedGb = trafficData?.traffic_used_gb ?? subscription.traffic_used_gb;
          const isUnlimited =
            (trafficData?.is_unlimited ?? false) || subscription.traffic_limit_gb === 0;
          const connectedDevices = devicesData?.total ?? 0;
          const isAtDeviceLimit =
            subscription.device_limit > 0 && connectedDevices >= subscription.device_limit;

          return (
            <div
              className="relative overflow-hidden rounded-3xl lg:backdrop-blur-xl"
              style={{
                background: g.cardBg,
                border: subscription.is_trial
                  ? '1px solid rgba(var(--color-accent-400), 0.15)'
                  : isDark
                    ? `1px solid ${g.cardBorder}`
                    : `1px solid ${zone.mainHex}25`,
                boxShadow: isDark
                  ? g.shadow
                  : `0 2px 16px ${zone.mainHex}12, 0 0 0 1px ${zone.mainHex}08`,
                padding: embedded ? '12px' : '28px 28px 24px',
              }}
            >
              {/* Decorative ambient radial + trial shimmer border were
                  removed: they carried no information, leaked zone/accent
                  hue into pure decoration (violates DESIGN.md
                  Tunable-but-Scarce + Status-Hue Lockout rules), and the
                  same chrome was distilled out of SubscriptionCardActive
                  earlier in this branch. Trial state is conveyed by the
                  header badge. */}

              {/* ─── Header ─── */}
              {!embedded && (
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    {/* Zone indicator */}
                    <div className="mb-1 flex items-center gap-2">
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{
                          background: zone.mainHex,
                          boxShadow: `0 0 8px ${zone.mainHex}80`,
                          transition: 'all 0.6s ease',
                        }}
                        aria-hidden="true"
                      />
                      <span
                        className="font-mono text-[11px] font-semibold uppercase tracking-widest"
                        style={{ color: zone.mainHex, transition: 'color 0.6s ease' }}
                      >
                        {isUnlimited ? t('dashboard.unlimited') : t(zone.labelKey)}
                      </span>
                    </div>

                    {/* Plan name */}
                    <h2 className="text-lg font-bold tracking-tight text-dark-50">
                      {subscription.tariff_name || t('subscription.currentPlan')}
                    </h2>
                  </div>

                  {/* Status badge */}
                  <span
                    className="max-w-[55%] shrink-0 rounded-full px-3 py-1 text-center font-mono text-[10px] font-semibold uppercase tracking-wider"
                    style={{
                      background: subscription.is_active
                        ? `${zone.mainHex}15`
                        : subscription.is_limited
                          ? 'rgba(255,184,0,0.12)'
                          : 'rgba(255,59,92,0.12)',
                      border: subscription.is_active
                        ? `1px solid ${zone.mainHex}30`
                        : subscription.is_limited
                          ? '1px solid rgba(255,184,0,0.25)'
                          : '1px solid rgba(255,59,92,0.25)',
                      color: subscription.is_active
                        ? zone.mainHex
                        : subscription.is_limited
                          ? 'rgb(var(--color-urgent-400))'
                          : 'rgb(var(--color-critical-500))',
                    }}
                  >
                    {subscription.is_active
                      ? subscription.is_trial
                        ? t('subscription.trialStatus')
                        : t('subscription.active')
                      : subscription.is_limited
                        ? t('subscription.trafficLimited')
                        : subscription.status === 'disabled'
                          ? t('subscription.pause.suspended')
                          : t('subscription.expired')}
                  </span>
                </div>
              )}

              {/* ─── Traffic Limited Banner ─── */}
              {!embedded && subscription.is_limited && (
                <div
                  className="mb-6 rounded-[14px] p-4"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(255,184,0,0.08), rgba(255,184,0,0.03))',
                    border: '1px solid rgba(255,184,0,0.2)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px]"
                      style={{ background: 'rgba(255,184,0,0.12)' }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgb(var(--color-urgent-400))"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: 'rgb(var(--color-urgent-400))' }}
                      >
                        {t('subscription.trafficLimitedTitle')}
                      </p>
                      <p className="mt-1 text-xs text-dark-400">
                        {t('subscription.trafficLimitedDescription')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Trial Info Banner ─── */}
              {!embedded && subscription.is_trial && subscription.is_active && (
                <div
                  className="mb-6 rounded-[14px] p-4"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(var(--color-accent-400), 0.08), rgba(var(--color-accent-400), 0.03))',
                    border: '1px solid rgba(var(--color-accent-400), 0.12)',
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px]"
                      style={{ background: 'rgba(var(--color-accent-400), 0.12)' }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgb(var(--color-accent-400))"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <div
                        className="text-sm font-semibold"
                        style={{ color: 'rgb(var(--color-accent-400))' }}
                      >
                        {t('subscription.trialInfo.title')}
                      </div>
                      <div className="mt-1 text-[12px] text-dark-50/40">
                        {t('subscription.trialInfo.description')}
                      </div>
                      <div className="mt-3 flex flex-wrap gap-4">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-mono text-[12px] font-semibold"
                            style={{ color: 'rgb(var(--color-accent-400))' }}
                          >
                            {subscription.days_left > 0
                              ? t('subscription.days', { count: subscription.days_left })
                              : `${subscription.hours_left}${t('subscription.hours')} ${subscription.minutes_left}${t('subscription.minutes')}`}
                          </span>
                          <span className="text-[11px] text-dark-50/30">
                            {t('subscription.trialInfo.remaining')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-mono text-[12px] font-semibold"
                            style={{ color: 'rgb(var(--color-accent-400))' }}
                          >
                            {subscription.traffic_limit_gb || '∞'} {t('common.units.gb')}
                          </span>
                          <span className="text-[11px] text-dark-50/30">
                            {t('subscription.traffic')}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="font-mono text-[12px] font-semibold"
                            style={{ color: 'rgb(var(--color-accent-400))' }}
                          >
                            {subscription.device_limit === 0 ? '∞' : subscription.device_limit}
                          </span>
                          <span className="text-[11px] text-dark-50/30">
                            {t('subscription.devices')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─── Traffic Progress ─── */}
              {!embedded && (
                <div className="mb-6">
                  <div className="mb-2.5 flex items-center justify-between">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-dark-50/40">
                      {t('subscription.traffic')}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-dark-50/30">
                        {isUnlimited
                          ? formatTraffic(usedGb)
                          : `${formatTraffic(usedGb)} / ${formatTraffic(subscription.traffic_limit_gb)}`}
                      </span>
                      <button
                        onClick={() => refreshTrafficMutation.mutate()}
                        disabled={refreshTrafficMutation.isPending || trafficRefreshCooldown > 0}
                        className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-dark-50/30 transition-colors hover:bg-dark-50/[0.05] hover:text-dark-50/50 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <RefreshIcon
                          className="h-3 w-3"
                          spinning={refreshTrafficMutation.isPending}
                        />
                        {trafficRefreshCooldown > 0
                          ? `${trafficRefreshCooldown}s`
                          : t('common.refresh')}
                      </button>
                    </div>
                  </div>
                  {subscription.traffic_reset_mode &&
                    subscription.traffic_reset_mode !== 'NO_RESET' && (
                      <div className="mb-2 text-[10px] text-dark-50/25">
                        {t(`subscription.trafficReset.${subscription.traffic_reset_mode}`)}
                      </div>
                    )}
                  <TrafficProgressBar
                    usedGb={usedGb}
                    limitGb={subscription.traffic_limit_gb}
                    percent={usedPercent}
                    isUnlimited={isUnlimited}
                    compact
                  />
                </div>
              )}

              {/* ─── Connect Device Button ─── */}
              {!embedded && subscription.subscription_url && (
                <HoverBorderGradient
                  as="button"
                  accentColor={zone.mainHex}
                  disabled={isAtDeviceLimit}
                  onClick={() => {
                    if (isAtDeviceLimit) {
                      haptic.notification('error');
                      return;
                    }
                    navigate(subscriptionId ? `/connection?sub=${subscriptionId}` : '/connection');
                  }}
                  className={`mb-5 flex w-full items-center gap-3.5 rounded-[14px] p-3.5 text-left transition-shadow duration-300${isAtDeviceLimit ? 'cursor-not-allowed opacity-50' : ''}`}
                  style={{ fontFamily: 'inherit' }}
                >
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] transition-colors duration-500"
                    style={{ background: `${zone.mainHex}12`, color: zone.mainHex }}
                  >
                    <DevicesIcon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold tracking-tight text-dark-50">
                      {t('dashboard.connectDevice')}
                    </div>
                    <div className="mt-0.5 text-[11px] text-dark-50/30">
                      {subscription.device_limit === 0
                        ? t('dashboard.devicesConnectedUnlimited', { used: connectedDevices })
                        : t('dashboard.devicesOfMax', {
                            used: connectedDevices,
                            max: subscription.device_limit,
                          })}
                    </div>
                    {isAtDeviceLimit && (
                      <div
                        className="mt-1 text-[10px] font-medium"
                        style={{ color: 'rgb(var(--color-warning-400))' }}
                      >
                        {t('dashboard.deviceLimitReached')}
                      </div>
                    )}
                  </div>
                  {subscription.device_limit === 0 ? (
                    <div
                      className="flex flex-shrink-0 items-center text-lg text-dark-50/40"
                      aria-hidden="true"
                    >
                      ∞
                    </div>
                  ) : subscription.device_limit <= 10 ? (
                    <div className="flex flex-shrink-0 gap-1.5" aria-hidden="true">
                      {Array.from({ length: subscription.device_limit }, (_, i) => (
                        <div
                          key={i}
                          className="h-[7px] w-[7px] rounded-full transition-[background-color,box-shadow] duration-300"
                          style={{
                            background: i < connectedDevices ? zone.mainHex : g.textGhost,
                            boxShadow: i < connectedDevices ? `0 0 6px ${zone.mainHex}50` : 'none',
                          }}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="flex w-16 flex-shrink-0 items-center" aria-hidden="true">
                      <div
                        className="h-[6px] w-full overflow-hidden rounded-full"
                        style={{ background: g.textGhost }}
                      >
                        {/* scaleX (compositor) instead of width (layout-thrash).
                            Track is 64px (w-16), so 0.0625 floor = 4px minimum,
                            preserving the prior minWidth behaviour. */}
                        <div
                          className="h-full w-full origin-left rounded-full transition-transform duration-500"
                          style={{
                            transform: `scaleX(${(() => {
                              const pct = connectedDevices / subscription.device_limit;
                              return connectedDevices > 0 ? Math.max(pct, 0.0625) : 0;
                            })()})`,
                            background: zone.mainHex,
                            boxShadow: `0 0 8px ${zone.mainHex}40`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </HoverBorderGradient>
              )}

              {/* ─── Countdown ─── */}
              {!embedded && (
                <div className="mb-5">
                  <CountdownTimer
                    endDate={subscription.end_date}
                    isActive={subscription.is_active || subscription.is_limited}
                    glassColors={g}
                  />
                </div>
              )}

              {/* ─── Purchased Traffic Packages ─── */}
              {subscription.traffic_purchases && subscription.traffic_purchases.length > 0 && (
                <div className="mb-5">
                  <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-dark-50/35">
                    {t('subscription.purchasedTraffic')}
                  </div>
                  <div className="space-y-2">
                    {subscription.traffic_purchases.map((purchase) => (
                      <div
                        key={purchase.id}
                        className="rounded-[12px] p-3"
                        style={{
                          background: g.innerBg,
                          border: `1px solid ${g.innerBorder}`,
                        }}
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className="flex h-7 w-7 items-center justify-center rounded-[8px]"
                              style={{ background: `${zone.mainHex}12`, color: zone.mainHex }}
                            >
                              <DownloadIcon className="h-3.5 w-3.5" />
                            </div>
                            <span className="text-sm font-semibold text-dark-50">
                              {purchase.traffic_gb} {t('common.units.gb')}
                            </span>
                          </div>
                          <div className="text-right">
                            <div
                              className="text-[11px] font-medium"
                              style={{
                                color: purchase.days_remaining === 0 ? '#FF6B35' : g.textSecondary,
                              }}
                            >
                              {purchase.days_remaining === 0
                                ? t('subscription.expired')
                                : t('subscription.days', { count: purchase.days_remaining })}
                            </div>
                            <div className="mt-0.5 font-mono text-[9px] text-dark-50/20">
                              {t('subscription.trafficResetAt')}:{' '}
                              {new Date(purchase.expires_at).toLocaleDateString(uiLocale(), {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                              })}
                            </div>
                          </div>
                        </div>
                        <div
                          className="relative h-1.5 overflow-hidden rounded-full"
                          style={{ background: g.trackBg }}
                        >
                          <div
                            className="absolute inset-0 origin-left rounded-full bg-accent-500 transition-transform duration-500"
                            style={{
                              transform: `scaleX(${purchase.progress_percent / 100})`,
                            }}
                          />
                        </div>
                        <div className="mt-1 flex justify-between font-mono text-[9px] text-dark-50/20">
                          <span>
                            {new Date(purchase.created_at).toLocaleDateString(uiLocale())}
                          </span>
                          <span>
                            {new Date(purchase.expires_at).toLocaleDateString(uiLocale())}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── Autopay Toggle ─── */}
              {!subscription.is_trial && !subscription.is_daily && (
                <div
                  className="flex items-center justify-between rounded-[14px] p-3.5"
                  style={{
                    background: g.innerBg,
                    border: `1px solid ${g.innerBorder}`,
                  }}
                >
                  <div>
                    <div className="text-sm font-semibold text-dark-50">
                      {t('subscription.autoRenewal')}
                    </div>
                    <div className="mt-0.5 text-[11px] text-dark-50/30">
                      {t('subscription.daysBeforeExpiry', {
                        count: subscription.autopay_days_before,
                      })}
                    </div>
                  </div>
                  <button
                    onClick={() => autopayMutation.mutate(!subscription.autopay_enabled)}
                    disabled={autopayMutation.isPending}
                    role="switch"
                    aria-checked={subscription.autopay_enabled}
                    aria-label={t('subscription.autopay', 'Auto-payment')}
                    className="relative h-7 w-[52px] rounded-full transition-colors duration-300"
                    style={{
                      background: subscription.autopay_enabled ? zone.mainHex : g.textGhost,
                    }}
                  >
                    {/* translateX (compositor) instead of left (layout-thrash).
                        Resting position pinned at left:3px; on toggles a 23px
                        slide on the GPU. */}
                    <span
                      className="absolute left-[3px] top-[3px] h-[22px] w-[22px] rounded-full bg-white transition-transform duration-300"
                      style={{
                        transform: subscription.autopay_enabled
                          ? 'translateX(23px)'
                          : 'translateX(0)',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      }}
                    />
                  </button>
                </div>
              )}

              {/* ─── SBP Recurring Auto-payment ───
                   Sibling of the autopay toggle above, guarded ONLY by
                   is_trial + uiState — daily-tariff subscriptions must see
                   this block too (backend supports a day-interval charge). */}
              {!subscription.is_trial &&
                (!embedded || showAdditionalOptions) &&
                sbpUiStateValue !== 'hidden' && (
                  <div
                    className="mt-3 rounded-[14px] p-3.5"
                    style={{
                      background: g.innerBg,
                      border: `1px solid ${g.innerBorder}`,
                    }}
                  >
                    {/* Заголовок и статус слева, компактное действие справа —
                      зеркально соседнему тогглу «Автопродление». На мобиле
                      кнопка падает вниз на всю ширину (w-full sm:w-auto). */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-dark-50">
                          {t('subscription.sbpRecurring.title')}
                        </div>

                        {sbpUiStateValue === 'off' && (
                          <div className="mt-0.5 text-[11px] text-dark-50/30">
                            {t('subscription.sbpRecurring.autopayHint')}
                          </div>
                        )}
                        {sbpUiStateValue === 'pending' && (
                          <div className="mt-0.5 text-[11px] text-dark-50/30">
                            {t('subscription.sbpRecurring.statusPending')}
                          </div>
                        )}
                        {sbpUiStateValue === 'active' && sbpInfo && (
                          <>
                            <div className="mt-0.5 text-[11px] text-dark-50/30">
                              {t('subscription.sbpRecurring.amountPerInterval', {
                                amount: formatAmount((sbpInfo.amount_kopeks ?? 0) / 100),
                                interval: t(sbpIntervalLabelKey(sbpInfo.interval)),
                              })}
                            </div>
                            {sbpInfo.next_charge_at && (
                              <div className="mt-0.5 text-[11px] text-dark-50/30">
                                {t('subscription.sbpRecurring.nextCharge', {
                                  date: new Date(sbpInfo.next_charge_at).toLocaleDateString(
                                    uiLocale(),
                                    {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    },
                                  ),
                                })}
                              </div>
                            )}
                          </>
                        )}
                        {sbpUiStateValue === 'past_due' && (
                          <div className="mt-0.5 text-[11px] font-medium text-warning-400">
                            {t('subscription.sbpRecurring.statusPastDue')}
                          </div>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                        {sbpUiStateValue === 'off' && (
                          <button
                            onClick={() => enableSbpMutation.mutate()}
                            disabled={enableSbpMutation.isPending}
                            className="w-full whitespace-nowrap rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-medium text-on-accent transition-opacity disabled:opacity-50 sm:w-auto"
                          >
                            {enableSbpMutation.isPending ? (
                              <span className="mx-auto block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              t('subscription.sbpRecurring.connect')
                            )}
                          </button>
                        )}

                        {sbpUiStateValue === 'pending' && (
                          <>
                            {sbpInfo?.redirect_url && (
                              <button
                                onClick={() => {
                                  if (sbpInfo.redirect_url) {
                                    openPaymentUrl(sbpInfo.redirect_url, platform, openLink);
                                  }
                                }}
                                className="w-full whitespace-nowrap rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-medium text-on-accent transition-opacity sm:w-auto"
                              >
                                {t('subscription.sbpRecurring.confirmInBank')}
                              </button>
                            )}
                            <button
                              onClick={handleCancelSbp}
                              disabled={cancelSbpMutation.isPending}
                              className="text-[11px] font-medium transition-colors disabled:opacity-50 sm:text-right"
                              style={{ color: 'rgb(var(--color-critical-500))' }}
                            >
                              {t('subscription.sbpRecurring.cancel')}
                            </button>
                          </>
                        )}

                        {(sbpUiStateValue === 'active' || sbpUiStateValue === 'past_due') && (
                          <button
                            onClick={handleCancelSbp}
                            disabled={cancelSbpMutation.isPending}
                            className="w-full whitespace-nowrap rounded-xl border border-error-500/30 bg-error-500/10 px-5 py-2.5 text-sm font-medium text-error-400 transition-colors hover:bg-error-500/20 disabled:opacity-50 sm:w-auto"
                          >
                            {t('subscription.sbpRecurring.cancel')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

              {/* ─── Автопродление Lava ───
                   Независимый от Platega движок: сиблинг того же тоггла, те же
                   состояния. Период задан продуктом в кабинете Lava и приезжает
                   числом дней, поэтому подпись строится из charge_days. */}
              {!subscription.is_trial &&
                (!embedded || showAdditionalOptions) &&
                lavaUiStateValue !== 'hidden' && (
                  <div
                    className="mt-3 rounded-[14px] p-3.5"
                    style={{
                      background: g.innerBg,
                      border: `1px solid ${g.innerBorder}`,
                    }}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-dark-50">
                          {t('subscription.lavaRecurring.title')}
                        </div>

                        {lavaUiStateValue === 'off' && (
                          <div className="mt-0.5 text-[11px] text-dark-50/30">
                            {t('subscription.lavaRecurring.autopayHint')}
                          </div>
                        )}
                        {lavaUiStateValue === 'pending' && (
                          <div className="mt-0.5 text-[11px] text-dark-50/30">
                            {t('subscription.lavaRecurring.statusPending')}
                          </div>
                        )}
                        {lavaUiStateValue === 'active' && lavaInfo && (
                          <>
                            <div className="mt-0.5 text-[11px] text-dark-50/30">
                              {(() => {
                                const periodKey = lavaPeriodLabelKey(lavaInfo.charge_days);
                                const amount = formatAmount((lavaInfo.amount_kopeks ?? 0) / 100);
                                return periodKey
                                  ? t('subscription.lavaRecurring.amountPerPeriod', {
                                      amount,
                                      period: t(periodKey),
                                    })
                                  : t('subscription.lavaRecurring.amountPerDays', {
                                      amount,
                                      days: lavaInfo.charge_days ?? 0,
                                    });
                              })()}
                            </div>
                            {lavaInfo.next_charge_at && (
                              <div className="mt-0.5 text-[11px] text-dark-50/30">
                                {t('subscription.lavaRecurring.nextCharge', {
                                  date: new Date(lavaInfo.next_charge_at).toLocaleDateString(
                                    uiLocale(),
                                    {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric',
                                    },
                                  ),
                                })}
                              </div>
                            )}
                          </>
                        )}
                        {lavaUiStateValue === 'past_due' && (
                          <div className="mt-0.5 text-[11px] font-medium text-warning-400">
                            {t('subscription.lavaRecurring.statusPastDue')}
                          </div>
                        )}
                      </div>

                      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                        {lavaUiStateValue === 'off' && (
                          <button
                            onClick={() => enableLavaMutation.mutate()}
                            disabled={enableLavaMutation.isPending}
                            className="w-full whitespace-nowrap rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-medium text-on-accent transition-opacity disabled:opacity-50 sm:w-auto"
                          >
                            {enableLavaMutation.isPending ? (
                              <span className="mx-auto block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              t('subscription.lavaRecurring.connect')
                            )}
                          </button>
                        )}

                        {lavaUiStateValue === 'pending' && (
                          <>
                            {lavaInfo?.redirect_url && (
                              <button
                                onClick={() => {
                                  if (lavaInfo.redirect_url) {
                                    openPaymentUrl(lavaInfo.redirect_url, platform, openLink);
                                  }
                                }}
                                className="w-full whitespace-nowrap rounded-xl bg-accent-500 px-5 py-2.5 text-sm font-medium text-on-accent transition-opacity sm:w-auto"
                              >
                                {t('subscription.lavaRecurring.payFirst')}
                              </button>
                            )}
                            <button
                              onClick={handleCancelLava}
                              disabled={cancelLavaMutation.isPending}
                              className="text-[11px] font-medium transition-colors disabled:opacity-50 sm:text-right"
                              style={{ color: 'rgb(var(--color-critical-500))' }}
                            >
                              {t('subscription.lavaRecurring.cancel')}
                            </button>
                          </>
                        )}

                        {(lavaUiStateValue === 'active' || lavaUiStateValue === 'past_due') && (
                          <button
                            onClick={handleCancelLava}
                            disabled={cancelLavaMutation.isPending}
                            className="w-full whitespace-nowrap rounded-xl border border-error-500/30 bg-error-500/10 px-5 py-2.5 text-sm font-medium text-error-400 transition-colors hover:bg-error-500/20 disabled:opacity-50 sm:w-auto"
                          >
                            {t('subscription.lavaRecurring.cancel')}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
            </div>
          );
        })()
      ) : !subscription && !embedded ? (
        <div
          className="relative overflow-hidden rounded-3xl py-12 text-center"
          style={{
            background: g.cardBg,
            border: `1px solid ${g.cardBorder}`,
            boxShadow: g.shadow,
          }}
        >
          <div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{ background: g.hoverBg, color: g.textFaint }}
          >
            <TrashIcon className="h-8 w-8" />
          </div>
          <div className="text-sm text-dark-50/30">{t('subscription.noSubscription')}</div>
        </div>
      ) : null}

      {/* Daily Subscription Pause */}
      {subscription && subscription.is_daily && !subscription.is_trial && (
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
              <div className="mt-1 text-[12px] text-dark-50/35">
                {subscription.is_limited
                  ? t('subscription.trafficLimited')
                  : subscription.status === 'disabled'
                    ? t('subscription.pause.suspended')
                    : subscription.is_daily_paused
                      ? t('subscription.pause.paused')
                      : t('subscription.pause.active')}
              </div>
            </div>
            <button
              onClick={() => pauseMutation.mutate()}
              disabled={pauseMutation.isPending}
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
              {pauseMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                </span>
              ) : subscription.is_daily_paused || subscription.status === 'disabled' ? (
                t('subscription.pause.resumeBtn')
              ) : (
                t('subscription.pause.pauseBtn')
              )}
            </button>
          </div>

          {/* Pause mutation error */}
          {pauseMutation.isError &&
            (() => {
              const balanceError = getInsufficientBalanceError(pauseMutation.error);
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
                  {getErrorMessage(pauseMutation.error)}
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
                  <div className="mt-1 text-[12px] text-dark-50/35">
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
                : subscription.next_daily_charge_at + 'Z';
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
                    <span className="text-[11px] font-medium uppercase tracking-wider text-dark-50/35">
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
                    <div className="mt-2 text-center text-[11px] text-dark-50/25">
                      {t('subscription.pause.willBeCharged')}:{' '}
                      {formatPrice(subscription.daily_price_kopeks)}
                    </div>
                  )}
                </div>
              );
            })()
          )}
        </div>
      )}

      {/* Delete expired subscription */}
      {isMultiTariff &&
        subscription &&
        !subscription.is_active &&
        !subscription.is_trial &&
        !subscription.is_limited && (
          <div className="space-y-3">
            <DeleteSubscriptionSheet
              subscriptionId={subscription.id}
              open={showDeleteSheet}
              onOpen={() => setShowDeleteSheet(true)}
              onClose={() => setShowDeleteSheet(false)}
              textSecondary={g.textSecondary}
              onDeleted={() => {
                queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
                navigate('/subscriptions', { replace: true });
              }}
            />
          </div>
        )}

      {/* Secondary subscription actions stay collapsed until requested. */}
      {subscription &&
        (subscription.is_active || subscription.is_limited) &&
        !subscription.is_trial && (
          <div
            className="relative overflow-hidden rounded-3xl"
            style={{
              background: g.cardBg,
              border: `1px solid ${g.cardBorder}`,
              boxShadow: g.shadow,
              padding: embedded ? '12px' : '24px 28px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                const nextOpen = !showAdditionalOptions;
                setShowAdditionalOptions(nextOpen);
                if (!nextOpen) {
                  setShowDeviceTopup(false);
                  setShowDeviceReduction(false);
                  setShowTrafficTopup(false);
                  setShowServerManagement(false);
                }
              }}
              className="flex min-h-11 w-full items-center justify-between gap-3 text-left"
              aria-expanded={showAdditionalOptions}
            >
              <span className="text-sm font-semibold tracking-tight text-dark-50">
                {t('subscription.additionalOptions.title')}
              </span>
              <ChevronDownIcon
                className={`h-5 w-5 shrink-0 text-dark-400 transition-transform ${showAdditionalOptions ? 'rotate-180' : ''}`}
              />
            </button>

            {showAdditionalOptions && (
              <div className="mt-3 space-y-3">
                {subscription.device_limit !== 0 && (
                  <>
                    <DeviceTopupSheet
                      open={showDeviceTopup}
                      onOpen={() => {
                        setShowDeviceTopup(true);
                        setShowDeviceReduction(false);
                        setShowTrafficTopup(false);
                        setShowServerManagement(false);
                      }}
                      onClose={() => setShowDeviceTopup(false)}
                      subscription={subscription}
                      subscriptionId={subscriptionId}
                      devicesToAdd={devicesToAdd}
                      onDevicesToAddChange={setDevicesToAdd}
                      purchaseOptions={purchaseOptions}
                      isDark={isDark}
                    />

                    <DeviceReductionSheet
                      open={showDeviceReduction}
                      onOpen={() => {
                        setShowDeviceTopup(false);
                        setShowDeviceReduction(true);
                        setShowTrafficTopup(false);
                        setShowServerManagement(false);
                      }}
                      onClose={() => setShowDeviceReduction(false)}
                      subscriptionPresent={!!subscription}
                      subscriptionId={subscriptionId}
                      targetDeviceLimit={targetDeviceLimit}
                      onTargetDeviceLimitChange={setTargetDeviceLimit}
                      isDark={isDark}
                    />

                    {subscription.traffic_limit_gb > 0 && (
                      <TrafficTopupSheet
                        open={showTrafficTopup}
                        onOpen={() => {
                          setShowDeviceTopup(false);
                          setShowDeviceReduction(false);
                          setShowTrafficTopup(true);
                          setShowServerManagement(false);
                        }}
                        onClose={() => setShowTrafficTopup(false)}
                        subscription={subscription}
                        subscriptionId={subscriptionId}
                        selectedTrafficPackage={selectedTrafficPackage}
                        onSelectedTrafficPackageChange={setSelectedTrafficPackage}
                        purchaseOptions={purchaseOptions}
                        isDark={isDark}
                      />
                    )}

                    {!isTariffsMode && (
                      <ServerManagementSheet
                        open={showServerManagement}
                        onOpen={() => {
                          setShowDeviceTopup(false);
                          setShowDeviceReduction(false);
                          setShowTrafficTopup(false);
                          setShowServerManagement(true);
                        }}
                        onClose={() => setShowServerManagement(false)}
                        subscription={subscription}
                        subscriptionId={subscriptionId}
                        selectedServers={selectedServersToUpdate}
                        onSelectedServersChange={setSelectedServersToUpdate}
                        purchaseOptions={purchaseOptions}
                        isDark={isDark}
                      />
                    )}
                  </>
                )}

                <button
                  onClick={handleRevoke}
                  disabled={revokeMutation.isPending || revokeCooldown > 0}
                  className="w-full rounded-xl border border-warning-500/30 bg-warning-500/10 p-3 text-left transition-colors hover:bg-warning-500/20 disabled:opacity-50"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-warning-400">
                        {t('subscription.revoke.button')}
                      </div>
                      <div className="mt-0.5 text-xs text-dark-400">
                        {revokeCooldown > 0
                          ? t('subscription.revoke.cooldown', {
                              minutes: Math.floor(revokeCooldown / 60),
                              seconds: revokeCooldown % 60,
                            })
                          : t('subscription.revoke.description')}
                      </div>
                    </div>
                    <div className="shrink-0 text-warning-400">
                      {revokeMutation.isPending ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-warning-400/30 border-t-amber-400" />
                      ) : (
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                </button>
                {revokeMutation.error && (
                  <p className="text-sm text-error-400">{getErrorMessage(revokeMutation.error)}</p>
                )}
              </div>
            )}
          </div>
        )}
    </div>
  );
}
