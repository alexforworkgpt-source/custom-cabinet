import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from 'react';

type TransientOverlayBackHandler = () => void;

interface TransientOverlayBackContextValue {
  register: (handler: TransientOverlayBackHandler) => () => void;
  dispatch: () => boolean;
}

const fallbackContext: TransientOverlayBackContextValue = {
  register: () => () => undefined,
  dispatch: () => false,
};

const TransientOverlayBackContext = createContext(fallbackContext);

export function TransientOverlayBackProvider({ children }: { children: ReactNode }) {
  const handlers = useRef<Array<{ id: symbol; handler: TransientOverlayBackHandler }>>([]);

  const register = useCallback((handler: TransientOverlayBackHandler) => {
    const entry = { id: Symbol('transient-overlay-back'), handler };
    handlers.current.push(entry);

    return () => {
      handlers.current = handlers.current.filter((candidate) => candidate.id !== entry.id);
    };
  }, []);

  const dispatch = useCallback(() => {
    const activeHandler = handlers.current[handlers.current.length - 1];
    if (!activeHandler) return false;
    activeHandler.handler();
    return true;
  }, []);

  const value = useMemo(() => ({ register, dispatch }), [dispatch, register]);

  return (
    <TransientOverlayBackContext.Provider value={value}>
      {children}
    </TransientOverlayBackContext.Provider>
  );
}

export function useTransientOverlayBackHandler(
  active: boolean,
  handler: TransientOverlayBackHandler,
) {
  const { register } = useContext(TransientOverlayBackContext);

  useLayoutEffect(() => {
    if (!active) return;
    return register(handler);
  }, [active, handler, register]);
}

export function useTransientOverlayBackDispatcher() {
  return useContext(TransientOverlayBackContext).dispatch;
}
