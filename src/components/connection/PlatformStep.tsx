import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import type { AppConfig, RemnawavePlatformData } from '@/types';
import { CheckIcon } from '@/components/icons';

interface PlatformStepProps {
  appConfig: AppConfig;
  availablePlatforms: string[];
  currentPlatformKey: string;
  activePlatformName: string;
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
  isAutoDetected,
  getPlatformDisplayName,
  getSvgHtml,
  onSelect,
  onContinue,
}: PlatformStepProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const [showOtherPlatforms, setShowOtherPlatforms] = useState(false);
  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };

  return (
    <div className="space-y-4">
      <p className="text-sm text-dark-400">
        {isAutoDetected
          ? t(
              'subscription.connection.detectedPlatformDescription',
              'We detected your device. You can change it if needed.',
            )
          : t(
              'subscription.connection.selectedPlatformDescription',
              'Continue with the selected device or choose another one.',
            )}
      </p>
      <div className="flex items-center gap-3 rounded-2xl border border-accent-500/50 bg-accent-500/10 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-400">
            {isAutoDetected
              ? t('subscription.connection.detectedPlatform', 'Detected device')
              : t('subscription.connection.selectedPlatform', 'Selected device')}
          </p>
          <p className="mt-1 text-lg font-semibold text-dark-100">{activePlatformName}</p>
        </div>
        <CheckIcon className="h-6 w-6 shrink-0 text-accent-400" />
      </div>
      <button type="button" className="btn-primary w-full justify-center" onClick={onContinue}>
        {t('subscription.connection.continueWithPlatform', {
          defaultValue: 'Continue with {{platform}}',
          platform: activePlatformName,
        })}
      </button>
      {availablePlatforms.length > 1 && (
        <div className="space-y-3">
          <button
            type="button"
            className="btn-secondary w-full justify-center"
            aria-expanded={showOtherPlatforms}
            onClick={() => setShowOtherPlatforms((visible) => !visible)}
          >
            {showOtherPlatforms
              ? t('subscription.connection.hideOtherDevices', 'Hide other devices')
              : t('subscription.connection.chooseAnotherDevice', 'Choose another device')}
          </button>
          <AnimatePresence initial={false}>
            {showOtherPlatforms && (
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
                transition={transition}
                className="grid gap-3 overflow-hidden sm:grid-cols-2"
              >
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
