// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlatformProvider } from '@/platform/PlatformProvider';
import type { RenewalOption, Tariff } from '@/types';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ru', changeLanguage: () => Promise.resolve() },
  }),
  Trans: ({ children }: { children?: unknown }) => children ?? null,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('@/hooks/useTheme', () => ({ useTheme: () => ({ isDark: true }) }));
vi.mock('@/hooks/useCurrency', () => ({
  useCurrency: () => ({ formatAmount: (value: number) => String(value), currencySymbol: '₽' }),
}));
vi.mock('@/hooks/usePromoDiscount', () => ({
  usePromoDiscount: () => ({
    activeDiscount: undefined,
    applyPromoDiscount: (price: number) => ({ price }),
  }),
}));

const state = { options: [] as RenewalOption[] };

vi.mock('@/api/subscription', () => ({
  subscriptionApi: {
    getRenewalOptions: () => Promise.resolve(state.options),
    getSubscription: () => Promise.resolve({ subscription: { id: 42, tariff_name: 'Базовый' } }),
    getPurchaseOptions: () => Promise.resolve({ balance_kopeks: 1_000_000 }),
    renewSubscription: () => Promise.resolve({}),
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

afterEach(() => {
  cleanup();
  state.options = [];
});

const renewalOption = (overrides: Partial<RenewalOption>): RenewalOption => ({
  period_days: 30,
  price_kopeks: 60_000,
  price_rubles: 600,
  discount_percent: 0,
  original_price_kopeks: null,
  ...overrides,
});

const tariff = (overrides: Partial<Tariff> & { id: number; name: string }): Tariff => ({
  description: null,
  tier_level: 1,
  traffic_limit_gb: 100,
  traffic_limit_label: '100 ГБ',
  is_unlimited_traffic: false,
  device_limit: 1,
  extra_devices_count: 0,
  servers_count: 0,
  servers: [],
  periods: [],
  is_current: false,
  is_available: true,
  ...overrides,
});

function providers(children: React.ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={client}>
      <PlatformProvider>{children}</PlatformProvider>
    </QueryClientProvider>
  );
}

describe('best-value tariff contract', () => {
  it('selects the operator-highlighted purchase period by default', async () => {
    const harness = await import('./purchase/tariffPurchaseHarness');
    harness.render([
      harness.period({ days: 30, label: '1 месяц' }),
      harness.period({ days: 360, label: '12 месяцев', is_highlighted: true }),
    ]);

    expect(harness.cardFor('12 месяцев').className).toContain('bg-accent-500/10');
    expect(harness.cardFor('12 месяцев').className).toContain('border-urgent-400');
    expect(harness.cardFor('1 месяц').className).not.toContain('bg-accent-500/10');
  });

  it('marks the operator-selected renewal period and keeps selection visually dominant', async () => {
    state.options = [
      renewalOption({ period_days: 30 }),
      renewalOption({ period_days: 180, price_kopeks: 270_000, is_highlighted: true }),
    ];
    const RenewSubscription = (await import('@/pages/RenewSubscription')).default;

    render(
      providers(
        <MemoryRouter initialEntries={['/subscriptions/42/renew']}>
          <Routes>
            <Route path="/subscriptions/:subscriptionId/renew" element={<RenewSubscription />} />
          </Routes>
        </MemoryRouter>,
      ),
    );

    const badge = await screen.findByText('subscription.bestValue');
    const highlightedCard = screen.getByText(/^180 /).closest('button');
    expect(highlightedCard?.contains(badge)).toBe(true);
    expect(highlightedCard?.className).toContain('border-2');

    fireEvent.click(highlightedCard as HTMLButtonElement);
    expect(highlightedCard?.className).toContain('border-2');
  });

  it('marks the recommended tariff, but the current tariff remains the stronger state', async () => {
    const { TariffPickerGrid } = await import('./purchase/TariffPickerGrid');
    render(
      providers(
        <MemoryRouter>
          <TariffPickerGrid
            tariffs={[
              tariff({ id: 1, name: 'Базовый' }),
              tariff({ id: 2, name: 'Про', is_highlighted: true }),
            ]}
            subscription={null}
            purchaseOptions={undefined}
            isTariffsMode
            isMultiTariff={false}
            onSelectTariff={() => {}}
            onSwitchTariff={() => {}}
          />
        </MemoryRouter>,
      ),
    );

    const badge = await screen.findByText('subscription.bestValue');
    const recommendedCard = screen.getByText('Про').closest('div.bento-card-hover');
    expect(recommendedCard?.contains(badge)).toBe(true);
    expect(recommendedCard?.className).toContain('border-2');
  });
});
