// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ClassicPurchaseWizard } from '@/components/subscription/purchase/ClassicPurchaseWizard';
import type { ClassicPurchaseOptions, PurchasePreview } from '@/types';

const api = vi.hoisted(() => ({ previewPurchase: vi.fn(), submitPurchase: vi.fn() }));
const promo = vi.hoisted(() => ({ percent: 90 }));
vi.mock('@/api/subscription', () => ({ subscriptionApi: api }));
vi.mock('@/store/successNotification', () => ({ useCloseOnSuccessNotification: () => {} }));
vi.mock('@/hooks/useCurrency', () => ({
  useCurrency: () => ({
    formatAmount: (value: number, decimals = 2) => value.toFixed(decimals),
    currencySymbol: '₽',
  }),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, args?: Record<string, unknown>) => {
      if (key === 'subscription.nextWithPrice') return `Далее · ${args?.amount}`;
      if (key === 'subscription.total') return 'Итого';
      if (key === 'subscription.classicFundingNotice') return `Нехватка ${args?.amount}`;
      return key;
    },
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));
vi.mock('@/hooks/usePromoDiscount', async () => {
  const { calculatePromoDiscount } = await import('@/utils/promoDiscount');
  return {
    usePromoDiscount: () => {
      const activeDiscount = {
        is_active: true,
        discount_percent: promo.percent,
        source: 'offer',
        expires_at: null,
      };
      return {
        activeDiscount,
        applyPromoDiscount: (price: number, original?: number) =>
          calculatePromoDiscount(price, original, activeDiscount),
      };
    },
  };
});

