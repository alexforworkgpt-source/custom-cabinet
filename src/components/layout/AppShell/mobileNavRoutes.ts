/**
 * Mobile navigation is a Custom Cabinet product surface. Upstream visibility
 * rules are adapted here without replacing the local four-item information
 * architecture.
 */
export type MobileNavKey = 'dashboard' | 'tariffs' | 'support' | 'profile';

export interface MobileNavItem {
  readonly key: MobileNavKey;
  readonly path: string;
}

const ITEMS: readonly MobileNavItem[] = [
  { key: 'dashboard', path: '/' },
  { key: 'tariffs', path: '/subscription/purchase' },
  { key: 'support', path: '/support' },
  { key: 'profile', path: '/profile' },
];

export function mobileNavItems(): readonly MobileNavItem[] {
  return ITEMS;
}

function withoutTrailingSlash(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

/**
 * Subscription routes are rendered inside the unified Dashboard. A card route
 * is therefore still the screen behind the Dashboard button, while renewal is
 * a separate action screen and must not carry the global panel with it.
 */
const DASHBOARD_SUBSCRIPTION_SCREENS: readonly RegExp[] = [
  /^\/subscriptions$/,
  /^\/subscriptions\/\d+$/,
];

export function isMobileNavScreen(pathname: string, items: readonly MobileNavItem[]): boolean {
  const path = withoutTrailingSlash(pathname);
  if (items.some((item) => item.path === path)) return true;
  return DASHBOARD_SUBSCRIPTION_SCREENS.some((pattern) => pattern.test(path));
}
