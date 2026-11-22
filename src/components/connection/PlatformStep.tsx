import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppConfig, RemnawavePlatformData } from '@/types';
import { DevicesIcon } from '@/components/icons';
import { ConnectionChoiceList } from './ConnectionChoiceList';
import { ConnectionSelectionCard } from './ConnectionSelectionCard';

interface PlatformStepProps {
  appConfig: AppConfig;
  availablePlatforms: string[];
  currentPlatformKey: string;
  activePlatformName: string;
  activePlatformIcon: string;
  isAutoDetected: boolean;
  getPlatformDisplayName: (platform: string) => string;
  getSvgHtml: (key: string | undefined) => string;
  onSelect: (platform: string) => void;
  onContinue: () => void;
}

export function PlatformStep({
  appConfig,
  availablePlatforms,
  currentPlatformKey,
  activePlatformName,
  activePlatformIcon,
  isAutoDetected,
  getPlatformDisplayName,
  getSvgHtml,
  onSelect,
  onContinue,
}: PlatformStepProps) {
  const { t } = useTranslation();
  const [showOtherPlatforms, setShowOtherPlatforms] = useState(false);

  return (
    <div className="space-y-4">
      <ConnectionSelectionCard
        data-selected-platform
        label={
          isAutoDetected
            ? t('subscription.connection.detectedPlatform', 'Detected device')
            : t('subscription.connection.selectedPlatform', 'Device to set up')
        }
        name={activePlatformName}
        expanded={showOtherPlatforms}
        onToggle={
          availablePlatforms.length > 1
            ? () => setShowOtherPlatforms((visible) => !visible)
            : undefined
        }
        icon={
          activePlatformIcon ? (
            <span
              className="h-6 w-6 [&>svg]:h-full [&>svg]:w-full"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: The parent sanitizes configured SVG with DOMPurify.
              dangerouslySetInnerHTML={{ __html: activePlatformIcon }}
            />
          ) : (
            <DevicesIcon className="h-6 w-6" />
          )
        }
      />
      {availablePlatforms.length > 1 && (
        <ConnectionChoiceList open={showOtherPlatforms} className="gap-3">
          {availablePlatforms
            .filter((platform) => platform !== currentPlatformKey)
            .map((platform) => {
              const data = appConfig.platforms[platform] as RemnawavePlatformData;
              const icon = getSvgHtml(data.svgIconKey);
              return (
                <button
                  key={platform}
                  type="button"
                  className="flex min-h-14 items-center gap-3 rounded-2xl border border-dark-700/50 bg-dark-800/70 p-4 text-start font-medium text-dark-100 transition-colors hover:border-accent-500/40 hover:bg-dark-700/70"
                  onClick={() => {
                    onSelect(platform);
                    setShowOtherPlatforms(false);
                  }}
                >
                  {icon && (
                    <span
                      className="h-7 w-7 shrink-0 [&>svg]:h-full [&>svg]:w-full"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: The parent sanitizes configured SVG with DOMPurify.
                      dangerouslySetInnerHTML={{ __html: icon }}
                    />
                  )}
                  <span>{getPlatformDisplayName(platform)}</span>
                </button>
              );
            })}
        </ConnectionChoiceList>
      )}
      <button type="button" className="btn-primary w-full justify-center" onClick={onContinue}>
        {t('subscription.connection.continueWithPlatform', {
          defaultValue: 'Continue with {{platform}}',
          platform: activePlatformName,
        })}
      </button>
    </div>
  );
}
