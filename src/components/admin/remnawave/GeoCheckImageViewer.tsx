import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useReducedMotion } from 'framer-motion';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';
import { MinusIcon, PlusIcon, ResetIcon, WarningIcon } from '@/components/icons';
import { Button } from '@/components/primitives/Button';

const READABLE_WIDTH = 760;
const SCALE_MIN = 1;
const SCALE_MAX = 8;
const SKELETON_ROWS = [42, 88, 80, 84, 30, 70, 76, 82, 64, 28, 86, 74, 80, 68];

interface GeoCheckImageViewerProps {
  src: string;
  alt: string;
  fullscreen: boolean;
}

export function GeoCheckImageViewer({ src, alt, fullscreen }: GeoCheckImageViewerProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;
  const hostRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const loaded = loadedSrc === src;
  const failed = failedSrc === src;

  const srcId = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < src.length; i += 1) {
      hash = (hash * 31 + src.charCodeAt(i)) | 0;
    }
    return `${src.length}:${hash}`;
  }, [src]);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(host);
    setWidth(host.clientWidth);
    return () => observer.disconnect();
  }, []);

  const initialScale = width > 0 ? Math.min(SCALE_MAX, Math.max(1, READABLE_WIDTH / width)) : 1;

  return (
    <div ref={hostRef} className="relative h-full">
      {!loaded && !failed && (
        <div className="absolute inset-0 z-10 space-y-2 p-4" aria-busy="true">
          {SKELETON_ROWS.map((rowWidth, index) => (
            <div
              key={`${rowWidth}-${index}`}
              className="h-3 animate-pulse rounded bg-dark-700/50"
              style={{ width: `${rowWidth}%` }}
            />
          ))}
        </div>
      )}

      {failed && (
        <div
          role="alert"
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-4 text-center text-error-400"
        >
          <WarningIcon className="h-8 w-8" />
          <p className="text-sm">
            {t('admin.remnawave.geoCheck.error.image', 'The report image could not be displayed.')}
          </p>
        </div>
      )}

      {width > 0 && (
        <TransformWrapper
          key={`${srcId}-${fullscreen}-${Math.round(initialScale * 10)}`}
          centerOnInit={false}
          disablePadding
          doubleClick={{ mode: 'toggle', animationTime: reducedMotion ? 0 : 200 }}
          initialScale={initialScale}
          maxScale={SCALE_MAX}
          minScale={SCALE_MIN}
          autoAlignment={{
            animationTime: reducedMotion ? 0 : 200,
            velocityAlignmentTime: reducedMotion ? 0 : 400,
          }}
          panning={{ velocityDisabled: reducedMotion }}
          smooth={!reducedMotion}
          trackPadPanning={{ disabled: false, velocityDisabled: reducedMotion }}
          velocityAnimation={{ disabled: reducedMotion }}
          wheel={{ wheelDisabled: true }}
          zoomAnimation={{ disabled: reducedMotion }}
        >
          {({ resetTransform, zoomIn, zoomOut }) => (
            <>
              <TransformComponent
                contentStyle={{ width: '100%' }}
                wrapperClass="!h-full !w-full cursor-grab touch-none active:cursor-grabbing"
              >
                <img
                  alt={alt}
                  className="block w-full select-none"
                  draggable={false}
                  src={src}
                  onLoad={() => {
                    setFailedSrc(null);
                    setLoadedSrc(src);
                  }}
                  onError={() => {
                    setLoadedSrc(null);
                    setFailedSrc(src);
                  }}
                />
              </TransformComponent>

              {loaded && (
                <div className="absolute bottom-3 right-3 z-10 flex items-center gap-0.5 rounded-xl border border-dark-100/10 bg-dark-950/70 p-1 shadow-lg backdrop-blur-md">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    onClick={() => zoomOut(undefined, reducedMotion ? 0 : 300)}
                    className="rounded-lg text-dark-200 hover:bg-dark-100/10"
                    aria-label={t('admin.remnawave.geoCheck.zoomOut', 'Zoom out')}
                  >
                    <MinusIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    onClick={() => zoomIn(undefined, reducedMotion ? 0 : 300)}
                    className="rounded-lg text-dark-200 hover:bg-dark-100/10"
                    aria-label={t('admin.remnawave.geoCheck.zoomIn', 'Zoom in')}
                  >
                    <PlusIcon className="h-4 w-4" />
                  </Button>
                  <span aria-hidden className="mx-0.5 h-5 w-px bg-dark-100/15" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-lg"
                    onClick={() => resetTransform(reducedMotion ? 0 : 200)}
                    className="rounded-lg text-dark-200 hover:bg-dark-100/10"
                    aria-label={t('admin.remnawave.geoCheck.zoomReset', 'Reset zoom')}
                  >
                    <ResetIcon className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </TransformWrapper>
      )}
    </div>
  );
}
