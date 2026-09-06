// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';

const locale = vi.hoisted(() => {
  let release: () => void = () => {};
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { pending, release, requested: false };
});

vi.mock('./locales/ru.json', async () => {
  locale.requested = true;
  await locale.pending;
  return { default: { auth: { login: 'Войти' } } };
});
vi.mock('./hooks/useTelegramSDK', () => ({ getTelegramLanguageCode: () => null }));

afterEach(() => vi.unstubAllGlobals());

it('waits for the actual startup dictionary before exposing translated login text', async () => {
  localStorage.setItem('cabinet_language', 'ru');
  const module = await import('./i18n');
  const ready = (module as unknown as { i18nReady: Promise<void> }).i18nReady;
  expect(ready).toBeInstanceOf(Promise);
  let finished = false;
  void ready.then(() => {
    finished = true;
  });
  await Promise.resolve();
  expect(finished).toBe(false);
  locale.release();
  await ready;
  expect(locale.requested).toBe(true);
  expect(module.default.t('auth.login')).toBe('Войти');
});
