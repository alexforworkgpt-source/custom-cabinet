import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { RemnawaveAppClient } from '@/types';
import { CabinetIcon } from '@/components/icons';
import type { RenderBlock } from './blocks';
import { ConnectionChoiceList } from './ConnectionChoiceList';
import { ConnectionSelectionCard } from './ConnectionSelectionCard';

interface ApplicationStepProps {
  selectedApp: RemnawaveAppClient;
  availableApps: RemnawaveAppClient[];
  installBlocks: RenderBlock[];
  isRecommended: boolean;
  onSelectApp: (app: RemnawaveAppClient) => void;
  onContinue: () => void;
  getSvgHtml: (key: string | undefined) => string;
  renderBlocks: (blocks: RenderBlock[]) => ReactNode;
}

export function ApplicationStep({
  selectedApp,
  availableApps,
  installBlocks,
  isRecommended,
  onSelectApp,
  onContinue,
  getSvgHtml,
  renderBlocks,
}: ApplicationStepProps) {
  const { t } = useTranslation();
  const [showOtherApps, setShowOtherApps] = useState(false);
  const activeIcon = getSvgHtml(selectedApp.svgIconKey);

  return (
    <div className="space-y-2">
      <ConnectionSelectionCard
        label={
          isRecommended
            ? t('subscription.connection.recommendedApp', 'Recommended')
            : t('subscription.connection.selectedApp', 'Selected app')
        }
        name={selectedApp.name}
        expanded={showOtherApps}
        onToggle={
          availableApps.length > 1 ? () => setShowOtherApps((visible) => !visible) : undefined
        }
        icon={
          activeIcon ? (
            <span
              className="h-6 w-6 [&>svg]:h-full [&>svg]:w-full"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: The parent sanitizes configured SVG with DOMPurify.
              dangerouslySetInnerHTML={{ __html: activeIcon }}
            />
          ) : (
            <CabinetIcon className="h-6 w-6" />
          )
        }
      />
      {installBlocks.length === 0 && (
        <p className="text-sm text-dark-400">
          {t('subscription.connection.installAppDescription', {
            defaultValue: 'Download and install {{app}}, then continue.',
            app: selectedApp.name,
          })}
        </p>
      )}
      {availableApps.length > 1 && (
        <ConnectionChoiceList open={showOtherApps} className="gap-2">
          {availableApps.map((app) => {
            const icon = getSvgHtml(app.svgIconKey);
            return (
              <button
                key={app.name}
                type="button"
                onClick={() => {
                  setShowOtherApps(false);
                  onSelectApp(app);
                }}
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
        </ConnectionChoiceList>
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
        {t('common.next')}
      </button>
    </div>
  );
}
