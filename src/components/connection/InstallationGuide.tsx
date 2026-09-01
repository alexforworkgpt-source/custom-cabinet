import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import DOMPurify from 'dompurify';
import type {
  AppConfig,
  LocalizedText,
  RemnawaveAppClient,
  RemnawavePlatformData,
  RemnawaveBlockClient,
  RemnawaveButtonClient,
} from '@/types';
import { useTheme } from '@/hooks/useTheme';
import { CardsBlock, TimelineBlock, AccordionBlock, MinimalBlock, BlockButtons } from './blocks';
import type { BlockRendererProps, RenderBlock } from './blocks';
import TvQuickConnect from './TvQuickConnect';
import { PlatformStep } from './PlatformStep';
import { ApplicationStep } from './ApplicationStep';
import { BackIcon, BookOpenIcon, CheckIcon } from '@/components/icons';
import { getDirectConnectionBackPath } from '@/utils/userCabinetRouteState';

const platformOrder = ['ios', 'android', 'windows', 'macos', 'linux', 'androidTV', 'appleTV'];
type ConnectionStep = 'platform' | 'application' | 'add' | 'success';

function detectPlatform(): string | null {
  if (typeof window === 'undefined' || !navigator?.userAgent) return null;
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (/android/.test(ua)) return /tv|television/.test(ua) ? 'androidTV' : 'android';
  if (/macintosh|mac os x/.test(ua)) return 'macos';
  if (/windows/.test(ua)) return 'windows';
  if (/linux/.test(ua)) return 'linux';
  return null;
}

function partitionBlocks(blocks: RemnawaveBlockClient[]) {
  const isInstallButton = (button: RemnawaveButtonClient) =>
    !button.type || button.type === 'external';
  const isSubscriptionButton = (button: RemnawaveButtonClient) =>
    button.type === 'subscriptionLink' || button.type === 'copyButton';

  if (blocks.length === 0) return { install: [], subscription: [], completion: [] };

  const setupBlocks = blocks.slice(0, 2);
  const blocksForStep = (
    includeButton: (button: RemnawaveButtonClient) => boolean,
    textOnlyIndex: number,
  ) =>
    setupBlocks.flatMap((block, index) => {
      if (!block.buttons) return index === textOnlyIndex ? [block] : [];
      const buttons = block.buttons.filter(includeButton);
      return buttons.length > 0 ? [{ ...block, buttons }] : [];
    });

  return {
    install: blocksForStep(isInstallButton, 0),
    subscription: blocksForStep(isSubscriptionButton, 1),
    completion: blocks.slice(2),
  };
}

const RENDERERS: Record<string, React.ComponentType<BlockRendererProps>> = {
  cards: CardsBlock,
  timeline: TimelineBlock,
  accordion: AccordionBlock,
  minimal: MinimalBlock,
};

/** TV quick-connect is a Happ-only feature (check.happ.su/sendtv) — show it only
 *  for the Happ app, detected by its happ:// deep-link scheme (name as fallback). */
function isHappApp(app: RemnawaveAppClient | null): boolean {
  if (!app) return false;
  if ((app.deepLink ?? '').toLowerCase().startsWith('happ://')) return true;
  return app.name.toLowerCase().includes('happ');
}

interface Props {
  appConfig: AppConfig;
  onOpenDeepLink: (url: string) => void;
  isTelegramWebApp: boolean;
  onGoBack: () => void;
  onFinish: () => void;
  onOpenQR?: () => void;
  username?: string;
}

