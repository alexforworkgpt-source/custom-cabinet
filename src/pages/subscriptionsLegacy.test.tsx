// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlatformProvider } from '@/platform/PlatformProvider';
import type { SubscriptionListItem } from '@/types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ru' },
  }),
}));

const baseSubscription = {
  id: 42,
  status: 'active',
  tariff_id: null,
  tariff_name: null,
  traffic_limit_gb: 0,
  traffic_used_gb: 1,
  device_limit: 3,
  end_date: '2026-10-07T00:00:00Z',
  subscription_url: null,
  subscription_crypto_link: null,
  is_trial: false,
  autopay_enabled: false,
  connected_squads: [],
} as SubscriptionListItem;

const state: { subscription: SubscriptionListItem } = {
  subscription: { ...baseSubscription, requires_tariff_selection: true },
};

vi.mock('@/api/subscription', () => ({
  subscriptionApi: {
    getSubscriptions: () =>
      Promise.resolve({ subscriptions: [state.subscription], multi_tariff_enabled: true }),
    getTrialInfo: () => Promise.resolve({ is_available: false }),
    activateTrial: () => Promise.resolve({}),
  },
}));

vi.mock('@/api/balance', () => ({
  balanceApi: { getBalance: () => Promise.resolve({ balance_kopeks: 0, balance_rubles: 0 }) },
}));

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(() => {
  cleanup();
  state.subscription = { ...baseSubscription, requires_tariff_selection: true };
});

async function renderPage() {
  const Subscriptions = (await import('@/pages/Subscriptions')).default;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <PlatformProvider>
        <MemoryRouter>
          <Subscriptions />
        </MemoryRouter>
      </PlatformProvider>
    </QueryClientProvider>,
  );
}

describe('legacy subscription list actions', () => {
  it('hides purchase-another actions until the legacy subscription gets a tariff', async () => {
    await renderPage();

    expect(await screen.findByRole('link', { name: 'subscription.cta.moveToTariff' })).toBeTruthy();
    expect(screen.queryByText('subscriptions.buyAnother')).toBeNull();
    expect(screen.queryByText('subscriptions.browsePlans')).toBeNull();
  });

  it('keeps purchase-another for an ordinary active subscription', async () => {
    state.subscription = {
      ...baseSubscription,
      tariff_id: 7,
      tariff_name: 'Basic',
      requires_tariff_selection: false,
    };
    await renderPage();

    expect(await screen.findByText('subscriptions.buyAnother')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'subscription.cta.moveToTariff' })).toBeNull();
  });
});
