import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { NodeInfo } from '@/api/adminRemnawave';
import { PlayIcon, WarningIcon } from '@/components/icons';
import { Button } from '@/components/primitives/Button';
import { ResponsiveOverlay } from '@/components/primitives/ResponsiveOverlay';
import { Spinner } from '@/components/ui/Spinner';
import { useIsTelegram, usePlatform } from '@/platform/hooks/usePlatform';
import {
  buildGeoCheckRequest,
  isRouteReady,
  suggestedInterfaces,
  suggestedIps,
  type GeoCheckRouteMode,
} from './geoCheckRoute';
import { GeoCheckReport } from './GeoCheckReport';
import { GeoCheckSetup } from './GeoCheckSetup';
import { useGeoCheckJob } from './useGeoCheckJob';

interface GeoCheckModalProps {
  node: NodeInfo;
  open: boolean;
  restoreFocusTo?: HTMLElement | null;
  onClose: () => void;
  onHistoryRestore: () => void;
}

const OVERLAY_PARENT_STATE_KEY = 'cabinetOverlayParent';

function ownsGeoCheckHistoryEntry(state: unknown, nodeUuid: string) {
  if (!state || typeof state !== 'object') return false;
  const overlayParent = (state as Record<string, unknown>)[OVERLAY_PARENT_STATE_KEY];
  if (!overlayParent || typeof overlayParent !== 'object') return false;
  const marker = overlayParent as Record<string, unknown>;
  return marker.transient === true && marker.kind === 'geoCheck' && marker.nodeUuid === nodeUuid;
}

