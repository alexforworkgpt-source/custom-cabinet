import { useTelegramSDK } from '@/hooks/useTelegramSDK';
import { UI } from '@/config/constants';

interface Insets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

export interface TelegramSafeAreaInput {
  isMobileFullscreen: boolean;
  platform: string | undefined;
  safeAreaInset: Insets;
  contentSafeAreaInset: Insets;
}

export function telegramSafeAreas(input: TelegramSafeAreaInput): { top: number; bottom: number } {
  if (!input.isMobileFullscreen) return { top: 0, bottom: 0 };
  const telegramHeaderHeight =
    input.platform === 'android' ? UI.TELEGRAM_HEADER_ANDROID_PX : UI.TELEGRAM_HEADER_IOS_PX;
  return {
    top: Math.max(input.safeAreaInset.top, input.contentSafeAreaInset.top) + telegramHeaderHeight,
    bottom: Math.max(input.safeAreaInset.bottom, input.contentSafeAreaInset.bottom),
  };
}

/**
 * Computes the app header height in pixels, accounting for
 * Telegram MiniApp safe area insets in fullscreen mode.
 *
 * Desktop: 56px (h-14). Mobile: 64px (h-16) + safe area + TG header when fullscreen.
 * bottomSafeArea: TG SDK bottom inset (home indicator etc.), 0 outside TG.
 */
/**
 * Высота мобильной шапки как CSS-длина. Вне fullscreen Telegram добавляет
 * env(safe-area-inset-top): в standalone-режиме iOS («На экран Домой», статус-бар
 * black-translucent) страница начинается под статус-баром, и шапка продолжается
 * под него через padding-top — распорка контента и оверлей меню должны это
 * учитывать.
 */
export function headerHeightCss(mobilePx: number, isMobileFullscreen: boolean): string {
  return isMobileFullscreen
    ? `${mobilePx}px`
    : `calc(${mobilePx}px + env(safe-area-inset-top, 0px))`;
}

export function useHeaderHeight(): {
  mobile: number;
  mobileCss: string;
  desktop: number;
  topSafeArea: number;
  bottomSafeArea: number;
  isMobileFullscreen: boolean;
} {
  const { isFullscreen, safeAreaInset, contentSafeAreaInset, platform, isMobile } =
    useTelegramSDK();
  const isMobileFullscreen = isFullscreen && isMobile;
  const safe = telegramSafeAreas({
    isMobileFullscreen,
    platform,
    safeAreaInset,
    contentSafeAreaInset,
  });
  const mobile = UI.MOBILE_HEADER_HEIGHT_PX + safe.top;

  return {
    mobile,
    mobileCss: headerHeightCss(mobile, isMobileFullscreen),
    desktop: UI.DESKTOP_HEADER_HEIGHT_PX,
    topSafeArea: safe.top,
    bottomSafeArea: safe.bottom,
    isMobileFullscreen,
  };
}
