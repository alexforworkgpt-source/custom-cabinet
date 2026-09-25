// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlatformProvider } from '@/platform/PlatformProvider';
import type { Subscription } from '@/types';
import SubscriptionCardExpired from './SubscriptionCardExpired';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ru', changeLanguage: () => Promise.resolve() },
  }),
  Trans: ({ children }: { children?: unknown }) => children ?? null,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('@/api/subscription', () => ({
  subscriptionApi: {
    renewSubscription: () => Promise.resolve({}),
    purchaseTariff: () => Promise.resolve({}),
    togglePause: () => Promise.resolve({}),
  },
}));

vi.mock('@/api/currency', () => ({
  currencyApi: { getExchangeRates: () => Promise.resolve({ USD: 100 }) },
}));

const legacyExpired = (overrides: Partial<Subscription> = {}): Subscription => ({
  id: 42,
  status: 'expired',
  is_trial: false,
  start_date: '2026-08-07T00:00:00Z',
  end_date: '2026-09-07T00:00:00Z',
  days_left: 0,
  hours_left: 0,
  minutes_left: 0,
  time_left_display: '',
  traffic_limit_gb: 0,
  traffic_used_gb: 0,
  traffic_used_percent: 0,
  device_limit: 3,
  connected_squads: [],
  servers: [],
  autopay_enabled: false,
  autopay_days_before: 3,
  subscription_url: null,
  hide_subscription_link: false,
  is_active: false,
  is_expired: true,
  is_limited: false,
  requires_tariff_selection: true,
  ...overrides,
});

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

afterEach(cleanup);

function renderCard(subscription: Subscription) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <PlatformProvider>
        <MemoryRouter>
          <SubscriptionCardExpired
            subscription={subscription}
            balanceKopeks={500_000}
            balanceRubles={5_000}
            isTrafficTopupOpen={false}
            trafficTopupTriggerRef={{ current: null }}
            onBuyTraffic={() => {}}
            connectedDevices={0}
            devicesError={false}
            onConnectDevice={() => {}}
            onManageDevices={() => {}}
            onRetryDevices={() => {}}
            devicesOpen={false}
            onManageSubscription={() => {}}
            managementOpen={false}
          />
        </MemoryRouter>
      </PlatformProvider>
    </QueryClientProvider>,
  );
}

describe('legacy subscription on the Unified Dashboard', () => {
  it('replaces renewal with tariff selection for the same subscription', () => {
    renderCard(legacyExpired());

    const action = screen.getByRole('link', { name: 'subscription.cta.moveToTariff' });
    expect(action.getAttribute('href')).toBe('/subscription/purchase?subscriptionId=42');
    expect(screen.queryByText('dashboard.expired.quickRenew')).toBeNull();
  });

  it('replaces the traffic addon action when the legacy subscription is limited', () => {
    renderCard(legacyExpired({ status: 'limited', is_expired: false, is_limited: true }));

    expect(screen.getByRole('link', { name: 'subscription.cta.moveToTariff' })).toBeTruthy();
    expect(screen.queryByText('subscription.buyTraffic')).toBeNull();
  });
});
