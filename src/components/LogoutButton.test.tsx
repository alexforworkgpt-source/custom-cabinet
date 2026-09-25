// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const state = { telegram: false };

vi.mock('@/platform/hooks/usePlatform', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/platform/hooks/usePlatform')>();
  return { ...original, useIsTelegram: () => state.telegram };
});

vi.mock('@/platform', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/platform')>();
  return {
    ...original,
    usePlatform: () => ({ haptic: { impact: vi.fn() } }),
  };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ru', changeLanguage: () => Promise.resolve() },
  }),
  Trans: ({ children }: { children?: unknown }) => children ?? null,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

afterEach(() => {
  cleanup();
  state.telegram = false;
});

async function renderButton(variant: 'menu' | 'icon' | 'profile', onLogout = () => {}) {
  const { LogoutButton } = await import('./LogoutButton');
  return render(<LogoutButton variant={variant} onLogout={onLogout} />);
}

describe('кнопка выхода', () => {
  it('в браузере доступна во всех трёх местах и зовёт выход', async () => {
    const calls: number[] = [];
    await renderButton('menu', () => calls.push(1));
    screen.getByText('nav.logout').click();
    expect(calls).toHaveLength(1);

    cleanup();
    await renderButton('icon');
    expect(screen.getByTitle('nav.logout')).toBeTruthy();

    cleanup();
    await renderButton('profile');
    expect(screen.getByText('nav.logout')).toBeTruthy();
  });

  it('в Telegram не рисуется ни в одном месте', async () => {
    state.telegram = true;

    for (const variant of ['menu', 'icon', 'profile'] as const) {
      const view = await renderButton(variant);
      expect(view.container.innerHTML).toBe('');
      cleanup();
    }
  });
});
