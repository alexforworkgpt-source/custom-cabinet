import { useEffect, useRef, useCallback } from 'react';
import { BrowserRouter, useLocation, useNavigate, useNavigationType } from 'react-router';
import {
  showBackButton,
  hideBackButton,
  onBackButtonClick,
  offBackButtonClick,
  retrieveLaunchParams,
} from '@telegram-apps/sdk-react';
import Twemoji from 'react-twemoji';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PlatformProvider } from './platform/PlatformProvider';
import { ThemeColorsProvider } from './providers/ThemeColorsProvider';
import { WebSocketProvider } from './providers/WebSocketProvider';
import { ToastProvider } from './components/Toast';
import { TooltipProvider } from './components/primitives/Tooltip';
import { isInTelegramWebApp, closeTelegramApp } from './hooks/useTelegramSDK';
import { getFallbackParentPath } from './utils/navigation';
import { useBlockingStore } from './store/blocking';
import { getDirectCabinetBackPath, getUserCabinetRouteState } from './utils/userCabinetRouteState';

const TWEMOJI_OPTIONS = { className: 'twemoji', folder: 'svg', ext: '.svg' } as const;

/**
 * Manages Telegram BackButton visibility based on navigation location.
 * Shows back button on non-root routes, hides on root.
 */
/** Pages reachable from bottom nav — treat as top-level (no back button). */
const BOTTOM_NAV_PATHS = ['/', '/subscription/purchase', '/support', '/profile'];

function TelegramBackButton() {
  const location = useLocation();
  const navigate = useNavigate();
  const navType = useNavigationType();
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;
  const pathnameRef = useRef(location.pathname);
  pathnameRef.current = location.pathname;
  const searchRef = useRef(location.search);
  searchRef.current = location.search;

  // A full-screen blocking overlay (maintenance / channel-sub / blacklist /
  // account-deleted / backend-unavailable) takes over the native back button:
  // there is nowhere to navigate, so it becomes a single, stable EXIT control.
  const blockingType = useBlockingStore((state) => state.blockingType);
  const blockingTypeRef = useRef(blockingType);
  blockingTypeRef.current = blockingType;

  // Reliable in-app navigation depth (the app's entry point is 0). Driven by
  // React Router's navigation TYPE — NOT window.history.state.idx, which the
  // app's own redirects mutate unpredictably and which is the root flake behind
  // issue #436 (the back button shows/acts on the wrong state). PUSH goes
  // deeper, POP unwinds, REPLACE (e.g. the Subscriptions.tsx auto-redirect) is
  // flat. De-duped by location.key so StrictMode's double-effect can't miscount.
  const depthRef = useRef(0);
  const lastKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (lastKeyRef.current === location.key) return;
    lastKeyRef.current = location.key;
    if (navType === 'PUSH') depthRef.current += 1;
    else if (navType === 'POP') depthRef.current = Math.max(0, depthRef.current - 1);
    // REPLACE: depth unchanged (replaces the current entry, adds no history)
  }, [location.key, navType]);

  useEffect(() => {
    // On a blocking overlay, keep exactly one visible Back button (its click
    // exits the app — see handler). Skip the route logic so it can't flip
    // between Back and Close as the hidden route changes underneath.
    if (blockingType) {
      try {
        showBackButton();
      } catch {}
      return;
    }
    const hasOverlay =
      getUserCabinetRouteState(location.pathname, location.search).overlay !== null;
    const isSubscriptionSpecificTariffFlow =
      location.pathname === '/subscription/purchase' &&
      new URLSearchParams(location.search).has('subscriptionId');
    const isTopLevel =
      !hasOverlay &&
      !isSubscriptionSpecificTariffFlow &&
      (location.pathname === '' || BOTTOM_NAV_PATHS.includes(location.pathname));
    try {
      if (isTopLevel) {
        hideBackButton();
      } else {
        showBackButton();
      }
    } catch {}
  }, [location, blockingType]);

  // Stable handler — ref prevents re-subscription on every render
  const handler = useCallback(() => {
    // A blocking overlay is a hard block with nowhere to navigate — the back
    // button's only job is to EXIT the Mini App (no SPA navigation, so it can't
    // flip-flop between Back and Close).
    if (blockingTypeRef.current) {
      closeTelegramApp();
      return;
    }
    // Real in-app history (depth > 0): a normal back. Otherwise we were opened
    // directly on this route via a deep-link — navigate(-1) is a no-op, so fall
    // back to a sensible parent route instead.
    if (depthRef.current > 0) {
      navigateRef.current(-1);
      return;
    }
    const directBackPath = getDirectCabinetBackPath(pathnameRef.current, searchRef.current);
    if (directBackPath) {
      navigateRef.current(directBackPath, { replace: true });
      return;
    }
    const fallback = getFallbackParentPath(pathnameRef.current);
    navigateRef.current(fallback, { replace: true });
  }, []);

  useEffect(() => {
    try {
      onBackButtonClick(handler);
    } catch {}
    return () => {
      try {
        offBackButtonClick(handler);
      } catch {}
    };
  }, [handler]);

  return null;
}

/** Supported startapp params → in-app destinations. */
const START_PARAM_ROUTES: Array<{ re: RegExp; to: (match: RegExpExecArray) => string }> = [
  // Admin ticket notification buttons in group chats (bot issue #2988).
  { re: /^admin_ticket_(\d+)$/, to: (match) => `/admin/tickets/${match[1]}` },
  // «Продлить» links for expired subscriptions in the bot's rich main menu.
  { re: /^renew_(\d+)$/, to: (match) => `/subscriptions/${match[1]}/renew` },
  { re: /^subscriptions$/, to: () => '/subscriptions' },
  // Paid-trial «Активировать триал» link in the bot's rich main menu — the
  // dashboard renders TrialOfferCard with the pay-and-activate flow.
  { re: /^trial$/, to: () => '/' },
];

/**
 * Routes a Telegram Mini App start param to an in-app destination on launch.
 *
 * Text links and buttons outside private-chat web_app buttons can only enter the
 * Mini App via `t.me/<bot>/<app>?startapp=<param>` deep links: admin ticket
 * notifications in GROUP/channel chats (bot issue #2988) and the bot's rich
 * main-menu «Продлить» links for expired subscriptions. Telegram delivers the
 * param as `tgWebAppStartParam`; we map it to a route once on mount. Access is
 * still gated by each route's own guards (e.g. `PermissionRoute`).
 */
function StartParamNavigator() {
  const navigate = useNavigate();
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    let startParam: string | undefined;
    try {
      startParam = retrieveLaunchParams().tgWebAppStartParam;
    } catch {
      return;
    }
    if (!startParam) return;

    for (const { re, to } of START_PARAM_ROUTES) {
      const match = re.exec(startParam);
      if (match) {
        navigate(to(match), { replace: true });
        return;
      }
    }
  }, [navigate]);

  return null;
}

export function AppWithNavigator() {
  const isTelegram = isInTelegramWebApp();

  return (
    <BrowserRouter>
      {isTelegram && <TelegramBackButton />}
      {isTelegram && <StartParamNavigator />}
      <ErrorBoundary level="page">
        <PlatformProvider>
          <ThemeColorsProvider>
            <TooltipProvider>
              <ToastProvider>
                <WebSocketProvider>
                  <Twemoji options={TWEMOJI_OPTIONS}>
                    <App />
                  </Twemoji>
                </WebSocketProvider>
              </ToastProvider>
            </TooltipProvider>
          </ThemeColorsProvider>
        </PlatformProvider>
      </ErrorBoundary>
    </BrowserRouter>
  );
}
