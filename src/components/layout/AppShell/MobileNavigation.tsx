import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useLocation } from 'react-router';

type PageNavigationMode = 'catalogue' | 'section' | 'action';
interface MobileNavigationState {
  page: { key: string; mode: PageNavigationMode } | null;
  publish: (locationKey: string, mode: PageNavigationMode | null) => void;
}

const MobileNavigationContext = createContext<MobileNavigationState | null>(null);

/** Presentation only: each route owns its phase; the shell owns its panel. */
export function MobileNavigationProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<MobileNavigationState['page']>(null);
  const publish = useCallback((key: string, mode: PageNavigationMode | null) => {
    setPage((current) =>
      mode === null
        ? current?.key === key
          ? null
          : current
        : current?.key === key && current.mode === mode
          ? current
          : { key, mode },
    );
  }, []);
  const value = useMemo(() => ({ page, publish }), [page, publish]);
  return (
    <MobileNavigationContext.Provider value={value}>{children}</MobileNavigationContext.Provider>
  );
}

/** Update before paint and scope cleanup to this history entry, including StrictMode. */
export function usePageMobileNavigation(mode: PageNavigationMode) {
  const { key } = useLocation();
  const publish = useContext(MobileNavigationContext)?.publish;
  useLayoutEffect(() => {
    if (!publish) return;
    publish(key, mode);
    return () => publish(key, null);
  }, [key, mode, publish]);
}

export function usePageMobileNavigationMode(): PageNavigationMode | null {
  const { key } = useLocation();
  const page = useContext(MobileNavigationContext)?.page;
  return page?.key === key ? page.mode : null;
}
