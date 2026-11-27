import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { sharesDashboardScroll } from '@/utils/userCabinetRouteState';

/**
 * Saves and restores scroll position for admin pages.
 * Disables browser's automatic scroll restoration.
 */
export function useScrollRestoration() {
  const location = useLocation();
  const scrollPositions = useRef<Record<string, number>>({});
  const scrollPath = sharesDashboardScroll(location.pathname) ? '/' : location.pathname;

  // Disable browser's automatic scroll restoration
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    const isAdminPage = scrollPath.startsWith('/admin');
    const savedPosition = isAdminPage ? (scrollPositions.current[scrollPath] ?? 0) : 0;
    window.scrollTo({ top: savedPosition, behavior: 'instant' });

    if (!isAdminPage) return;

    const handleScroll = () => {
      scrollPositions.current[scrollPath] = window.scrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollPath]);
}
