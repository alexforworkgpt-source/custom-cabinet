// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RenewSubscription from './RenewSubscription';

const api = vi.hoisted(() => ({
  getSubscription: vi.fn(),
  getRenewalOptions: vi.fn(),
  getPurchaseOptions: vi.fn(),
  renewSubscription: vi.fn(),
}));
vi.mock('@/api/subscription', () => ({ subscriptionApi: api }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));
vi.mock('@/hooks/useTheme', () => ({ useTheme: () => ({ isDark: true }) }));
vi.mock('@/hooks/useCurrency', () => ({
  useCurrency: () => ({ formatAmount: (value: number) => String(value), currencySymbol: '₽' }),
}));
vi.mock('@/platform', () => ({ useHaptic: () => ({ impact: () => {} }) }));
vi.mock('@/components/WebBackButton', () => ({ WebBackButton: () => null }));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="route">{`${location.pathname}${location.search}`}</div>;
}

function renderRenewal() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/subscriptions/42/renew']}>
        <Routes>
          <Route path="/subscriptions/:subscriptionId/renew" element={<RenewSubscription />} />
          <Route path="/balance/top-up" element={<LocationProbe />} />
          <Route path="/subscriptions/:subscriptionId" element={<LocationProbe />} />
        </Routes>
        <LocationProbe />
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return client;
}

function paymentError(detail: Record<string, unknown>, status = 402) {
  return Object.assign(new AxiosError('Payment required'), {
    response: { status, data: { detail } },
  });
}

beforeEach(() => {
  api.getSubscription.mockResolvedValue({
    subscription: {
      id: 42,
      status: 'active',
      is_trial: false,
      traffic_limit_gb: 100,
      device_limit: 3,
      servers: [],
    },
  });
  api.getRenewalOptions.mockResolvedValue([
    { period_days: 30, price_kopeks: 50_000, discount_percent: 0 },
  ]);
  api.getPurchaseOptions.mockResolvedValue({ sales_mode: 'classic', balance_kopeks: 20_000 });
});
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('classic renewal payment', () => {
  it('waits for the balance before offering a payment action', async () => {
    let finish!: (value: unknown) => void;
    api.getPurchaseOptions.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    const client = renderRenewal();
    await waitFor(() => expect(client.getQueryData(['renewal-options', 42])).toBeDefined());
    expect(screen.queryByRole('button', { name: /^30 subscription.days/ })).toBeNull();
    finish({ sales_mode: 'classic', balance_kopeks: 20_000 });
    expect(await screen.findByRole('button', { name: /^30 subscription.days/ })).toBeTruthy();
  });

  it('saves the selected renewal before opening top-up without a second action', async () => {
    api.renewSubscription.mockRejectedValue(
      paymentError({
        code: 'insufficient_funds',
        cart_saved: true,
        cart_mode: 'extend',
        missing_amount: 30_000,
      }),
    );
    renderRenewal();
    fireEvent.click(await screen.findByRole('button', { name: /^30 subscription.days/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'dashboard.topUpBalance' }));
    await waitFor(() => {
      expect(api.renewSubscription).toHaveBeenCalledExactlyOnceWith(30, 42);
      expect(screen.getAllByTestId('route')[0].textContent).toBe(
        '/balance/top-up?amount=300&returnTo=%2Fsubscriptions%2F42%2Frenew',
      );
    });
  });

  it('pays once from a sufficient balance and opens the renewed subscription', async () => {
    api.getPurchaseOptions.mockResolvedValue({ sales_mode: 'classic', balance_kopeks: 50_000 });
    let finish!: (value: unknown) => void;
    api.renewSubscription.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    renderRenewal();
    fireEvent.click(await screen.findByRole('button', { name: /^30 subscription.days/ }));
    const pay = await screen.findByRole('button', { name: 'subscription.pay' });
    fireEvent.click(pay);
    fireEvent.click(pay);
    await waitFor(() => expect(api.renewSubscription).toHaveBeenCalledExactlyOnceWith(30, 42));
    await waitFor(() => expect(pay.getAttribute('aria-busy')).toBe('true'));
    expect(
      screen.getByRole('button', { name: /^30 subscription.days/ }).hasAttribute('disabled'),
    ).toBe(true);
    finish({ message: 'Subscription renewed successfully' });
    await waitFor(() =>
      expect(screen.getAllByTestId('route')[0].textContent).toBe('/subscriptions/42'),
    );
  });

  it.each([
    [
      'unsaved cart',
      {
        code: 'insufficient_funds',
        cart_saved: false,
        cart_mode: 'extend',
        missing_amount: 30_000,
      },
      402,
    ],
    [
      'unsupported cart',
      {
        code: 'insufficient_funds',
        cart_saved: true,
        cart_mode: 'subscription_purchase',
        missing_amount: 30_000,
      },
      402,
    ],
    [
      'unknown failure',
      { code: 'other_failure', cart_saved: true, cart_mode: 'extend', missing_amount: 30_000 },
      402,
    ],
    [
      'non-payment status',
      { code: 'insufficient_funds', cart_saved: true, cart_mode: 'extend', missing_amount: 30_000 },
      409,
    ],
  ])(
    'keeps the selected period and shows the server error for %s',
    async (_case, detail, status) => {
      api.renewSubscription.mockRejectedValue(
        paymentError({ ...detail, message: 'Renewal rejected' }, status),
      );
      renderRenewal();
      fireEvent.click(await screen.findByRole('button', { name: /^30 subscription.days/ }));
      fireEvent.click(await screen.findByRole('button', { name: 'dashboard.topUpBalance' }));
      expect(await screen.findByText('Renewal rejected')).toBeTruthy();
      expect(screen.getByTestId('route').textContent).toBe('/subscriptions/42/renew');
      expect(screen.queryByRole('button', { name: 'balance.topUp' })).toBeNull();
    },
  );

  it('uses the fresh server shortage instead of the displayed estimate', async () => {
    api.renewSubscription.mockRejectedValue(
      paymentError({
        code: 'insufficient_funds',
        cart_saved: true,
        cart_mode: 'extend',
        missing_amount: 31_001,
      }),
    );
    renderRenewal();
    fireEvent.click(await screen.findByRole('button', { name: /^30 subscription.days/ }));
    fireEvent.click(await screen.findByRole('button', { name: 'dashboard.topUpBalance' }));
    await waitFor(() =>
      expect(screen.getAllByTestId('route')[0].textContent).toContain('amount=311&'),
    );
  });

  it('does not submit renewal automatically when returning after top-up', async () => {
    api.getPurchaseOptions.mockResolvedValue({ sales_mode: 'classic', balance_kopeks: 50_000 });
    renderRenewal();
    fireEvent.click(await screen.findByRole('button', { name: /^30 subscription.days/ }));
    await screen.findByRole('button', { name: 'subscription.pay' });
    expect(api.renewSubscription).not.toHaveBeenCalled();
  });
});
