// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { ToastProvider } from '@/components/Toast';
import ruLocale from '@/locales/ru.json';
import { PlatformProvider } from '@/platform/PlatformProvider';

const linkedProviders = [
  {
    provider: 'google',
    linked: true,
    identifier: 'user@gmail.com',
    forgets_email: 'user@gmail.com',
  },
  { provider: 'yandex', linked: true, identifier: 'user@yandex.ru' },
];

function resolveRu(key: string): string | undefined {
  const value = key
    .split('.')
    .reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], ruLocale);
  return typeof value === 'string' ? value : undefined;
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const template = resolveRu(key) ?? key;
      return template.replace(/{{(\w+)}}/g, (_match, name) => String(options?.[name] ?? ''));
    },
  }),
}));

vi.mock('@/api/auth', () => ({
  authApi: {
    getLinkedProviders: () => Promise.resolve({ providers: linkedProviders }),
    unlinkProvider: () => Promise.resolve(),
  },
}));

vi.mock('@/api/branding', () => ({
  brandingApi: {
    getEmailAuthEnabled: () => Promise.resolve({ enabled: true, verification_enabled: true }),
  },
}));

vi.mock('@/platform/hooks/usePlatform', () => ({
  useIsTelegram: () => false,
  usePlatform: () => ({ openLink: vi.fn(), haptic: { impact: vi.fn() } }),
}));

vi.mock('@/store/auth', () => ({
  useAuthStore: (selector: (state: unknown) => unknown) =>
    selector({ user: null, setUser: vi.fn() }),
}));

afterEach(cleanup);

it('warns which provider email will be forgotten before unlinking', async () => {
  const ConnectedAccounts = (await import('./ConnectedAccounts')).default;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={client}>
      <PlatformProvider>
        <ToastProvider>
          <MemoryRouter>
            <ConnectedAccounts />
          </MemoryRouter>
        </ToastProvider>
      </PlatformProvider>
    </QueryClientProvider>,
  );

  const unlinkButtons = await screen.findAllByRole('button', { name: 'Отвязать' });
  fireEvent.click(unlinkButtons[0]);

  expect(
    screen.getByText(
      'Вместе с ним будет забыт email user@gmail.com: он получен от этого сервиса, а пароль для входа по почте не задан.',
    ),
  ).toBeTruthy();
});
