import { useEffect, useRef } from 'react';
import { Navigate, useLocation, useNavigate, useParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { subscriptionApi } from '@/api/subscription';
import { ResponsiveOverlay } from '@/components/primitives/ResponsiveOverlay';
import { DeviceLimitPanel } from '@/components/subscription/DeviceLimitSheet';
import DevicesPanel from '@/components/dashboard/DevicesPanel';
import { needsTariff } from '@/utils/legacySubscription';
import Subscription from './Subscription';

/** Page owns routing; the existing management owns its queries and actions. */
export default function SubscriptionPage() {
  const { subscriptionId: rawId } = useParams();
  const id = rawId && /^\d+$/.test(rawId) ? Number(rawId) : 0;
  const validId = Number.isSafeInteger(id) && id > 0;
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const list = useQuery({
    queryKey: ['subscriptions-list'],
    queryFn: subscriptionApi.getSubscriptions,
    enabled: validId,
    staleTime: 30_000,
    retry: false,
  });
  const search = new URLSearchParams(location.search);
  const devicesOpen = search.get('overlay') === 'devices';
  const basePath = `/subscriptions/${id}`;
  const source = (location.state as { backTo?: unknown } | null)?.backTo;
  const backTo =
    typeof source === 'string' && (source === '/subscriptions' || /^\/(?:\?sub=\d+)?$/.test(source))
      ? source
      : (list.data?.subscriptions.length ?? 0) > 1
        ? '/subscriptions'
        : `/?sub=${id}`;
  const current = list.data?.subscriptions.find((sub) => sub.id === id);
  const deviceTrigger = useRef<HTMLElement | null>(null);
  const devices = useQuery({
    queryKey: ['devices', id],
    queryFn: () => subscriptionApi.getDevices(id),
    enabled: validId && devicesOpen,
    staleTime: 30_000,
    retry: false,
  });

  useEffect(() => {
    if (!validId || devicesOpen || !list.isSuccess) return;
    if (source === backTo && !location.state?.cabinetOverlayParent) return;
    navigate(`${basePath}${location.search}`, { replace: true, state: { backTo } });
  }, [
    validId,
    devicesOpen,
    list.isSuccess,
    source,
    backTo,
    location.state,
    location.search,
    basePath,
    navigate,
  ]);

  if (!validId) return <Navigate to="/subscriptions" replace />;
  const closeDevices = () => {
    if (location.state?.cabinetOverlayParent) navigate(-1);
    else navigate(basePath, { replace: true, state: { backTo } });
  };
  return (
    <div
      className="space-y-6"
      onClickCapture={(event) => {
        const link = (event.target as Element).closest<HTMLElement>('a[href]');
        if (link?.getAttribute('href') === `${basePath}?overlay=devices`)
          deviceTrigger.current = link;
      }}
    >
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold text-dark-50 sm:text-3xl">{t('subscription.title')}</h1>
      </div>
      {/* Management owns the compact overview and existing subscription actions. */}
      <Subscription
        key={id}
        embedded
        hideHeader
        selectedSubscriptionId={id}
        initiallyOpenAdditionalOptions={search.get('section') === 'additional-options'}
        initiallyOpenDevices={search.get('action') === 'devices'}
      />
      <ResponsiveOverlay
        open={devicesOpen}
        onOpenChange={(open) => {
          if (!open) closeDevices();
        }}
        title={t('subscription.myDevices')}
        description={t('dashboard.overlayDescriptions.devices')}
        centerHeader
        restoreFocusTo={deviceTrigger.current}
      >
        <DeviceLimitPanel
          subscriptionName={current?.tariff_name || t('subscription.title')}
          deviceLimit={current?.device_limit ?? 0}
          connectedDevices={devices.data?.total}
          isTrial={current?.is_trial ?? false}
          onAddSlots={
            current && !needsTariff(current)
              ? () =>
                  navigate(`${basePath}?section=additional-options`, {
                    replace: true,
                    state: { backTo },
                  })
              : undefined
          }
        >
          {devicesOpen && <DevicesPanel subscriptionId={id} />}
        </DeviceLimitPanel>
      </ResponsiveOverlay>
    </div>
  );
}
