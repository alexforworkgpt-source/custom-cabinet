// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.resetModules();
});

it('keeps authentication state usable when the browser exposes no storage', async () => {
  vi.stubGlobal('localStorage', undefined);
  vi.stubGlobal('sessionStorage', undefined);
  const { useAuthStore } = await import('./auth');

  expect(() => useAuthStore.setState({ isLoading: false })).not.toThrow();
  expect(useAuthStore.getState().isLoading).toBe(false);
  expect(useAuthStore.getState().user).toBeNull();
});
