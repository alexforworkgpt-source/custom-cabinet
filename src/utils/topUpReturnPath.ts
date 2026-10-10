import { getSafeRedirectPath } from './safeRedirect';
import { getCabinetClosePath, getUserCabinetRouteState } from './userCabinetRouteState';

export function getTopUpReturnPath(returnTo: string | null | undefined): string {
  const safe = getSafeRedirectPath(returnTo);
  if (safe === '/' && returnTo !== '/') return '/balance';
  const decoded = decodeURIComponent(safe);
  if (decoded.includes('\\')) return '/balance';
  const pathname = new URL(decoded, 'https://cabinet.invalid').pathname;
  // A return destination must leave the top-up steps, rather than reopen them.
  return pathname === '/balance/top-up' || pathname.startsWith('/balance/top-up/')
    ? '/balance'
    : safe;
}

/** Closing a created payment ends the task; successful top-up still uses returnTo. */
export function getReadyTopUpClosePath(
  returnTo: string | null | undefined,
  availableSubscriptionIds?: readonly number[],
): string {
  const safe = getTopUpReturnPath(returnTo);
  const url = new URL(decodeURIComponent(safe), 'https://cabinet.invalid');
  const subscription = /^\/subscriptions\/([^/]+)(?:\/renew)?\/?$/.exec(url.pathname);
  const isPurchase = url.pathname === '/subscription/purchase';
  const legacySubscription = isPurchase ? null : /^\/subscription\/([^/]+)\/?$/.exec(url.pathname);
  const closeSubscription = (id?: number) =>
    getCabinetClosePath(
      id && (!availableSubscriptionIds || availableSubscriptionIds.includes(id)) ? id : undefined,
    );
  if (subscription || legacySubscription || isPurchase) {
    const id =
      subscription?.[1] ?? legacySubscription?.[1] ?? url.searchParams.get('subscriptionId');
    const parsed = id && /^\d+$/.test(id) ? Number(id) : undefined;
    return closeSubscription(
      parsed && Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined,
    );
  }
  const route = getUserCabinetRouteState(url.pathname, url.search);
  return route.overlay ? closeSubscription(route.subscriptionId) : safe;
}
