// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';
import { saveOAuthState } from './oauth';

afterEach(() => vi.unstubAllGlobals());

it('declines OAuth when state cannot survive the external redirect', () => {
  vi.stubGlobal('sessionStorage', {
    setItem() {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    },
  });

  expect(saveOAuthState('csrf-value', 'google')).toBe(false);
});
