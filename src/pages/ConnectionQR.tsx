import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { useBranding } from '../hooks/useBranding';
import { AdminBackButton } from '@/components/admin';

interface ConnectionQRState {
  url: string;
  hideLink: boolean;
  subscriptionId?: number;
  returnPath?: string;
}

function isValidState(state: unknown): state is ConnectionQRState {
  if (!state || typeof state !== 'object') return false;
  const s = state as Record<string, unknown>;
  return (
    typeof s.url === 'string' &&
    s.url.length > 0 &&
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

  const state = location.state as unknown;
  const validState = isValidState(state) ? state : null;
  const subId = validState?.subscriptionId;
  const connectionPath =
    validState?.returnPath || (subId ? `/connection?sub=${subId}` : '/connection');

  useEffect(() => {
    if (!validState) {
      navigate(connectionPath, { replace: true });
    }
  }, [validState, navigate, connectionPath]);

  if (!validState) {
    return null;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center gap-3">
        <AdminBackButton to={connectionPath} replace />
        <h1 className="text-2xl font-bold text-dark-100">{t('subscription.connection.qrTitle')}</h1>
      </div>

      <div className="flex flex-col items-center">
        <div className="flex w-full max-w-sm flex-col items-center px-2 sm:px-6">
          {appName && (
            <p className="mb-3 text-sm font-medium uppercase tracking-wider text-dark-400">
              {appName}
            </p>
          )}

          <p className="mb-8 text-center text-sm text-dark-400">
            {t('subscription.connection.qrScanHint')}
          </p>

          <div className="w-full max-w-[312px] rounded-3xl bg-white p-4 sm:p-6">
            <QRCodeSVG
              value={validState.url}
              size={280}
              level="M"
              includeMargin={false}
              className="h-auto w-full max-w-[280px]"
            />
          </div>

          {!validState.hideLink && (
            <p className="mt-6 max-w-full truncate text-center font-mono text-xs text-dark-500">
              {validState.url}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
