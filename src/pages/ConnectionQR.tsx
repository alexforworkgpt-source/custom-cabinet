import { useEffect, useState } from 'react';
import { CopyIcon, CheckIcon } from '@/components/icons';
import { copyToClipboard } from '@/utils/clipboard';
import { useQuery } from '@tanstack/react-query';
import { subscriptionApi } from '@/api/subscription';
import { useAuthStore } from '@/store/auth';
import { useSubscriptionMirror } from '@/hooks/useSubscriptionMirror';
import { MirrorSelector } from '@/components/connection/MirrorSelector';
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton';
import { resolveConnectionUrlForUi } from '@/utils/connectionLink';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { useBranding } from '../hooks/useBranding';
import { AdminBackButton } from '@/components/admin';
import { PageEntrance, PageEntranceItem } from '@/components/motion/PageEntrance';
import { fadeIn } from '@/components/motion/transitions';

interface ConnectionQRState {
  url?: string;
  refreshConnection?: boolean;
  hideLink: boolean;
  subscriptionId?: number;
  returnPath?: string;
}

function isValidState(state: unknown): state is ConnectionQRState {
  if (!state || typeof state !== 'object') return false;
  const s = state as Record<string, unknown>;
  return (
    ((s.refreshConnection === true &&
      typeof s.subscriptionId === 'number' &&
      Number.isSafeInteger(s.subscriptionId) &&
      s.subscriptionId > 0) ||
      (typeof s.url === 'string' && s.url.length > 0)) &&
    typeof s.hideLink === 'boolean' &&
    (s.returnPath === undefined ||
      (typeof s.returnPath === 'string' &&
        (s.returnPath === '/' ||
          /^\/\?sub=[1-9]\d*$/.test(s.returnPath) ||
          s.returnPath === '/connection' ||
          s.returnPath.startsWith('/connection?'))))
  );
}

export default function ConnectionQR() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { appName } = useBranding();
  const userId = useAuthStore((state) => state.user?.id);

  const state = location.state as unknown;
  const routeState = isValidState(state) ? state : null;
  const subId = routeState?.subscriptionId;
  const refresh = routeState?.refreshConnection === true && Boolean(subId);
  const linkQuery = useQuery({
    queryKey: ['connection-link', subId, userId],
    queryFn: () => subscriptionApi.getConnectionLink(subId),
    enabled: refresh,
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const link =
    !linkQuery.isFetching &&
    linkQuery.isFetchedAfterMount &&
    !linkQuery.isError &&
    (linkQuery.data?.subscription_id === undefined || linkQuery.data.subscription_id === subId)
      ? linkQuery.data
      : undefined;
  const publicUrl = link
    ? resolveConnectionUrlForUi({
        mode: link.connect_mode,
        subscriptionUrl: link.subscription_url,
        displayLink: link.display_link,
        happSchemeLink: link.happ_scheme_link,
        happCryptLink: link.happ_cryptolink,
        happCryptoLink: link.happ_crypto_link,
        happLink: link.happ_link,
      })
    : null;
  const needsHiddenConfig = refresh && link?.hide_link === true && !publicUrl;
  const configQuery = useQuery({
    queryKey: ['appConfig', subId, userId],
    queryFn: () => subscriptionApi.getAppConfig(subId),
    enabled: needsHiddenConfig,
    retry: false,
    staleTime: 0,
    refetchOnMount: 'always',
  });
  const waitingForConfig =
    needsHiddenConfig &&
    !configQuery.isError &&
    (configQuery.isFetching || !configQuery.isFetchedAfterMount);
  const hiddenUrl =
    needsHiddenConfig &&
    !waitingForConfig &&
    !configQuery.isError &&
    configQuery.data?.hasSubscription
      ? resolveConnectionUrlForUi({
          mode: link?.connect_mode,
          fallbackUrl: configQuery.data.subscriptionUrl,
        })
      : null;
  const mirror = useSubscriptionMirror(link, publicUrl ?? hiddenUrl, routeState?.hideLink);
  const url = refresh ? mirror.url : routeState?.url;
  const hideLink = refresh
    ? (link?.hide_link ?? true) || routeState?.hideLink === true
    : (routeState?.hideLink ?? true);
  const [copyResult, setCopyResult] = useState<{
    url: string;
    status: 'copying' | 'copied' | 'error';
  } | null>(null);
  const copyStatus = copyResult?.url === url ? copyResult?.status : undefined;
  const handleCopy = async () => {
    if (!url || hideLink) return;
    setCopyResult({ url, status: 'copying' });
    const finish = (status: 'copied' | 'error') =>
      setCopyResult((result) => (result?.url === url ? { url, status } : result));
    try {
      await copyToClipboard(url);
      finish('copied');
    } catch {
      finish('error');
    }
  };
  const connectionPath =
    routeState?.returnPath || (subId ? `/connection?sub=${subId}` : '/connection');
  const unavailable =
    refresh &&
    !linkQuery.isFetching &&
    (linkQuery.isError || (linkQuery.isFetchedAfterMount && !waitingForConfig && !url));

  useEffect(() => {
    if (!routeState || unavailable) {
      navigate(unavailable && subId ? `/connection?sub=${subId}` : connectionPath, {
        replace: true,
      });
    }
  }, [routeState, unavailable, subId, navigate, connectionPath]);

  if (!url) {
    return refresh ? (
      <SkeletonGroup className="flex flex-col items-center gap-6 py-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton variant="card" className="h-72 w-72" />
      </SkeletonGroup>
    ) : null;
  }

  return (
    <PageEntrance>
      <PageEntranceItem variants={fadeIn} className="mb-6 flex items-end gap-3">
        <AdminBackButton to={connectionPath} replace />
        <h1 className="text-2xl font-bold text-dark-100">{t('subscription.connection.qrTitle')}</h1>
      </PageEntranceItem>

      <PageEntranceItem variants={fadeIn} className="flex flex-col items-center">
        <div className="flex w-full max-w-sm flex-col items-center px-2 sm:px-6">
          {appName && (
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-dark-400">
              {appName}
            </p>
          )}

          <p className="mb-8 text-center text-sm text-dark-400">
            {t('subscription.connection.qrScanHint')}
          </p>

          <MirrorSelector selection={mirror} />
          <div className="w-full max-w-[312px] rounded-3xl bg-white p-4 sm:p-6">
            <QRCodeSVG
              value={url}
              size={280}
              level="M"
              includeMargin={false}
              className="h-auto w-full max-w-[280px]"
            />
          </div>

          {!hideLink && (
            <div className="mt-6 w-full min-w-0 space-y-3">
              <p dir="ltr" className="select-text break-all font-mono text-xs text-dark-400">
                {url}
              </p>
              <button
                type="button"
                className="btn-secondary flex w-full items-center justify-center gap-2"
                disabled={copyStatus === 'copying'}
                onClick={handleCopy}
              >
                {copyStatus === 'copied' ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <CopyIcon className="h-4 w-4" />
                )}
                <span aria-live="polite">
                  {copyStatus === 'copied'
                    ? t('common.copied')
                    : t('subscription.connection.copyLink')}
                </span>
              </button>
              {copyStatus === 'error' && (
                <p role="alert" className="text-sm text-error-400">
                  {t('subscription.connection.copyFailed')}
                </p>
              )}
            </div>
          )}
        </div>
      </PageEntranceItem>
    </PageEntrance>
  );
}