export default function InstallationGuide({
  appConfig,
  onOpenDeepLink,
  isTelegramWebApp,
  onGoBack,
  onFinish,
  onOpenQR,
  username,
}: Props) {
  const { t, i18n } = useTranslation();
  const { isLight } = useTheme();
  const navigate = useNavigate();
  const stepHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousStepRef = useRef<ConnectionStep | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedStep = searchParams.get('step');
  const requestedPlatform = searchParams.get('platform');
  const requestedApp = searchParams.get('app');
  const requestedPlatformData = requestedPlatform
    ? appConfig.platforms[requestedPlatform]
    : undefined;
  const hasValidSuccessTarget = Boolean(
    requestedPlatformData?.apps.some((app) => app.name === requestedApp),
  );
  const step =
    requestedStep === 'success' && !hasValidSuccessTarget
      ? 'platform'
      : requestedStep === 'application' || requestedStep === 'add' || requestedStep === 'success'
        ? requestedStep
        : 'platform';

  const detectedPlatform = useMemo(() => detectPlatform(), []);
  const reducedMotion = useReducedMotion();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const [activePlatformKey, setActivePlatformKey] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<RemnawaveAppClient | null>(null);
  const [showOtherApps, setShowOtherApps] = useState(false);

  const setFlowStep = useCallback(
    (nextStep: ConnectionStep, platform?: string, app?: string, replace = false) => {
      const next = new URLSearchParams(searchParams);
      next.set('step', nextStep);
      if (platform) next.set('platform', platform);
      else if (nextStep === 'platform') next.delete('platform');
      if (app) next.set('app', app);
      else next.delete('app');
      setSearchParams(next, { replace });
    },
    [searchParams, setSearchParams],
  );

  useEffect(() => {
    if (requestedStep !== 'success' || hasValidSuccessTarget) return;
    const validPlatform = requestedPlatformData?.apps.length
      ? (requestedPlatform ?? undefined)
      : undefined;
    setFlowStep('platform', validPlatform, undefined, true);
  }, [
    hasValidSuccessTarget,
    requestedPlatform,
    requestedPlatformData?.apps.length,
    requestedStep,
    setFlowStep,
  ]);

  const getLocalizedText = useCallback(
    (text: LocalizedText | undefined): string => {
      if (!text) return '';
      const lang = i18n.language || 'en';
      return text[lang] || text.en || text.ru || Object.values(text)[0] || '';
    },
    [i18n.language],
  );

  const getBaseTranslation = useCallback(
    (key: string, i18nKey: string): string => {
      const bt = appConfig.baseTranslations;
      if (bt && key in bt) {
        const text = getLocalizedText(bt[key as keyof typeof bt] as LocalizedText);
        if (text) return text;
      }
      return t(i18nKey);
    },
    [appConfig.baseTranslations, getLocalizedText, t],
  );

  const getSvgHtml = useCallback(
    (svgKey: string | undefined): string => {
      if (!svgKey || !appConfig.svgLibrary?.[svgKey]) return '';
      const entry = appConfig.svgLibrary[svgKey];
      const raw = typeof entry === 'string' ? entry : entry.svgString;
      if (!raw) return '';
      return DOMPurify.sanitize(raw, { USE_PROFILES: { svg: true, svgFilters: true } });
    },
    [appConfig.svgLibrary],
  );

  const availablePlatforms = useMemo(() => {
    if (!appConfig.platforms) return [];
    const available = platformOrder.filter((key) => {
      const data = appConfig.platforms[key] as RemnawavePlatformData | undefined;
      return Boolean(data?.apps?.length);
    });
    if (detectedPlatform && available.includes(detectedPlatform)) {
      return [detectedPlatform, ...available.filter((p) => p !== detectedPlatform)];
    }
    return available;
  }, [appConfig.platforms, detectedPlatform]);

  useEffect(() => {
    if (!availablePlatforms.length) return;
    const requestedPlatform = searchParams.get('platform');
    const platform =
      requestedPlatform && availablePlatforms.includes(requestedPlatform)
        ? requestedPlatform
        : availablePlatforms[0];
    const data = appConfig.platforms[platform] as RemnawavePlatformData | undefined;
    if (!data?.apps?.length) return;
    const requestedApp = searchParams.get('app');
    const app =
      data.apps.find((item) => item.name === requestedApp) ||
      data.apps.find((item) => item.featured) ||
      data.apps[0];
    if (app) {
      setSelectedApp(app);
      setActivePlatformKey(platform);
    }
  }, [appConfig.platforms, availablePlatforms, searchParams]);

  useEffect(() => {
    if (previousStepRef.current && previousStepRef.current !== step) {
      stepHeadingRef.current?.focus({ preventScroll: true });
    }
    previousStepRef.current = step;
  }, [step]);

  const renderBlockButtons = useCallback(
    (
      buttons: RemnawaveButtonClient[] | undefined,
      variant: 'light' | 'subtle',
      onSubscriptionOpen?: () => void,
      onExternalOpen?: () => void,
    ) => (
      <BlockButtons
        buttons={buttons}
        variant={variant}
        isLight={isLight}
        subscriptionUrl={appConfig.subscriptionUrl}
        hideLink={appConfig.hideLink}
        deepLink={selectedApp?.deepLink}
        username={username}
        getLocalizedText={getLocalizedText}
        getBaseTranslation={getBaseTranslation}
        getSvgHtml={getSvgHtml}
        onOpenDeepLink={onOpenDeepLink}
        onSubscriptionOpen={onSubscriptionOpen}
        onExternalOpen={onExternalOpen}
      />
    ),
    [
      appConfig.subscriptionUrl,
      appConfig.hideLink,
      selectedApp?.deepLink,
      username,
      isLight,
      getLocalizedText,
      getBaseTranslation,
      getSvgHtml,
      onOpenDeepLink,
    ],
  );

  const userIsOnTv = detectedPlatform === 'androidTV' || detectedPlatform === 'appleTV';
  // Happ's TV quick-connect (check.happ.su/sendtv) is ONE API serving BOTH
  // Android TV and Apple TV — show the widget on either.
  const selectedPlatform = activePlatformKey || availablePlatforms[0];
  const isTvLayout =
    (selectedPlatform === 'androidTV' || selectedPlatform === 'appleTV') && !userIsOnTv;

  const currentPlatformKey = activePlatformKey || availablePlatforms[0];
  const currentPlatformData = currentPlatformKey
    ? (appConfig.platforms[currentPlatformKey] as RemnawavePlatformData | undefined)
    : undefined;
  const currentPlatformApps = currentPlatformData?.apps || [];
  const flowBlocks = selectedApp
    ? partitionBlocks(selectedApp.blocks)
    : { install: [], subscription: [], completion: [] };
  const installBlocks = flowBlocks.install;
  const subscriptionBlocks = flowBlocks.subscription;
  const completionBlocks = flowBlocks.completion;

  // Platform display name
  const getPlatformDisplayName = useCallback(
    (key: string): string => {
      const data = appConfig.platforms[key] as RemnawavePlatformData | undefined;
      if (data?.displayName) {
        const name = getLocalizedText(data.displayName);
        if (name) return name;
      }
      if (appConfig.platformNames?.[key]) {
        return getLocalizedText(appConfig.platformNames[key]);
      }
      const fallback: Record<string, string> = {
        ios: 'iOS',
        android: 'Android',
        windows: 'Windows',
        macos: 'macOS',
        linux: 'Linux',
        androidTV: 'Android TV',
        appleTV: 'Apple TV',
      };
      return fallback[key] || key;
    },
    [appConfig.platforms, appConfig.platformNames, getLocalizedText],
  );

  // Block renderer
  const blockType = appConfig.uiConfig?.installationGuidesBlockType || 'cards';
  const Renderer = RENDERERS[blockType] || CardsBlock;

  // For the Happ TV app (Android TV / Apple TV), inject the TV connect widget as
  // customNode so it renders THROUGH the active block style (cards/timeline/
  // accordion/minimal) instead of as separate clashing cards that break it.
  const showTvConnect = Boolean(
    selectedApp && isTvLayout && isHappApp(selectedApp) && appConfig.subscriptionUrl,
  );
  let renderBlocks: RenderBlock[] = subscriptionBlocks;
  if (selectedApp && showTvConnect && appConfig.subscriptionUrl) {
    const widget = <TvQuickConnect subscriptionUrl={appConfig.subscriptionUrl} isLight={isLight} />;
    renderBlocks = renderBlocks.length
      ? renderBlocks.map((block, index) => (index === 0 ? { ...block, customNode: widget } : block))
      : [{ title: {}, description: {}, customNode: widget }];
  }

  const activePlatformName = currentPlatformKey ? getPlatformDisplayName(currentPlatformKey) : '';
  const activePlatformIcon = getSvgHtml(currentPlatformData?.svgIconKey);
  const transition = reducedMotion
    ? { duration: 0 }
    : { duration: 0.24, ease: [0.22, 1, 0.36, 1] as const };
  const stepIndex = (['platform', 'application', 'add', 'success'] as ConnectionStep[]).indexOf(
    step,
  );

  const renderConfiguredBlocks = (
    blocks: RenderBlock[],
    options?: {
      section?: 'install' | 'add';
      onSubscriptionOpen?: () => void;
      onExternalOpen?: () => void;
    },
  ) => {
    const buttons = options ? blocks.flatMap((block) => block.buttons ?? []) : [];
    const renderedBlocks = options
      ? blocks.map((block) => ({ ...block, buttons: undefined }))
      : blocks;
    const content = (
      <Renderer
        blocks={renderedBlocks}
        isMobile={isMobile}
        isLight={isLight}
        getLocalizedText={getLocalizedText}
        getSvgHtml={getSvgHtml}
        renderBlockButtons={renderBlockButtons}
      />
    );

    if (!options) return content;

    return (
      <div data-connection-section={options.section}>
        <div data-connection-section-content>{content}</div>
        {buttons.length > 0 && (
          <div data-connection-section-actions>
            {renderBlockButtons(
              buttons,
              'light',
              options.onSubscriptionOpen,
              options.onExternalOpen,
            )}
          </div>
        )}
      </div>
    );
  };

  const selectPlatform = (platform: string) => {
    const data = appConfig.platforms[platform] as RemnawavePlatformData | undefined;
    setActivePlatformKey(platform);
    setSelectedApp(data?.apps.find((item) => item.featured) || data?.apps[0] || null);
    setFlowStep('platform', platform, undefined, true);
    requestAnimationFrame(() => stepHeadingRef.current?.focus({ preventScroll: true }));
  };

  const goBack = () => {
    if (step === 'platform') {
      onGoBack();
      return;
    }
    if ((window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
      return;
    }
    const fallback = getDirectConnectionBackPath(`?${searchParams.toString()}`);
    if (fallback) navigate(fallback, { replace: true });
  };

  const stepTitle =
    step === 'platform'
      ? t('subscription.connection.setupPlatform', {
          defaultValue: 'Set up {{platform}}',
          platform: activePlatformName,
        })
      : step === 'application'
        ? t('subscription.connection.installAppTitle', {
            defaultValue: 'Install {{app}}',
            app: selectedApp?.name || '',
          })
        : step === 'add'
          ? t('subscription.connection.addSubscription', 'Add subscription')
          : t('subscription.connection.successTitle', 'Subscription added successfully');

  return (
    <div className="space-y-4 pb-2">
      <p className="sr-only" aria-live="polite">
        {t('subscription.connection.step', { current: stepIndex + 1, total: 4 })}
      </p>
      <div className="flex items-center gap-3">
        {(!isTelegramWebApp || step !== 'platform') && (
          <button
            onClick={goBack}
            aria-label={t('common.back', 'Back')}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-dark-700 bg-dark-800 transition-colors hover:border-dark-600"
          >
            <BackIcon className="h-6 w-6" />
          </button>
        )}
        <h2
          ref={stepHeadingRef}
          tabIndex={-1}
          className="flex-1 text-lg font-bold text-dark-100 outline-none"
        >
          {stepTitle}
        </h2>
        {step === 'add' && appConfig.subscriptionUrl && onOpenQR && (
          <button
            onClick={() => onOpenQR()}
            aria-label={t('subscription.connection.openQr', 'Open QR code')}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-dark-700 bg-dark-800 text-dark-200 transition-colors hover:border-dark-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75H16.5v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h3v3h-3v-3z"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="grid grid-cols-4 gap-2" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className={`h-1 rounded-full transition-colors duration-300 ${index <= stepIndex ? 'bg-accent-500' : 'bg-dark-700'}`}
          />
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          data-connection-step={step}
          initial={reducedMotion ? false : { opacity: 0, x: 18 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, x: -12 }}
          transition={transition}
        >
          {step === 'platform' && currentPlatformKey && (
            <PlatformStep
              appConfig={appConfig}
              availablePlatforms={availablePlatforms}
              currentPlatformKey={currentPlatformKey}
              activePlatformName={activePlatformName}
              activePlatformIcon={activePlatformIcon}
              isAutoDetected={currentPlatformKey === detectedPlatform}
              getPlatformDisplayName={getPlatformDisplayName}
              getSvgHtml={getSvgHtml}
              onSelect={selectPlatform}
              onContinue={() => setFlowStep('application', currentPlatformKey)}
            />
          )}

          {step === 'application' && selectedApp && (
            <ApplicationStep
              selectedApp={selectedApp}
              availableApps={currentPlatformApps}
              installBlocks={installBlocks}
              showOtherApps={showOtherApps}
              onToggleOtherApps={() => setShowOtherApps((visible) => !visible)}
              onSelectApp={(app) => {
                setSelectedApp(app);
                setShowOtherApps(false);
                setFlowStep('application', currentPlatformKey, app.name, true);
                requestAnimationFrame(() => stepHeadingRef.current?.focus({ preventScroll: true }));
              }}
              onContinue={() => setFlowStep('add', currentPlatformKey, selectedApp.name)}
              getSvgHtml={getSvgHtml}
              renderBlocks={(blocks) =>
                renderConfiguredBlocks(blocks, {
                  section: 'install',
                  onExternalOpen: () => setFlowStep('add', currentPlatformKey, selectedApp.name),
                })
              }
            />
          )}

          {step === 'add' && selectedApp && (
            <div className="space-y-4">
              {renderBlocks.length === 0 && (
                <p className="text-sm text-dark-400">
                  {t('subscription.connection.addDescription', {
                    defaultValue: 'Open {{app}} and add your subscription.',
                    app: selectedApp.name,
                  })}
                </p>
              )}
              {appConfig.baseSettings?.isShowTutorialButton &&
                appConfig.baseSettings.tutorialUrl && (
                  <a
                    href={appConfig.baseSettings.tutorialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary w-full justify-center"
                  >
                    <BookOpenIcon className="h-5 w-5" />
                    {getBaseTranslation('tutorial', 'subscription.connection.tutorial')}
                  </a>
                )}
              {renderConfiguredBlocks(renderBlocks, {
                section: 'add',
                onSubscriptionOpen: () =>
                  setFlowStep('success', currentPlatformKey, selectedApp.name),
              })}
              <button
                type="button"
                className="btn-secondary w-full justify-center"
                onClick={() => setFlowStep('success', currentPlatformKey, selectedApp.name)}
              >
                {t('subscription.connection.subscriptionAdded', 'Subscription added')}
              </button>
            </div>
          )}

          {step === 'success' && selectedApp && (
            <div className="flex min-h-48 flex-col items-center justify-center text-center sm:min-h-64">
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, scale: 0.72 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={transition}
                className="flex h-16 w-16 items-center justify-center rounded-full border border-success-400/40 bg-success-400/10 text-success-400 sm:h-20 sm:w-20"
              >
                <CheckIcon className="h-8 w-8 sm:h-10 sm:w-10" />
              </motion.div>
              {completionBlocks.length === 0 && (
                <p className="mt-4 max-w-sm text-sm leading-relaxed text-dark-400">
                  {t('subscription.connection.successDescription', {
                    defaultValue: '{{app}} is ready to use.',
                    app: selectedApp.name,
                  })}
                </p>
              )}
              {completionBlocks.length > 0 && (
                <div className="mt-4 w-full text-start">
                  {renderConfiguredBlocks(completionBlocks)}
                </div>
              )}
              <button
                type="button"
                className="btn-primary mt-5 w-full justify-center sm:mt-7 sm:w-auto sm:px-10"
                onClick={onFinish}
              >
                {t('subscription.connection.finish', 'Finish')}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
