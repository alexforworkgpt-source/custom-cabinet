// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlatformProvider } from '@/platform/PlatformProvider';
import type { ClassicPurchaseOptions, PurchasePreview, Tariff } from '@/types';
import { ClassicPurchaseWizard } from './ClassicPurchaseWizard';
import { TariffPurchaseForm } from './TariffPurchaseForm';

const api = vi.hoisted(() => ({
  previewPurchase: vi.fn(),
  submitPurchase: vi.fn(),
  purchaseTariff: vi.fn(),
}));

vi.mock('@/api/subscription', () => ({ subscriptionApi: api }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      key === 'subscription.pay'
        ? 'Оплатить'
        : key === 'dashboard.topUpBalance'
          ? 'Пополнить баланс'
          : key,
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));
vi.mock('@/hooks/useCurrency', () => ({
  useCurrency: () => ({ formatAmount: (value: number) => String(value), currencySymbol: '₽' }),
}));
vi.mock('@/hooks/usePromoDiscount', () => ({
  usePromoDiscount: () => ({
    activeDiscount: undefined,
    applyPromoDiscount: (price: number) => ({ price }),
  }),
}));
vi.mock('@/store/successNotification', () => ({ useCloseOnSuccessNotification: () => {} }));

const period: ClassicPurchaseOptions['periods'][number] = {
  id: 'month',
  period_days: 30,
  months: 1,
  label: '1 месяц',
  price_kopeks: 50_000,
  price_label: '500 ₽',
  per_month_price_kopeks: 50_000,
  per_month_price_label: '500 ₽',
  is_available: true,
  traffic: { selectable: false, mode: 'fixed', options: [], current: 100 },
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

const classicOptions: ClassicPurchaseOptions = {
  sales_mode: 'classic',
  currency: 'RUB',
  balance_kopeks: 20_000,
  balance_label: '200 ₽',
  subscription_id: null,
  periods: [period],
  traffic: period.traffic,
  servers: period.servers,
  devices: period.devices,
  selection: {
    period_id: 'month',
    period_days: 30,
    traffic_value: 100,
    servers: [],
    devices: 1,
  },
};

const preview: PurchasePreview = {
  total_price_kopeks: 50_000,
  total_price_label: '500 ₽',
  per_month_price_kopeks: 50_000,
  per_month_price_label: '500 ₽',
  breakdown: [{ label: 'Период', value: '500 ₽' }],
  balance_kopeks: 20_000,
  balance_label: '200 ₽',
  missing_amount_kopeks: 30_000,
  can_purchase: false,
};

function insufficientFunds(detail: Record<string, unknown>) {
  return Object.assign(new AxiosError('Payment required'), {
    response: { status: 402, data: { detail } },
  });
}

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="route">{`${location.pathname}${location.search}`}</div>;
}

function renderClassic() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/subscription/purchase?subscriptionId=42']}>
        <Routes>
          <Route
            path="/subscription/purchase"
            element={
              <>
                <ClassicPurchaseWizard
                  classicOptions={classicOptions}
                  subscription={null}
                  subscriptionId={42}
                />
                <LocationProbe />
              </>
            }
          />
          <Route path="/balance/top-up" element={<LocationProbe />} />
          <Route path="/subscriptions" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const tariff: Tariff = {
  id: 7,
  name: 'Базовый',
  description: null,
  tier_level: 1,
  traffic_limit_gb: 100,
  traffic_limit_label: '100 ГБ',
  is_unlimited_traffic: false,
  device_limit: 1,
  extra_devices_count: 0,
  servers_count: 0,
  servers: [],
  periods: [
    {
      days: 30,
      months: 1,
      label: '30 дней',
      price_kopeks: 50_000,
      price_label: '500 ₽',
      price_per_month_kopeks: 50_000,
      price_per_month_label: '500 ₽',
    },
  ],
  is_current: false,
  is_available: true,
};

