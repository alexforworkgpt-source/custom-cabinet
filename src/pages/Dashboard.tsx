import { lazy, Suspense, useState, useEffect, useMemo, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/auth';
import { useBlockingStore } from '../store/blocking';
import { subscriptionApi } from '../api/subscription';
import { referralApi } from '../api/referral';
import { balanceApi } from '../api/balance';
import { wheelApi } from '../api/wheel';
import Onboarding, { useOnboarding } from '../components/Onboarding';
import PromoOffersSection from '../components/PromoOffersSection';
import NewsSection from '../components/news/NewsSection';
import SubscriptionCardActive from '../components/dashboard/SubscriptionCardActive';
import SubscriptionCardExpired from '../components/dashboard/SubscriptionCardExpired';
import TrialOfferCard from '../components/dashboard/TrialOfferCard';
import StatsGrid from '../components/dashboard/StatsGrid';
import { giftApi } from '../api/gift';
import PendingGiftCard from '../components/dashboard/PendingGiftCard';
import { API } from '../config/constants';
import { ChevronRightIcon } from '@/components/icons';
import { ResponsiveOverlay } from '@/components/primitives/ResponsiveOverlay';
import { getCabinetClosePath, getUserCabinetRouteState } from '@/utils/userCabinetRouteState';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useTheme } from '@/hooks/useTheme';
import { isFailedStatus, isPaidStatus } from '@/utils/paymentStatus';
import { TrafficTopupSheet } from '@/components/subscription/sheets/TrafficTopupSheet';
import { copyToClipboard } from '@/utils/clipboard';
import { resolveConnectionUrlForUi } from '@/utils/connectionLink';

