// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';

const state = vi.hoisted(() => ({ language: 'ru' }));
const getDocument = vi.hoisted(() =>
  vi.fn(async (language?: string) => ({
    content: `<p>Terms ${language ?? 'default'}</p>`,
    updated_at: null,
  })),
);
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) => fallback ?? key,
    i18n: { language: state.language },
  }),
}));
vi.mock('../api/info', () => ({
  infoApi: {
    getPublicOffer: getDocument,
    getPrivacyPolicy: getDocument,
    getRecurrentPayments: getDocument,
  },
}));
vi.mock('../components/LanguageSwitcher', () => ({ default: () => null }));

import PublicLegal from './PublicLegal';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  state.language = 'ru';
});

it('shows fresh public terms after changing the interface language', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const page = () => (
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <PublicLegal doc="recurrent" />
      </MemoryRouter>
    </QueryClientProvider>
  );
  const view = render(page());
  expect(await screen.findByText('Terms ru')).toBeTruthy();
  state.language = 'en-US';
  view.rerender(page());
  expect(await screen.findByText('Terms en')).toBeTruthy();
  expect(screen.queryByText('Terms ru')).toBeNull();
  expect(screen.getByRole('link', { name: 'Вернуться ко входу' }).getAttribute('href')).toBe(
    '/login',
  );
});