function fixture(days: number, original: number, total: number, includeSecondPeriod = false) {
  const period: ClassicPurchaseOptions['periods'][number] = {
    id: `days:${days}`,
    period_days: days,
    months: days / 30,
    label: days === 30 ? '1 месяц' : `${days} дней`,
    price_kopeks: original,
    price_label: `${original / 100} ₽`,
    per_month_price_kopeks: original,
    per_month_price_label: `${original / 100} ₽`,
    is_available: true,
    traffic: { selectable: false, mode: 'fixed', options: [], current: 0 },
    servers: { options: [], min: 0, max: 0, default: [], selected: [] },
    devices: {
      min: 1,
      max: 1,
      default: 1,
      current: 1,
      price_per_device_kopeks: 0,
      price_per_device_label: '0 ₽',
    },
  };
  const options: ClassicPurchaseOptions = {
    sales_mode: 'classic',
    currency: 'RUB',
    balance_kopeks: 0,
    balance_label: '0 ₽',
    subscription_id: null,
    periods: includeSecondPeriod
      ? [period, { ...period, id: 'days:60', period_days: 60, months: 2, label: '2 месяца' }]
      : [period],
    traffic: period.traffic,
    servers: period.servers,
    devices: period.devices,
    selection: {
      period_id: period.id,
      period_days: days,
      traffic_value: 0,
      servers: [],
      devices: 1,
    },
  };
  const preview: PurchasePreview = {
    total_price_kopeks: total,
    total_price_label: `${(total / 100).toFixed(2)} ₽`,
    original_price_kopeks: original,
    discount_percent: 90,
    per_month_price_kopeks: total,
    per_month_price_label: `${total / 100} ₽`,
    breakdown: [{ label: 'Период', value: `${original / 100} ₽` }],
    balance_kopeks: 0,
    balance_label: '0 ₽',
    missing_amount_kopeks: total,
    can_purchase: false,
  };
  api.previewPurchase.mockResolvedValue(preview);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <ClassicPurchaseWizard
          classicOptions={options}
          subscription={null}
          subscriptionId={undefined}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return { client, preview };
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('Classic final server preview', () => {
  it('shows the monthly price of a long period after the discount', async () => {
    promo.percent = 20;
    const { client } = fixture(90, 30_000, 24_000);
    const period = screen.getByRole('button', { name: /90 дней/ });
    expect(period.textContent).toContain('80.00 ₽/subscription.month');
    await screen.findByRole('button', { name: 'Далее · 240.00 ₽' });
    expect(api.submitPurchase).not.toHaveBeenCalled();
    client.clear();
  });

  it.each([
    [14, 5_000, 4_000, null],
    [30, 9_999, 8_000, null],
    [45, 9_999, 8_000, '53.33 ₽/subscription.month'],
    [90, 30_000, 24_000, '80.00 ₽/subscription.month'],
  ])('uses the renewal monthly-rate rule for %s days', async (days, original, total, monthly) => {
    promo.percent = 20;
    const { client } = fixture(days, original, total);
    const period = screen.getByRole('button', {
      name: days === 30 ? /1 месяц/ : new RegExp(`${days} дней`),
    });
    if (monthly) expect(period.textContent).toContain(monthly);
    else expect(period.textContent).not.toContain('/subscription.month');
    await screen.findByRole('button', { name: `Далее · ${(total / 100).toFixed(2)} ₽` });
    client.clear();
  });

  it.each([
    [14, 5000, 500, 90],
    [30, 9900, 990, 90],
    [30, 9900, 9900, 0],
    [30, 9900, 7920, 0],
    [30, 9900, 792, 90],
    [30, 9900, 0, 100],
  ])(
    'shows the final price for %s days: %s → %s kopeks',
    async (days, original, total, percent) => {
      promo.percent = percent;
      const { client } = fixture(days, original, total);
      const amount = total === 0 ? 'subscription.free' : `${(total / 100).toFixed(2)} ₽`;
      const next = await screen.findByRole('button', { name: `Далее · ${amount}` });
      fireEvent.click(next);
      await waitFor(() =>
        expect(screen.getByText('Итого').parentElement?.textContent).toContain(amount),
      );
      if (total > 0)
        expect(document.body.textContent).toContain(`Нехватка ${(total / 100).toFixed(2)} ₽`);
      expect(api.submitPurchase).not.toHaveBeenCalled();
      client.clear();
    },
  );
  it('matches Bot floor-discount arithmetic in the options caller', async () => {
    promo.percent = 15;
    const { client } = fixture(30, 9999, 8500);
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /1 месяц/ }).textContent).toContain('85.00 ₽'),
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Далее · 85.00 ₽' }));
    expect(screen.getByText('Итого').parentElement?.textContent).toContain('85.00 ₽');
    client.clear();
  });

  it('blocks submission during preview refresh and exposes retry on failure', async () => {
    promo.percent = 90;
    const { client } = fixture(30, 9900, 990);
    fireEvent.click(await screen.findByRole('button', { name: 'Далее · 9.90 ₽' }));
    let reject!: (error: Error) => void;
    api.previewPurchase.mockImplementation(
      () =>
        new Promise((_resolve, fail) => {
          reject = fail;
        }),
    );
    void client.invalidateQueries({ queryKey: ['purchase-preview'] });
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'dashboard.topUpBalance' }).hasAttribute('disabled'),
      ).toBe(true),
    );
    reject(new Error('Preview unavailable'));
    expect(await screen.findByText('subscription.previewLoadError')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: 'dashboard.topUpBalance' }).hasAttribute('disabled'),
    ).toBe(true);
    api.previewPurchase.mockResolvedValue({ ...fixturePreview(), total_price_kopeks: 8500 });
    fireEvent.click(screen.getByRole('button', { name: 'common.retry' }));
    await waitFor(() =>
      expect(screen.getByText('Итого').parentElement?.textContent).toContain('85.00 ₽'),
    );
    expect(api.submitPurchase).not.toHaveBeenCalled();
    client.clear();
  });

  it('uses the fresh preview when the selected period changes', async () => {
    promo.percent = 90;
    const { client } = fixture(30, 9900, 990, true);
    await screen.findByRole('button', { name: 'Далее · 9.90 ₽' });
    let finish!: (value: PurchasePreview) => void;
    api.previewPurchase.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    fireEvent.click(screen.getByRole('button', { name: /2 месяца/ }));
    expect(screen.queryByRole('button', { name: 'Далее · 9.90 ₽' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'common.next' }));
    expect(screen.getByRole('button', { name: 'subscription.pay' }).hasAttribute('disabled')).toBe(
      true,
    );
    await waitFor(() =>
      expect(api.previewPurchase).toHaveBeenLastCalledWith(
        expect.objectContaining({ period_days: 60 }),
        undefined,
      ),
    );
    finish({ ...fixturePreview(), total_price_kopeks: 1980, missing_amount_kopeks: 1980 });
    await waitFor(() =>
      expect(screen.getByText('Итого').parentElement?.textContent).toContain('19.80 ₽'),
    );
    expect(api.submitPurchase).not.toHaveBeenCalled();
    client.clear();
  });
});

function fixturePreview(): PurchasePreview {
  return {
    total_price_kopeks: 990,
    total_price_label: '9.90 ₽',
    per_month_price_kopeks: 990,
    per_month_price_label: '9.90 ₽',
    breakdown: [],
    balance_kopeks: 0,
    balance_label: '0 ₽',
    missing_amount_kopeks: 990,
    can_purchase: false,
  };
}
