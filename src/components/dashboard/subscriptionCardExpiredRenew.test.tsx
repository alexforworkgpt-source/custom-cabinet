// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlatformProvider } from '@/platform/PlatformProvider';
import type { Subscription } from '@/types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ru', changeLanguage: () => Promise.resolve() },
  }),
  Trans: ({ children }: { children?: unknown }) => children ?? null,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('@/api/currency', () => ({
  currencyApi: { getExchangeRates: () => Promise.resolve({ USD: 100, CNY: 14, IRR: 0.0024 }) },
}));

const calls = {
  manage: 0,
  purchaseTariff: [] as unknown[][],
  togglePause: [] as unknown[][],
};

vi.mock('@/api/subscription', () => ({
  subscriptionApi: {
    purchaseTariff: (...args: unknown[]) => {
      calls.purchaseTariff.push(args);
      return Promise.resolve({});
    },
    togglePause: (...args: unknown[]) => {
      calls.togglePause.push(args);
      return Promise.resolve({});
    },
  },
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

const subscription = (overrides: Partial<Subscription> = {}): Subscription => ({
  id: 42,
  status: 'expired',
  is_trial: false,
  start_date: '2026-08-07T00:00:00Z',
  end_date: '2026-09-07T00:00:00Z',
  days_left: 0,
  hours_left: 0,
  minutes_left: 0,
  time_left_display: '',
  traffic_limit_gb: 100,
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
  tariff_id: 7,
  ...overrides,
});

afterEach(() => {
  cleanup();
  calls.manage = 0;
  calls.purchaseTariff = [];
  calls.togglePause = [];
});

async function renderCard(sub: Subscription, balanceKopeks: number) {
  const Card = (await import('./SubscriptionCardExpired')).default;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

  render(
    <QueryClientProvider client={client}>
      <PlatformProvider>
        <MemoryRouter initialEntries={['/']}>
          <Routes>
            <Route
              path="/"
              element={
                <Card
                  subscription={sub}
                  balanceKopeks={balanceKopeks}
                  balanceRubles={balanceKopeks / 100}
                  isTrafficTopupOpen={false}
                  trafficTopupTriggerRef={{ current: null }}
                  onBuyTraffic={() => {}}
                  connectedDevices={0}
                  devicesError={false}
                  onConnectDevice={() => {}}
                  onManageDevices={() => {}}
                  onRetryDevices={() => {}}
                  devicesOpen={false}
                  onManageSubscription={() => {
                    calls.manage += 1;
                  }}
                  managementOpen={false}
                />
              }
            />
            <Route path="/subscriptions/:id/renew" element={<div>period-choice</div>} />
          </Routes>
        </MemoryRouter>
      </PlatformProvider>
    </QueryClientProvider>,
  );
}

describe('expired periodic subscription renewal', () => {
  it('opens period choice without selecting a month or opening management first', async () => {
    await renderCard(subscription(), 500_000);

    fireEvent.click(await screen.findByText('dashboard.expired.quickRenew'));

    expect(await screen.findByText('period-choice')).toBeTruthy();
    expect(calls.manage).toBe(0);
  });

  it('shows period choice before judging whether the balance is enough', async () => {
    await renderCard(subscription(), 0);

    fireEvent.click(await screen.findByText('dashboard.expired.quickRenew'));

    expect(await screen.findByText('period-choice')).toBeTruthy();
  });
});

describe('expired daily subscription renewal', () => {
  it('purchases exactly one day because there is no period choice', async () => {
    await renderCard(subscription({ is_daily: true, daily_price_kopeks: 2_000 }), 500_000);

    fireEvent.click(await screen.findByText('dashboard.expired.quickRenew'));

    await waitFor(() => {
      expect(calls.purchaseTariff).toEqual([[7, 1, undefined, 42]]);
    });
  });

  it('resumes a paused daily subscription instead of opening renewal', async () => {
    await renderCard(
      subscription({ is_daily: true, status: 'disabled', daily_price_kopeks: 2_000 }),
      500_000,
    );

    fireEvent.click(await screen.findByText('dashboard.suspended.resume'));

    await waitFor(() => {
      expect(calls.togglePause).toEqual([[42]]);
    });
  });

  it('offers balance top-up when one daily charge is not affordable', async () => {
    await renderCard(subscription({ is_daily: true, daily_price_kopeks: 2_000 }), 0);

    expect(await screen.findByText('dashboard.expired.topUp')).toBeTruthy();
    expect(screen.queryByText('dashboard.expired.quickRenew')).toBeNull();
  });
});
