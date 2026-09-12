import { useCallback, useEffect, useState } from 'react';

/**
 * Deadline-based countdown that stays correct when browsers throttle timers in
 * background tabs.
 */
export function useCountdown(): [seconds: number, start: (from: number) => void] {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [seconds, setSeconds] = useState(0);

  const start = useCallback((from: number) => {
    const safeSeconds = Number.isFinite(from) ? Math.max(0, Math.floor(from)) : 0;
    if (safeSeconds === 0) {
      setDeadline(null);
      setSeconds(0);
      return;
    }

    setSeconds(safeSeconds);
    setDeadline(Date.now() + safeSeconds * 1_000);
  }, []);

  useEffect(() => {
    if (deadline === null) return;

    const tick = () => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1_000));
      setSeconds(remaining);
      if (remaining === 0) setDeadline(null);
    };

    tick();
    const timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [deadline]);

  return [seconds, start];
}