function renderTariff(selectedTariff: Tariff = tariff) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <PlatformProvider>
        <MemoryRouter initialEntries={['/subscription/purchase?subscriptionId=42']}>
          <Routes>
            <Route
              path="/subscription/purchase"
              element={
                <>
                  <TariffPurchaseForm
                    tariff={selectedTariff}
                    subscriptionId={42}
                    balanceKopeks={20_000}
                    onBack={() => {}}
                  />
                  <LocationProbe />
                </>
              }
            />
            <Route path="/balance/top-up" element={<LocationProbe />} />
            <Route path="/subscriptions" element={<LocationProbe />} />
          </Routes>
        </MemoryRouter>
      </PlatformProvider>
    </QueryClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('unified payment CTA', () => {
  it.each([
    { balance: 0, missing: 50_000, amount: 500 },
    { balance: 20_000, missing: 30_000, amount: 300 },
  ])(
    'sends the Classic selection before topping up a balance of $balance kopeks',
    async ({ balance, missing, amount }) => {
      api.previewPurchase.mockResolvedValue({
        ...preview,
        balance_kopeks: balance,
        missing_amount_kopeks: missing,
      });
      api.submitPurchase.mockRejectedValue(
        insufficientFunds({
          code: 'insufficient_funds',
          cart_saved: true,
          missing_amount: missing,
        }),
      );
      renderClassic();

      fireEvent.click(screen.getByRole('button', { name: 'common.next' }));
      const topUp = await screen.findByRole('button', { name: 'Пополнить баланс' });
      await waitFor(() => expect(topUp.hasAttribute('disabled')).toBe(false));
      expect(screen.getAllByRole('button', { name: 'Пополнить баланс' })).toHaveLength(1);
      expect(screen.queryByRole('button', { name: 'Оплатить' })).toBeNull();
      expect(screen.queryByRole('button', { name: 'balance.topUp' })).toBeNull();
      fireEvent.click(topUp);

      await waitFor(() => {
        expect(api.submitPurchase).toHaveBeenCalledWith(
          { period_id: 'month', period_days: 30, traffic_value: 100, servers: [], devices: 1 },
          42,
        );
        expect(screen.getByTestId('route').textContent).toBe(
          `/balance/top-up?amount=${amount}&returnTo=%2Fsubscription%2Fpurchase%3FsubscriptionId%3D42`,
        );
      });
    },
  );

  it('opens top-up after the ordinary tariff purchase saves the cart', async () => {
    api.purchaseTariff.mockRejectedValue(
      insufficientFunds({ code: 'insufficient_funds', cart_saved: true, missing_amount: 30_000 }),
    );
    renderTariff();

    const pay = screen.getByRole('button', { name: 'Оплатить' });
    expect(screen.queryByRole('button', { name: 'balance.topUp' })).toBeNull();
    fireEvent.click(pay);

    await waitFor(() => {
      expect(api.purchaseTariff).toHaveBeenCalledWith(7, 30, undefined, 42);
      expect(screen.getByTestId('route').textContent).toBe(
        '/balance/top-up?amount=300&returnTo=%2Fsubscription%2Fpurchase%3FsubscriptionId%3D42',
      );
    });
  });

  it('sends a daily tariff purchase before opening top-up', async () => {
    api.purchaseTariff.mockRejectedValue(
      insufficientFunds({
        code: 'insufficient_funds',
        cart_saved: true,
        cart_mode: 'tariff',
        missing_amount: 4_500,
      }),
    );
    renderTariff({ ...tariff, is_daily: true, daily_price_kopeks: 5_000, periods: [] });

    expect(screen.queryByRole('button', { name: 'balance.topUp' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Оплатить' }));

    await waitFor(() => {
      expect(api.purchaseTariff).toHaveBeenCalledWith(7, 1, undefined, 42);
      expect(screen.getByTestId('route').textContent).toBe(
        '/balance/top-up?amount=45&returnTo=%2Fsubscription%2Fpurchase%3FsubscriptionId%3D42',
      );
    });
  });

  it.each([
    [
      'an unsaved cart',
      insufficientFunds({ code: 'insufficient_funds', cart_saved: false, missing_amount: 30_000 }),
    ],
    [
      'an unknown error code',
      insufficientFunds({ code: 'other_failure', cart_saved: true, missing_amount: 30_000 }),
    ],
    ['a network error', new Error('Network unavailable')],
    [
      'a non-payment HTTP status',
      Object.assign(new AxiosError('Rejected purchase'), {
        response: {
          status: 409,
          data: {
            detail: { code: 'insufficient_funds', cart_saved: true, missing_amount: 30_000 },
          },
        },
      }),
    ],
  ])('keeps Classic on the purchase page after %s', async (_case, error) => {
    api.previewPurchase.mockResolvedValue(preview);
    api.submitPurchase.mockRejectedValue(error);
    renderClassic();
    fireEvent.click(screen.getByRole('button', { name: 'common.next' }));
    const topUp = await screen.findByRole('button', { name: 'Пополнить баланс' });
    await waitFor(() => expect(topUp.hasAttribute('disabled')).toBe(false));
    fireEvent.click(topUp);

    await waitFor(() => {
      expect(api.submitPurchase).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('route').textContent).toBe(
        '/subscription/purchase?subscriptionId=42',
      );
      expect(screen.getByText(error.message)).toBeTruthy();
    });
    expect(screen.queryByRole('button', { name: 'balance.topUp' })).toBeNull();
    expect(screen.queryByText('subscription.classicFundingNotice')).toBeNull();
  });

  it('uses the Classic preview amount when the saved-cart response omits it', async () => {
    api.previewPurchase.mockResolvedValue(preview);
    api.submitPurchase.mockRejectedValue(
      insufficientFunds({ code: 'insufficient_funds', cart_saved: true }),
    );
    renderClassic();
    fireEvent.click(screen.getByRole('button', { name: 'common.next' }));
    const topUp = await screen.findByRole('button', { name: 'Пополнить баланс' });
    await waitFor(() => expect(topUp.hasAttribute('disabled')).toBe(false));
    fireEvent.click(topUp);
    await waitFor(() =>
      expect(screen.getByTestId('route').textContent).toContain('/balance/top-up?amount=300'),
    );
  });

  it('keeps direct Classic purchase and blocks repeat clicks while pending', async () => {
    api.previewPurchase.mockResolvedValue({
      ...preview,
      balance_kopeks: preview.total_price_kopeks,
      balance_label: preview.total_price_label,
      can_purchase: true,
      missing_amount_kopeks: 0,
    });
    let finishPurchase!: (value: unknown) => void;
    api.submitPurchase.mockImplementation(
      () =>
        new Promise((resolve) => {
          finishPurchase = resolve;
        }),
    );
    renderClassic();
    fireEvent.click(screen.getByRole('button', { name: 'common.next' }));
    const pay = await screen.findByRole('button', { name: 'Оплатить' });
    await waitFor(() => expect(pay.hasAttribute('disabled')).toBe(false));
    expect(screen.queryByRole('button', { name: 'Пополнить баланс' })).toBeNull();
    fireEvent.click(pay);
    fireEvent.click(pay);
    await waitFor(() => expect(api.submitPurchase).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(pay.getAttribute('aria-busy')).toBe('true'));
    finishPurchase({ success: true });
    await waitFor(() => expect(screen.getByTestId('route').textContent).toBe('/subscriptions'));
  });

  it('keeps direct tariff purchase when the balance covers it', async () => {
    api.purchaseTariff.mockResolvedValue({ success: true });
    renderTariff();
    fireEvent.click(screen.getByRole('button', { name: 'Оплатить' }));
    await waitFor(() => expect(screen.getByTestId('route').textContent).toBe('/subscriptions'));
    expect(api.purchaseTariff).toHaveBeenCalledTimes(1);
  });

  it('does not open top-up when a tariff cart was not saved', async () => {
    api.purchaseTariff.mockRejectedValue(
      insufficientFunds({ code: 'insufficient_funds', cart_saved: false, missing_amount: 30_000 }),
    );
    renderTariff();
    fireEvent.click(screen.getByRole('button', { name: 'Оплатить' }));

    await waitFor(() => {
      expect(api.purchaseTariff).toHaveBeenCalledTimes(1);
      expect(screen.getByTestId('route').textContent).toBe(
        '/subscription/purchase?subscriptionId=42',
      );
      expect(screen.getByText('Payment required')).toBeTruthy();
    });
    expect(screen.queryByText('subscription.fundingNotice')).toBeNull();
    expect(screen.queryByRole('button', { name: 'balance.topUp' })).toBeNull();
  });
});
