import { getSafeRedirectPath } from './safeRedirect';

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
