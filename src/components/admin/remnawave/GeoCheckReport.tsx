import { useMemo, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { GeoCheckResult } from '@/api/adminRemnawave';
import {
  CheckIcon,
  CodeIcon,
  CollapseIcon,
  CopyIcon,
  DownloadIcon,
  ExpandIcon,
  EyeIcon,
  RefreshIcon,
} from '@/components/icons';
import { Button } from '@/components/primitives/Button';
import { cn } from '@/lib/utils';
import { copyToClipboard } from '@/utils/clipboard';
import { GeoCheckImageViewer } from './GeoCheckImageViewer';

type ReportTab = 'report' | 'json';

const TOOLBAR_BUTTON =
  'shrink-0 rounded-lg bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-dark-100';

interface GeoCheckReportProps {
  result: GeoCheckResult;
  nodeName: string;
  fullscreen: boolean;
  canFullscreen: boolean;
  canDownload: boolean;
  onToggleFullscreen: () => void;
  onRerun: () => void;
}

export function GeoCheckReport({
  result,
  nodeName,
  fullscreen,
  canFullscreen,
  canDownload,
  onToggleFullscreen,
  onRerun,
}: GeoCheckReportProps) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<ReportTab>(result.image?.data ? 'report' : 'json');
  const [copied, setCopied] = useState(false);

  const imageSrc = useMemo(() => {
    const image = result.image;
    if (!image?.data) return null;
    return `data:${image.media_type};${image.encoding},${image.data}`;
  }, [result.image]);

  const reportJson = useMemo(
    () => (result.raw_report ? JSON.stringify(result.raw_report, null, 2) : null),
    [result.raw_report],
  );

  const imageAlt = t('admin.remnawave.geoCheck.reportAlt', 'GeoCheck report for {{node}}', {
    node: nodeName,
  });

  const handleCopy = async () => {
    if (!reportJson) return;
    await copyToClipboard(reportJson);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const image = result.image;
    if (!image?.data) return;

    const binary = atob(image.data);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    const url = URL.createObjectURL(new Blob([bytes], { type: image.media_type }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `geocheck-${nodeName.replace(/[^\w.-]+/g, '-').toLowerCase()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const tabs: Array<{ id: ReportTab; label: string; icon: ReactNode; enabled: boolean }> = [
    {
      id: 'report',
      label: t('admin.remnawave.geoCheck.tab.report', 'Report'),
      icon: <EyeIcon className="h-3.5 w-3.5" />,
      enabled: Boolean(imageSrc),
    },
    {
      id: 'json',
      label: t('admin.remnawave.geoCheck.tab.json', 'JSON'),
      icon: <CodeIcon className="h-3.5 w-3.5" />,
      enabled: Boolean(reportJson),
    },
  ];

  const fullscreenLabel = fullscreen
    ? t('admin.remnawave.geoCheck.exitFullscreen', 'Exit fullscreen')
    : t('admin.remnawave.geoCheck.fullscreen', 'Fullscreen');

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 rounded-xl bg-dark-800/50 p-1">
          {tabs
            .filter((item) => item.enabled)
            .map((item) => (
              <Button
                key={item.id}
                type="button"
                variant="ghost"
                size="lg"
                onClick={() => setTab(item.id)}
                aria-pressed={tab === item.id}
                className={cn(
                  'gap-1.5 px-3 text-xs',
                  tab === item.id
                    ? 'bg-accent-500/20 text-accent-400'
                    : 'text-dark-400 hover:bg-dark-700/50 hover:text-dark-200',
                )}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
        </div>

        <div className="ml-auto flex items-center gap-1">
          {canFullscreen && (
            <Button
              type="button"
              variant="secondary"
              size="icon-lg"
              onClick={onToggleFullscreen}
              disabled={!imageSrc}
              className={TOOLBAR_BUTTON}
              title={fullscreenLabel}
              aria-label={fullscreenLabel}
              aria-pressed={fullscreen}
            >
              {fullscreen ? (
                <CollapseIcon className="h-4 w-4" />
              ) : (
                <ExpandIcon className="h-4 w-4" />
              )}
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            size="icon-lg"
            onClick={handleCopy}
            disabled={!reportJson}
            className={TOOLBAR_BUTTON}
            title={t('admin.remnawave.geoCheck.copyJson', 'Copy JSON report')}
            aria-label={t('admin.remnawave.geoCheck.copyJson', 'Copy JSON report')}
          >
            {copied ? (
              <CheckIcon className="h-4 w-4 text-success-400" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )}
          </Button>
          {canDownload && (
            <Button
              type="button"
              variant="secondary"
              size="icon-lg"
              onClick={handleDownload}
              disabled={!imageSrc}
              className={TOOLBAR_BUTTON}
              title={t('admin.remnawave.geoCheck.download', 'Download SVG')}
              aria-label={t('admin.remnawave.geoCheck.download', 'Download SVG')}
            >
              <DownloadIcon className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="secondary"
            size="icon-lg"
            onClick={onRerun}
            className={TOOLBAR_BUTTON}
            title={t('admin.remnawave.geoCheck.rerun', 'Run again')}
            aria-label={t('admin.remnawave.geoCheck.rerun', 'Run again')}
          >
            <RefreshIcon className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {result.message && (
        <p className="mt-3 rounded-xl bg-warning-500/10 px-3 py-2 text-xs text-warning-400">
          {result.message}
        </p>
      )}

      <div
        className={cn(
          'relative mt-3 overflow-hidden rounded-2xl border border-dark-700 bg-dark-950 [contain:paint]',
          fullscreen ? 'min-h-0 flex-1' : 'h-[62dvh] min-h-[16rem]',
        )}
      >
        {tab === 'report' && imageSrc && (
          <GeoCheckImageViewer src={imageSrc} alt={imageAlt} fullscreen={fullscreen} />
        )}
        {tab === 'json' && reportJson && (
          <pre className="h-full overflow-auto p-3 font-mono text-[11px] leading-relaxed text-dark-200">
            {reportJson}
          </pre>
        )}
      </div>
    </div>
  );
}