const Connection = lazy(() => import('./Connection'));
const TopUpMethodSelect = lazy(() => import('./TopUpMethodSelect'));
const TopUpAmount = lazy(() => import('./TopUpAmount'));
const Balance = lazy(() => import('./Balance'));
const DevicesPanel = lazy(() => import('@/components/dashboard/DevicesPanel'));
const SubscriptionManagement = lazy(() => import('./Subscription'));

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { subscriptionId: routeSubscriptionId } = useParams<{ subscriptionId: string }>();
  const [searchParams] = useSearchParams();
  const routeState = getUserCabinetRouteState(location.pathname, location.search);
  const refreshUser = useAuthStore((state) => state.refreshUser);
  const queryClient = useQueryClient();
  const { isCompleted: isOnboardingCompleted, complete: completeOnboarding } = useOnboarding();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const blockingType = useBlockingStore((state) => state.blockingType);
  const [trialError, setTrialError] = useState<string | null>(null);
  const { referralEnabled } = useFeatureFlags();
  const { isDark } = useTheme();
  const [showTrafficTopup, setShowTrafficTopup] = useState(false);
  const [selectedTrafficPackage, setSelectedTrafficPackage] = useState<number | null>(null);
  const trafficTopupTriggerRef = useRef<HTMLButtonElement>(null);
  const [subscriptionLinkCopied, setSubscriptionLinkCopied] = useState(false);

  useEffect(() => {
    if (location.pathname !== '/balance') return;
    const status = searchParams.get('payment') || searchParams.get('status') || '';
    if (isPaidStatus(status.toLowerCase()) || searchParams.get('success') === 'true') {
      navigate('/balance/top-up/result?status=success', { replace: true });
    } else if (isFailedStatus(status.toLowerCase())) {
      navigate('/balance/top-up/result?status=failed', { replace: true });
    }
  }, [location.pathname, navigate, searchParams]);

  // Refresh user data on mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Fetch balance from API
  const {
    data: balanceData,
    isError: balanceError,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ['balance'],
    queryFn: balanceApi.getBalance,
    staleTime: API.BALANCE_STALE_TIME_MS,
    refetchOnMount: 'always',
    retry: false,
  });

  // Multi-tariff: check if user has multiple subscriptions
  const {
    data: multiSubData,
    isLoading: subscriptionsLoading,
    isError: subscriptionsError,
    refetch: refetchSubscriptions,
  } = useQuery({
    queryKey: ['subscriptions-list'],
    queryFn: () => subscriptionApi.getSubscriptions(),
    staleTime: 60_000,
  });
  const isMultiTariff = multiSubData?.multi_tariff_enabled ?? false;
  const subscriptions = multiSubData?.subscriptions ?? [];
  const requestedSubscriptionId = Number(routeSubscriptionId || searchParams.get('sub'));
  const selectedSubscriptionId =
    (Number.isSafeInteger(requestedSubscriptionId) &&
    requestedSubscriptionId > 0 &&
    subscriptions.some((item) => item.id === requestedSubscriptionId)
      ? requestedSubscriptionId
      : subscriptions[0]?.id) ?? undefined;

  useEffect(() => {
    if (!routeSubscriptionId || !multiSubData) return;
    const routeId = Number(routeSubscriptionId);
    if (Number.isSafeInteger(routeId) && subscriptions.some((item) => item.id === routeId)) return;
    navigate(getCabinetClosePath(subscriptions[0]?.id), { replace: true });
  }, [multiSubData, navigate, routeSubscriptionId, subscriptions]);

  const {
    data: subscriptionResponse,
    isLoading: subLoading,
    isError: subscriptionError,
    refetch: refetchSubscription,
  } = useQuery({
    queryKey: ['subscription', selectedSubscriptionId ?? 'primary'],
    queryFn: () =>
      subscriptionApi.getSubscription(isMultiTariff ? selectedSubscriptionId : undefined),
    retry: false,
    staleTime: API.BALANCE_STALE_TIME_MS,
    refetchOnMount: 'always',
    enabled: multiSubData !== undefined && (!isMultiTariff || selectedSubscriptionId !== undefined),
  });

  const subscription = subscriptionResponse?.subscription ?? null;
  const managementOpen = routeState.overlay === 'subscription';

  const { data: connectionLink, isLoading: isConnectionLinkLoading } = useQuery({
    queryKey: ['connection-link', selectedSubscriptionId],
    queryFn: () => subscriptionApi.getConnectionLink(selectedSubscriptionId),
    enabled: Boolean(subscription),
    retry: false,
    staleTime: 0,
  });
  const displayedConnectionUrl = useMemo(
    () =>
      resolveConnectionUrlForUi({
        mode: connectionLink?.connect_mode,
        happSchemeLink: connectionLink?.happ_scheme_link,
        displayLink: connectionLink?.display_link,
        subscriptionUrl: connectionLink?.subscription_url,
        happCryptLink: connectionLink?.happ_cryptolink,
        happCryptoLink: connectionLink?.happ_crypto_link,
        happLink: connectionLink?.happ_link,
        fallbackUrl: isConnectionLinkLoading ? null : (subscription?.subscription_url ?? null),
      }),
    [connectionLink, isConnectionLinkLoading, subscription?.subscription_url],
  );
  const shouldHideConnectionLink =
    subscription?.hide_subscription_link || connectionLink?.hide_link;

  useEffect(() => {
    setSubscriptionLinkCopied(false);
  }, [subscription?.id]);

  const { data: purchaseOptions } = useQuery({
    queryKey: ['purchase-options', selectedSubscriptionId],
    queryFn: () => subscriptionApi.getPurchaseOptions(selectedSubscriptionId),
    enabled: Boolean(subscription?.is_limited && showTrafficTopup),
    staleTime: 0,
  });

  const { data: trialInfo, isLoading: trialLoading } = useQuery({
    queryKey: ['trial-info'],
    queryFn: () => subscriptionApi.getTrialInfo(),
    enabled: !subscription && !subLoading,
  });

  const {
    data: devicesData,
    isError: devicesError,
    refetch: refetchDevices,
  } = useQuery({
    queryKey: ['devices', subscription?.id ?? 'primary'],
    queryFn: () => subscriptionApi.getDevices(subscription?.id),
    enabled: !!subscription,
    staleTime: API.BALANCE_STALE_TIME_MS,
    retry: false,
  });

  const { data: referralInfo, isLoading: refLoading } = useQuery({
    queryKey: ['referral-info'],
    queryFn: referralApi.getReferralInfo,
  });

  const { data: wheelConfig } = useQuery({
    queryKey: ['wheel-config'],
    queryFn: wheelApi.getConfig,
    staleTime: 60000,
    retry: false,
  });

  const { data: pendingGifts } = useQuery({
    queryKey: ['pending-gifts'],
    queryFn: giftApi.getPendingGifts,
    staleTime: 30_000,
    retry: false,
  });

  const activateTrialMutation = useMutation({
    mutationFn: () => subscriptionApi.activateTrial(),
    onSuccess: () => {
      setTrialError(null);
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions-list'] });
      queryClient.invalidateQueries({ queryKey: ['trial-info'] });
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      queryClient.invalidateQueries({ queryKey: ['purchase-options'] });
      refreshUser();
    },
    onError: (error: { response?: { data?: { detail?: string } } }) => {
      setTrialError(error.response?.data?.detail || t('common.error'));
    },
  });

  // Traffic refresh state and mutation
  const [trafficRefreshCooldown, setTrafficRefreshCooldown] = useState(0);
  const [trafficData, setTrafficData] = useState<{
    traffic_used_gb: number;
    traffic_used_percent: number;
    is_unlimited: boolean;
  } | null>(null);
  const currentSubscriptionIdRef = useRef<number | undefined>(subscription?.id);
  const overlayTriggerRef = useRef<HTMLElement | null>(null);
  currentSubscriptionIdRef.current = subscription?.id;

  const refreshTrafficMutation = useMutation({
    mutationFn: async () => {
      const subscriptionId = currentSubscriptionIdRef.current;
      const data = await subscriptionApi.refreshTraffic(subscriptionId);
      return { data, subscriptionId };
    },
    onSuccess: ({ data, subscriptionId }) => {
      if (subscriptionId !== currentSubscriptionIdRef.current) return;
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

  // Cooldown timer
  useEffect(() => {
    if (trafficRefreshCooldown <= 0) return;
    const timer = setInterval(() => {
      setTrafficRefreshCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [trafficRefreshCooldown]);

  // Auto-refresh traffic on mount (with 30s caching)
  const autoRefreshedSubscriptionId = useRef<number | null>(null);

  useEffect(() => {
    if (!subscription) return;
    if (autoRefreshedSubscriptionId.current === subscription.id) return;
    autoRefreshedSubscriptionId.current = subscription.id;

    const lastRefresh = localStorage.getItem(`traffic_refresh_ts_${subscription?.id ?? 'default'}`);
    const now = Date.now();
    const cacheMs = API.TRAFFIC_CACHE_MS;

    if (lastRefresh && now - parseInt(lastRefresh, 10) < cacheMs) {
      const elapsed = now - parseInt(lastRefresh, 10);
      const remaining = Math.ceil((cacheMs - elapsed) / 1000);
      if (remaining > 0) {
        setTrafficRefreshCooldown(remaining);
      }
      return;
    }

    refreshTrafficMutation.mutate();
  }, [subscription, refreshTrafficMutation]);

  useEffect(() => {
    setTrafficData(null);
  }, [subscription?.id]);

  // В multi-tariff /cabinet/subscription отключён, поэтому subscriptionResponse=undefined.
  // Используем список из /cabinet/subscriptions/list — пустой массив означает «нет подписок»,
  // и тогда показываем TrialOfferCard. Без этой ветки multi-tariff юзер никогда не видел триал.
  const hasNoSubscription = isMultiTariff
    ? multiSubData !== undefined && (multiSubData.subscriptions?.length ?? 0) === 0
    : subscriptionResponse?.has_subscription === false && !subLoading;

  // Show onboarding for new users after data loads
  useEffect(() => {
    if (!isOnboardingCompleted && !subLoading && !refLoading && !blockingType) {
      const timer = setTimeout(() => setShowOnboarding(true), 500);
      return () => clearTimeout(timer);
    }
  }, [isOnboardingCompleted, subLoading, refLoading, blockingType]);

  const onboardingSteps = useMemo(() => {
    type Placement = 'top' | 'bottom' | 'left' | 'right';
    const steps: Array<{
      target: string;
      title: string;
      description: string;
      placement: Placement;
    }> = [
      {
        target: 'balance',
        title: t('onboarding.steps.balance.title'),
        description: t('onboarding.steps.balance.description'),
        placement: 'bottom',
      },
    ];

    if (subscription?.subscription_url) {
      steps.splice(1, 0, {
        target: 'connect-devices',
        title: t('onboarding.steps.connectDevices.title'),
        description: t('onboarding.steps.connectDevices.description'),
        placement: 'bottom',
      });
    }

    return steps;
  }, [t, subscription]);

  const handleOnboardingComplete = () => {
    completeOnboarding();
    setShowOnboarding(false);
  };

  const overlaySubscriptionId = routeState.subscriptionId ?? subscription?.id;
  const closeOverlay = () => {
    if (location.state?.cabinetOverlayParent) {
      navigate(-1);
      return;
    }
    navigate(routeState.closePath ?? getCabinetClosePath(overlaySubscriptionId), { replace: true });
  };
  const closeTrafficTopup = () => {
    setShowTrafficTopup(false);
    requestAnimationFrame(() => trafficTopupTriggerRef.current?.focus({ preventScroll: true }));
  };

  const overlayContent = (() => {
    if (routeState.overlay === 'subscription' && overlaySubscriptionId) {
      if (subscriptionError) {
        return (
          <div className="rounded-2xl border border-error-500/30 bg-error-500/10 p-5" role="alert">
            <p className="text-sm text-error-400">{t('dashboard.subscriptionLoadError')}</p>
            <button
              type="button"
              className="mt-3 min-h-11 rounded-xl bg-dark-800 px-4 text-sm font-medium text-dark-100"
              onClick={() => void refetchSubscription()}
            >
              {t('common.retry')}
            </button>
          </div>
        );
      }
      return (
        <SubscriptionManagement
          key={overlaySubscriptionId}
          embedded
          selectedSubscriptionId={overlaySubscriptionId}
        />
      );
    }
    if (routeState.overlay === 'devices' && overlaySubscriptionId) {
      return <DevicesPanel subscriptionId={overlaySubscriptionId} />;
    }
    if (routeState.overlay === 'connection') return <Connection />;
    if (routeState.overlay === 'balance') return <Balance />;
    if (routeState.overlay === 'topup') {
      return location.pathname === '/balance/top-up' || location.pathname === '/balance' ? (
        <TopUpMethodSelect />
      ) : (
        <TopUpAmount />
      );
    }
    return null;
  })();

  const overlayTitle =
    routeState.overlay === 'subscription'
      ? t('dashboard.manageSubscription')
      : routeState.overlay === 'connection'
        ? t('subscription.connection.title')
        : routeState.overlay === 'topup'
          ? t('balance.topUp')
          : routeState.overlay === 'balance'
            ? t('balance.title')
            : routeState.overlay === 'devices'
              ? t('subscription.myDevices')
              : t('subscription.title');

  const overlayDescription =
    routeState.overlay === 'subscription'
      ? t('dashboard.overlayDescriptions.subscription')
      : routeState.overlay === 'connection'
        ? t('dashboard.overlayDescriptions.connection')
        : routeState.overlay === 'devices'
          ? t('dashboard.overlayDescriptions.devices')
          : routeState.overlay === 'balance'
            ? t('dashboard.overlayDescriptions.balance')
            : routeState.overlay === 'topup'
              ? t('dashboard.overlayDescriptions.topup')
              : '';

  return (
    <div
      className="space-y-6"
      onClickCapture={(event) => {
        const target = (event.target as HTMLElement).closest<HTMLElement>(
          'a, button, input, select, textarea',
        );
        if (target && event.currentTarget.contains(target)) overlayTriggerRef.current = target;
      }}
    >
      {/* Pending Gift Activations */}
      {pendingGifts && pendingGifts.length > 0 && <PendingGiftCard gifts={pendingGifts} />}

      {subscriptions.length > 1 && (
        <label className="block rounded-2xl border border-dark-700/50 bg-dark-900/70 p-4">
          <span className="mb-2 block text-sm font-medium text-dark-300">
            {t('dashboard.subscriptions')}
          </span>
          <select
            className="input w-full"
            value={selectedSubscriptionId}
            onChange={(event) => {
              setShowTrafficTopup(false);
              setSelectedTrafficPackage(null);
              navigate(`/?sub=${event.target.value}`);
            }}
          >
            {subscriptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.tariff_name || `#${item.id}`}
              </option>
            ))}
          </select>
        </label>
      )}

      {(subscriptionsError || subscriptionError) && (
        <div className="rounded-2xl border border-error-500/30 bg-error-500/10 p-5" role="alert">
          <p className="text-sm text-error-400">{t('dashboard.subscriptionLoadError')}</p>
          <button
            type="button"
            className="mt-3 min-h-11 rounded-xl bg-dark-800 px-4 text-sm font-medium text-dark-100"
            onClick={() => {
              void refetchSubscriptions();
              void refetchSubscription();
            }}
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {balanceError && (
        <div className="rounded-2xl border border-error-500/30 bg-error-500/10 p-5" role="alert">
          <p className="text-sm text-error-400">{t('dashboard.balanceLoadError')}</p>
          <button
            type="button"
            className="mt-3 min-h-11 rounded-xl bg-dark-800 px-4 text-sm font-medium text-dark-100"
            onClick={() => void refetchBalance()}
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {subscription && devicesError && (
        <div className="rounded-2xl border border-error-500/30 bg-error-500/10 p-5" role="alert">
          <p className="text-sm text-error-400">{t('dashboard.devicesLoadError')}</p>
          <button
            type="button"
            className="mt-3 min-h-11 rounded-xl bg-dark-800 px-4 text-sm font-medium text-dark-100"
            onClick={() => void refetchDevices()}
          >
            {t('common.retry')}
          </button>
        </div>
      )}

      {!subscriptionsError && !subscriptionError && (subLoading || subscriptionsLoading) ? (
        <div className="bento-card">
          <div className="mb-4 flex items-center justify-between">
            <div className="skeleton h-5 w-20" />
            <div className="skeleton h-6 w-16 rounded-full" />
          </div>
          <div className="skeleton mb-3 h-10 w-32" />
          <div className="skeleton mb-3 h-4 w-40" />
          <div className="skeleton h-3 w-full rounded-full" />
          <div className="mt-5">
            <div className="skeleton h-12 w-full rounded-xl" />
          </div>
        </div>
      ) : !subscriptionsError &&
        !subscriptionError &&
        (subscription?.is_expired ||
          subscription?.status === 'disabled' ||
          subscription?.is_limited) ? (
        <SubscriptionCardExpired
          subscription={subscription}
          balanceKopeks={balanceError ? null : (balanceData?.balance_kopeks ?? null)}
          balanceRubles={balanceError ? null : (balanceData?.balance_rubles ?? null)}
          isTrafficTopupOpen={showTrafficTopup}
          trafficTopupTriggerRef={trafficTopupTriggerRef}
          onBuyTraffic={() => {
            setSelectedTrafficPackage(null);
            setShowTrafficTopup(true);
          }}
          onManageSubscription={() =>
            navigate(`/subscriptions/${subscription.id}`, {
              state: { cabinetOverlayParent: true },
            })
          }
          managementOpen={managementOpen}
        />
      ) : subscription ? (
        <SubscriptionCardActive
          subscription={subscription}
          trafficData={trafficData}
          refreshTrafficMutation={refreshTrafficMutation}
          trafficRefreshCooldown={trafficRefreshCooldown}
          connectedDevices={devicesError ? null : (devicesData?.total ?? null)}
          connectionUrl={shouldHideConnectionLink ? null : displayedConnectionUrl}
          connectionUrlCopied={subscriptionLinkCopied}
          onCopyConnectionUrl={() => {
            if (!displayedConnectionUrl) return;
            void copyToClipboard(displayedConnectionUrl);
            setSubscriptionLinkCopied(true);
            setTimeout(() => setSubscriptionLinkCopied(false), 2000);
          }}
          onManageSubscription={() =>
            navigate(`/subscriptions/${subscription.id}`, {
              state: { cabinetOverlayParent: true },
            })
          }
          managementOpen={managementOpen}
        />
      ) : null}

      {subscription?.is_limited && showTrafficTopup && (
        <div id="traffic-topup-panel" role="region" aria-live="polite">
          <TrafficTopupSheet
            open
            onOpen={() => setShowTrafficTopup(true)}
            onClose={closeTrafficTopup}
            subscription={subscription}
            subscriptionId={subscription.id}
            selectedTrafficPackage={selectedTrafficPackage}
            onSelectedTrafficPackageChange={setSelectedTrafficPackage}
            purchaseOptions={purchaseOptions}
            isDark={isDark}
          />
        </div>
      )}

      {/* Нет подписок: показываем триал (если доступен) и ВСЕГДА одну явную
          кнопку покупки. Триал не обязателен, чтобы попасть в витрину — раньше
          при доступном триале это был единственный экран без кнопки покупки
          (Telegram-баг #605056/#605063). Единственная кнопка тут (вместо дубля
          с мульти-тариф блоком). */}
      {hasNoSubscription && !trialLoading && (
        <div className="space-y-3">
          {trialInfo?.is_available && (
            <TrialOfferCard
              trialInfo={trialInfo}
              balanceKopeks={balanceError ? null : (balanceData?.balance_kopeks ?? null)}
              balanceRubles={balanceError ? null : (balanceData?.balance_rubles ?? null)}
              activateTrialMutation={activateTrialMutation}
              trialError={trialError}
            />
          )}
          <Link
            to="/subscription/purchase"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-500 p-3.5 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-600"
          >
            {t('subscriptions.chooseTariff')}
          </Link>
        </div>
      )}

      {/* Promo Offers */}
      <PromoOffersSection />

      {/* Stats Grid */}
      <StatsGrid
        balanceRubles={balanceError ? null : (balanceData?.balance_rubles ?? null)}
        referralCount={referralInfo?.total_referrals || 0}
        earningsRubles={referralInfo?.available_balance_rubles || 0}
        refLoading={refLoading}
        showReferral={referralEnabled}
      />

      {/* Fortune Wheel Banner */}
      {wheelConfig?.is_enabled && (
        <Link to="/wheel" className="bento-card-hover group flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-3xl">🎰</span>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-dark-100">{t('wheel.banner.title')}</h3>
              <p className="text-sm text-dark-400">{t('wheel.banner.description')}</p>
            </div>
          </div>
          <div className="flex-shrink-0 text-dark-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent-400">
            <ChevronRightIcon />
          </div>
        </Link>
      )}

      {/* News Section */}
      <NewsSection />

      {/* Onboarding Tutorial */}
      {showOnboarding && (
        <Onboarding
          steps={onboardingSteps}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      )}

      <ResponsiveOverlay
        open={routeState.overlay !== null}
        onOpenChange={(open) => {
          if (!open) closeOverlay();
        }}
        title={overlayTitle}
        description={overlayDescription}
        restoreFocusTo={overlayTriggerRef.current}
        centerHeader={
          routeState.overlay === 'subscription' ||
          routeState.overlay === 'connection' ||
          routeState.overlay === 'devices' ||
          routeState.overlay === 'balance' ||
          routeState.overlay === 'topup'
        }
      >
        <Suspense
          fallback={
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-500 border-t-transparent" />
            </div>
          }
        >
          {overlayContent}
        </Suspense>
      </ResponsiveOverlay>
    </div>
  );
}
