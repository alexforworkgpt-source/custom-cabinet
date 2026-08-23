import { retrieveRawInitData } from '@telegram-apps/sdk-react';

/**
 * Reads current Telegram init data from both available client sources.
 *
 * The SDK may reuse launch parameters cached for an older WebView launch, while
 * the official Telegram bridge exposes its own page-load snapshot. Selecting by
 * auth_date avoids silently sending the stale copy to the backend.
 */
export function getTelegramInitData(): string | null {
  if (typeof window === 'undefined') return null;

  const candidates = [fromTelegramBridge(), fromSdk()].filter((value): value is string =>
    Boolean(value),
  );
  if (candidates.length === 0) return null;

  // The bridge wins equal or unparseable timestamps because it is closer to
  // Telegram's current page-load source than the SDK launch-parameter cache.
  return candidates.reduce((best, candidate) =>
    authDateOf(candidate) > authDateOf(best) ? candidate : best,
  );
}

function fromTelegramBridge(): string | null {
  try {
    const value = window.Telegram?.WebApp?.initData;
    return typeof value === 'string' && value ? value : null;
  } catch {
    return null;
  }
}

function fromSdk(): string | null {
  try {
    const value = retrieveRawInitData();
    return typeof value === 'string' && value ? value : null;
  } catch {
    return null;
  }
}

function authDateOf(initData: string): number {
  try {
    const raw = new URLSearchParams(initData).get('auth_date');
    const parsed = Number(raw);
    return raw && Number.isFinite(parsed) ? parsed : 0;
  } catch {
    return 0;
  }
}
