import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { useAuthStore } from '@/store/auth';
import { installClickTracker, trackScreen } from '@/utils/activityTracker';

export function useScreenViewReporter(): void {
  const { pathname } = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const current = useRef(pathname);
  current.current = pathname;

  useEffect(() => {
    if (isAuthenticated) trackScreen(pathname);
  }, [pathname, isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    return installClickTracker(() => current.current);
  }, [isAuthenticated]);
}
