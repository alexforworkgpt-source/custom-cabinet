// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import type { Tariff } from '@/types';

Element.prototype.scrollIntoView = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ru', changeLanguage: () => Promise.resolve() },
  }),
  Trans: ({ children }: { children?: unknown }) => children ?? null,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('@/hooks/useCurrency', () => ({
  useCurrency: () => ({ formatAmount: (value: number) => String(value), currencySymbol: '₽' }),
}));
vi.mock('@/hooks/usePromoDiscount', () => ({
  usePromoDiscount: () => ({ activeDiscount: undefined }),
}));

const preview = vi.hoisted(() => vi.fn());
vi.mock('@/api/subscription', () => ({
  subscriptionApi: {
    previewTariffSwitch: preview,
    switchTariff: vi.fn(),
  },
}));

const targetTariff = {
  id: 7,
  name: 'Про',
  description: null,
  tier_level: 2,
  traffic_limit_gb: 100,
  traffic_limit_label: '100 ГБ',
  is_unlimited_traffic: false,
  device_limit: 3,
  extra_devices_count: 0,
  servers_count: 0,
  servers: [],
  periods: [],
  is_current: false,
  is_available: true,
} satisfies Tariff;

describe('tariff switch on the last paid day', () => {
  it('shows the authoritative non-zero Bot quote instead of treating the day as free', async () => {
    preview.mockResolvedValueOnce({
      can_switch: true,
      current_tariff_id: 1,
      current_tariff_name: 'Базовый',
      new_tariff_id: 7,
      new_tariff_name: 'Про',
      remaining_days: 1,
      upgrade_cost_kopeks: 1_200,
      upgrade_cost_label: '12 ₽',
      balance_kopeks: 50_000,
      balance_label: '500 ₽',
      has_enough_balance: true,
      missing_amount_kopeks: 0,
      missing_amount_label: '0 ₽',
      is_upgrade: true,
    });
    const { SwitchTariffSheet } = await import('./sheets/SwitchTariffSheet');
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <SwitchTariffSheet
            open
            tariffId={7}
            subscriptionId={42}
            tariffs={[targetTariff]}
            onClose={() => {}}
            onExpiredFallback={() => {}}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(await screen.findByText('12 ₽')).toBeTruthy();
    expect(screen.getByText('1')).toBeTruthy();
    expect(screen.queryByText('subscription.switchTariff.free')).toBeNull();
    expect(preview).toHaveBeenCalledWith(7, 42);
  });
});
