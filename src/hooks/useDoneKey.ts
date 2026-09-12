import { useEffect } from 'react';
import { usePlatform } from '@/platform';
import { installDoneKey, isTouchOnly } from '@/utils/doneKey';

export function useDoneKey(): void {
  const { hideKeyboard } = usePlatform();
  useEffect(() => {
    const matchMedia =
      typeof window.matchMedia === 'function' ? window.matchMedia.bind(window) : undefined;
    if (!isTouchOnly(matchMedia)) return;
    return installDoneKey({ hideKeyboard });
  }, [hideKeyboard]);
}
