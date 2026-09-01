import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { RemnawaveAppClient } from '@/types';
import { CabinetIcon } from '@/components/icons';
import type { RenderBlock } from './blocks';

interface ApplicationStepProps {
  selectedApp: RemnawaveAppClient;
  availableApps: RemnawaveAppClient[];
  installBlocks: RenderBlock[];
  showOtherApps: boolean;
  onToggleOtherApps: () => void;
  onSelectApp: (app: RemnawaveAppClient) => void;
  onContinue: () => void;
  getSvgHtml: (key: string | undefined) => string;
  renderBlocks: (blocks: RenderBlock[]) => ReactNode;
}

export function ApplicationStep({
  selectedApp,
  availableApps,
  installBlocks,
  showOtherApps,
  onToggleOtherApps,
  onSelectApp,
  onContinue,
  getSvgHtml,
  renderBlocks,
}: ApplicationStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {installBlocks.length === 0 && (
        <p className="text-sm text-dark-400">
          {t('subscription.connection.installAppDescription', {
            defaultValue: 'Download and install {{app}}, then continue.',
            app: selectedApp.name,
          })}
        </p>
      )}
      {availableApps.length > 1 && (
        <div className="space-y-2">
          <button
            type="button"
            className="btn-secondary w-full justify-center"
            aria-expanded={showOtherApps}
            onClick={onToggleOtherApps}
          >
            <span aria-hidden="true" className="text-accent-400">
              <CabinetIcon className="h-5 w-5 shrink-0" />
            </span>
            {t('subscription.connection.chooseAnotherApp', 'Choose another app')}
          </button>
          {showOtherApps && (
            <div className="grid gap-2 sm:grid-cols-2">
              {availableApps.map((app) => {
                const icon = getSvgHtml(app.svgIconKey);
                return (
                  <button
                    key={app.name}
                    type="button"
                    onClick={() => onSelectApp(app)}
                    aria-pressed={app.name === selectedApp.name}
                    className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-2 text-start text-sm font-medium transition-colors ${
                      app.name === selectedApp.name
                        ? 'border-accent-500/50 bg-accent-500/10 text-accent-400'
                        : 'border-dark-700/50 bg-dark-800/70 text-dark-200 hover:border-dark-600'
                    }`}
                  >
                    {icon && (
                      <span
                        aria-hidden="true"
                        className="h-7 w-7 shrink-0 [&>svg]:h-full [&>svg]:w-full"
                        // biome-ignore lint/security/noDangerouslySetInnerHtml: The parent sanitizes configured SVG with DOMPurify.
                        dangerouslySetInnerHTML={{ __html: icon }}
                      />
                    )}
                    <span>{app.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
      {installBlocks.length > 0 ? (
        renderBlocks(installBlocks)
      ) : (
        <div className="rounded-2xl border border-dark-700/50 bg-dark-800/50 p-4 text-sm text-dark-400">
          {t('subscription.connection.installUnavailable', {
            defaultValue: 'Use the official store for your device to install {{app}}.',
            app: selectedApp.name,
          })}
        </div>
      )}
      <button type="button" className="btn-secondary w-full justify-center" onClick={onContinue}>
        {t('subscription.connection.appInstalled', 'App is installed')}
      </button>
    </div>
  );
}
