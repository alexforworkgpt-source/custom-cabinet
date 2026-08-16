import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { RemnawaveAppClient } from '@/types';
import type { RenderBlock } from './blocks';

interface ApplicationStepProps {
  selectedApp: RemnawaveAppClient;
  availableApps: RemnawaveAppClient[];
  installBlocks: RenderBlock[];
  showOtherApps: boolean;
  onToggleOtherApps: () => void;
  onSelectApp: (app: RemnawaveAppClient) => void;
  onContinue: () => void;
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
  renderBlocks,
}: ApplicationStepProps) {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      <p className="text-sm text-dark-400">
        {t('subscription.connection.installAppDescription', {
          defaultValue: 'Download and install {{app}}, then continue.',
          app: selectedApp.name,
        })}
      </p>
      {availableApps.length > 1 && (
        <div className="space-y-2">
          <button
            type="button"
            className="btn-secondary w-full justify-center"
            aria-expanded={showOtherApps}
            onClick={onToggleOtherApps}
          >
            {t('subscription.connection.chooseAnotherApp', 'Choose another app')}
          </button>
          {showOtherApps && (
            <div className="grid gap-2 sm:grid-cols-2">
              {availableApps.map((app) => (
                <button
                  key={app.name}
                  type="button"
                  onClick={() => onSelectApp(app)}
                  aria-pressed={app.name === selectedApp.name}
                  className={`min-h-12 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                    app.name === selectedApp.name
                      ? 'border-accent-500/50 bg-accent-500/10 text-accent-400'
                      : 'border-dark-700/50 bg-dark-800/70 text-dark-200 hover:border-dark-600'
                  }`}
                >
                  {app.name}
                </button>
              ))}
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
      <button type="button" className="btn-primary w-full justify-center" onClick={onContinue}>
        {t('subscription.connection.appInstalled', 'App is installed')}
      </button>
    </div>
  );
}