export function GeoCheckModal({
  node,
  open,
  restoreFocusTo,
  onClose,
  onHistoryRestore,
}: GeoCheckModalProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const { setClosingConfirmation } = usePlatform();
  const isTelegram = useIsTelegram();
  const [mode, setMode] = useState<GeoCheckRouteMode>('default');
  const [value, setValue] = useState('');
  const [fullscreen, setFullscreen] = useState(false);
  const historyRegistered = useRef(false);
  const historyEntryPending = useRef(false);
  const job = useGeoCheckJob(node.uuid);
  const isRunning = job.phase === 'running';

  const locationState =
    location.state && typeof location.state === 'object'
      ? (location.state as Record<string, unknown>)
      : {};
  const ownsHistoryEntry = ownsGeoCheckHistoryEntry(locationState, node.uuid);

  // A same-URL history entry makes browser and Telegram Back close the overlay
  // before leaving the Remnawave page. While a job runs, the entry is restored.
  useEffect(() => {
    if (!open) {
      if (ownsHistoryEntry) {
        historyRegistered.current = true;
        historyEntryPending.current = false;
        onHistoryRestore();
        return;
      }
      historyRegistered.current = false;
      historyEntryPending.current = false;
      return;
    }

    if (ownsHistoryEntry) {
      if (!historyRegistered.current) {
        historyEntryPending.current = true;
        const stateWithoutMarker = { ...locationState };
        delete stateWithoutMarker[OVERLAY_PARENT_STATE_KEY];
        navigate(
          { pathname: location.pathname, search: location.search, hash: location.hash },
          { replace: true, state: stateWithoutMarker },
        );
        return;
      }
      historyEntryPending.current = false;
      return;
    }

    if (!historyRegistered.current) {
      historyRegistered.current = true;
      historyEntryPending.current = true;
      navigate(
        { pathname: location.pathname, search: location.search, hash: location.hash },
        {
          state: {
            ...locationState,
            [OVERLAY_PARENT_STATE_KEY]: {
              transient: true,
              kind: 'geoCheck',
              nodeUuid: node.uuid,
            },
          },
        },
      );
      return;
    }

    if (historyEntryPending.current) {
      if (ownsGeoCheckHistoryEntry(window.history.state?.usr, node.uuid)) return;
      historyEntryPending.current = false;
    }

    if (isRunning) {
      historyEntryPending.current = true;
      navigate(
        { pathname: location.pathname, search: location.search, hash: location.hash },
        {
          state: {
            ...locationState,
            [OVERLAY_PARENT_STATE_KEY]: {
              transient: true,
              kind: 'geoCheck',
              nodeUuid: node.uuid,
            },
          },
        },
      );
    } else {
      onClose();
    }
  }, [
    isRunning,
    location.hash,
    location.pathname,
    location.search,
    locationState,
    navigate,
    node.uuid,
    onClose,
    onHistoryRestore,
    open,
    ownsHistoryEntry,
  ]);

  useEffect(() => {
    setClosingConfirmation(open && isRunning);
    return () => setClosingConfirmation(false);
  }, [isRunning, open, setClosingConfirmation]);

  useEffect(() => {
    if (job.phase !== 'done') setFullscreen(false);
  }, [job.phase]);

  const requestClose = () => {
    if (isRunning) return;
    if (fullscreen) {
      setFullscreen(false);
      return;
    }
    if (ownsHistoryEntry || ownsGeoCheckHistoryEntry(window.history.state?.usr, node.uuid)) {
      navigate(-1);
    } else {
      onClose();
    }
  };

  const canStart = isRouteReady(mode, value);
  const suggestions =
    mode === 'ip' ? suggestedIps(node) : mode === 'interface' ? suggestedInterfaces(node) : [];
  const errorText =
    job.error?.kind === 'timeout'
      ? t(
          'admin.remnawave.geoCheck.error.timeout',
          'The node did not answer in time. Try running the check again.',
        )
      : (job.error?.message ??
        t('admin.remnawave.geoCheck.error.generic', 'The check could not be completed.'));
  const canFullscreen = !isTelegram;

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) requestClose();
      }}
      title={t('admin.remnawave.geoCheck.title', 'GeoCheck')}
      description={node.name}
      restoreFocusTo={restoreFocusTo}
      centerHeader
      showCloseButton={!isRunning && !fullscreen}
      fullscreen={fullscreen}
    >
      {job.phase === 'idle' && (
        <>
          <GeoCheckSetup
            mode={mode}
            value={value}
            suggestions={suggestions}
            onModeChange={(nextMode) => {
              setMode(nextMode);
              setValue('');
            }}
            onValueChange={setValue}
          />
          <div className="mt-5 flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="lg" onClick={requestClose}>
              {t('common.close', 'Close')}
            </Button>
            <Button
              type="button"
              size="lg"
              onClick={() => job.start(buildGeoCheckRequest(mode, value))}
              disabled={!canStart}
              leftIcon={<PlayIcon className="h-4 w-4" />}
            >
              {t('admin.remnawave.geoCheck.start', 'Run check')}
            </Button>
          </div>
        </>
      )}

      {isRunning && (
        <div className="flex flex-col items-center gap-3 px-4 py-10 text-center">
          <Spinner className="h-10 w-10" />
          <p className="text-sm font-medium text-dark-100">
            {t('admin.remnawave.geoCheck.running', 'Running the geo check')}
          </p>
          <p className="max-w-sm text-xs text-dark-400">
            {t(
              'admin.remnawave.geoCheck.runningHint',
              'The node is testing its connection. This usually takes up to a minute.',
            )}
          </p>
        </div>
      )}

      {job.phase === 'error' && (
        <div className="flex flex-col items-center gap-3 px-4 py-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-error-500/15 text-error-400">
            <WarningIcon className="h-6 w-6" />
          </span>
          <p className="text-sm font-medium text-dark-100">
            {t('admin.remnawave.geoCheck.error.title', 'Check failed')}
          </p>
          <p className="max-w-sm break-words text-xs text-dark-400">{errorText}</p>
          <div className="mt-1 flex items-center gap-2">
            <Button type="button" variant="secondary" size="lg" onClick={job.reset}>
              {t('admin.remnawave.geoCheck.changeRoute', 'Change route')}
            </Button>
            <Button type="button" size="lg" onClick={job.retry}>
              {t('admin.remnawave.geoCheck.rerun', 'Run again')}
            </Button>
          </div>
        </div>
      )}

      {job.phase === 'done' && job.result && (
        <GeoCheckReport
          result={job.result}
          nodeName={node.name}
          fullscreen={fullscreen}
          canFullscreen={canFullscreen}
          canDownload={!isTelegram}
          onToggleFullscreen={() => setFullscreen((current) => !current)}
          onRerun={job.retry}
        />
      )}
    </ResponsiveOverlay>
  );
}
