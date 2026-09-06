// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest';

vi.mock('./locales/en.json', () => new Promise(() => {}));
vi.mock('./hooks/useTelegramSDK', () => ({ getTelegramLanguageCode: () => 'en' }));

afterEach(() => vi.useRealTimers());

it('lets startup continue when the Telegram language download never responds', async () => {
  localStorage.setItem('cabinet_language', 'ru');
  const module = await import('./i18n');
  await module.i18nReady;
  localStorage.removeItem('cabinet_language');
  vi.useFakeTimers();
  let finished = false;
  void module.applyTelegramLanguage().then(() => {
    finished = true;
  });
  await vi.advanceTimersByTimeAsync(5000);
  expect(finished).toBe(true);
});
