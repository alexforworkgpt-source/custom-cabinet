// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import RenewSubscription from './RenewSubscription';
import { useAuthStore } from '../store/auth';
import { safeSession, resetSafeStorage } from '../utils/safeStorage';
import { readRenewalSelection } from '../utils/renewalSelection';

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
vi.mock('@/platform', () => ({
  useHaptic: () => ({ impact: () => {} }),
  usePlatform: () => ({ haptic: { impact: () => {} } }),
}));
vi.mock('@/components/WebBackButton', () => ({ WebBackButton: () => null }));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="route">{`${location.pathname}${location.search}`}</div>;
}

function renderRenewal(id = 42) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[`/subscriptions/${id}/renew`]}>
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
  resetSafeStorage();
  safeSession.removeItem('cabinet-renewal-selection');
  useAuthStore.setState({ user: { id: 1 } as never });
  api.getSubscription.mockResolvedValue({
    subscription: {
      id: 42,
      status: 'active',
      end_date: '2026-10-30T00:00:00Z',
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
  it.each(['getSubscription', 'getRenewalOptions', 'getPurchaseOptions'] as const)(
    'shows a retryable error for %s instead of empty options or zero balance',
    async (method) => {
      const working = await api[method]();
      api[method].mockRejectedValue(new Error('Unavailable'));
      renderRenewal();
      expect(await screen.findByRole('alert')).toBeTruthy();
      expect(screen.queryByText('subscription.noRenewalOptions')).toBeNull();
      expect(screen.queryByRole('button', { name: 'dashboard.topUpBalance' })).toBeNull();
      api[method].mockResolvedValue(working);
      fireEvent.click(screen.getByRole('button', { name: 'common.retry' }));
      expect(await screen.findByRole('button', { name: /^30 subscription.days/ })).toBeTruthy();
    },
  );

  it('restores the period after remount with a fresh price and balance, without submitting', async () => {
    renderRenewal();
    fireEvent.click(await screen.findByRole('button', { name: /^30 subscription.days/ }));
    cleanup();
    api.getRenewalOptions.mockResolvedValue([
      { period_days: 30, price_kopeks: 51_001, discount_percent: 0 },
    ]);
    api.getPurchaseOptions.mockResolvedValue({ sales_mode: 'classic', balance_kopeks: 60_000 });
    renderRenewal();
    expect(await screen.findByRole('button', { name: 'subscription.pay' })).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /^30 subscription.days/ }).getAttribute('aria-pressed'),
    ).toBe('true');
    expect(document.body.textContent).toContain('510.01');
    expect(api.renewSubscription).not.toHaveBeenCalled();
  });

  it('does not offer a completed intent after the server end date changes', async () => {
    renderRenewal();
    fireEvent.click(await screen.findByRole('button', { name: /^30 subscription.days/ }));
    cleanup();
    const response = await api.getSubscription();
    api.getSubscription.mockResolvedValue({
      ...response,
      subscription: { ...response.subscription, end_date: '2026-11-29T00:00:00Z' },
    });
    renderRenewal();
    expect(await screen.findByText('subscription.renewSelectionReset')).toBeTruthy();
    expect(
      screen
        .getByRole('button', { name: 'subscription.chooseRenewalPeriod' })
        .hasAttribute('disabled'),
    ).toBe(true);
    expect(api.renewSubscription).not.toHaveBeenCalled();
  });

  it('shows empty options separately, with a disabled choose-period action', async () => {
    api.getRenewalOptions.mockResolvedValue([]);
    renderRenewal();
    expect(await screen.findByText('subscription.noRenewalOptions')).toBeTruthy();
    expect(screen.queryByRole('alert')).toBeNull();
    expect(
      screen
        .getByRole('button', { name: 'subscription.chooseRenewalPeriod' })
        .hasAttribute('disabled'),
    ).toBe(true);
  });

  it.each(['removed period', 'different user', 'different subscription', 'changed mode', 'logout'])(
    'does not restore intent for %s',
    async (scenario) => {
      renderRenewal();
      fireEvent.click(await screen.findByRole('button', { name: /^30 subscription.days/ }));
      expect(readRenewalSelection(1, 42)?.periodDays).toBe(30);
      cleanup();
      if (scenario === 'removed period')
        api.getRenewalOptions.mockResolvedValue([
          { period_days: 90, price_kopeks: 90_000, discount_percent: 0 },
        ]);
      if (scenario === 'different user') useAuthStore.setState({ user: { id: 2 } as never });
      if (scenario === 'changed mode')
        api.getPurchaseOptions.mockResolvedValue({ sales_mode: 'tariffs', balance_kopeks: 20_000 });
      if (scenario === 'logout') {
        useAuthStore.getState().logout();
        useAuthStore.setState({ user: { id: 1 } as never });
      }
      renderRenewal(scenario === 'different subscription' ? 43 : 42);
      expect(
        await screen.findByRole('button', { name: 'subscription.chooseRenewalPeriod' }),
      ).toBeTruthy();
      expect(
        screen
          .getByRole('button', { name: 'subscription.chooseRenewalPeriod' })
          .hasAttribute('disabled'),
      ).toBe(true);
      expect(api.renewSubscription).not.toHaveBeenCalled();
    },
  );

  it('keeps manual payment working when session storage is denied', async () => {
    const write = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage denied');
    });
    renderRenewal();
    fireEvent.click(await screen.findByRole('button', { name: /^30 subscription.days/ }));
    expect(await screen.findByRole('button', { name: 'dashboard.topUpBalance' })).toBeTruthy();
    expect(api.renewSubscription).not.toHaveBeenCalled();
    write.mockRestore();
  });

  it('blocks payment while critical data refreshes, and after a refresh fails', async () => {
    const client = renderRenewal();
    fireEvent.click(await screen.findByRole('button', { name: /^30 subscription.days/ }));
    let fail!: (error: Error) => void;
    api.getPurchaseOptions.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          fail = reject;
        }),
    );
    void client.invalidateQueries({ queryKey: ['purchase-options', 42] });
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'dashboard.topUpBalance' }).hasAttribute('disabled'),
      ).toBe(true),
    );
    fail(new Error('Unavailable'));
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(api.renewSubscription).not.toHaveBeenCalled();
  });
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
    expect(readRenewalSelection(1, 42)).toBeNull();
  });

  it.each([
    [
      'unsupported balance code',
      {
        code: 'insufficient_balance',
        cart_saved: true,
        cart_mode: 'extend',
        missing_amount: 30_000,
      },
      402,
    ],
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

  it('keeps renewal selected after a network failure and allows a manual retry', async () => {
    api.renewSubscription.mockRejectedValue(new Error('Network unavailable'));
    renderRenewal();
    fireEvent.click(await screen.findByRole('button', { name: /^30 subscription.days/ }));
    fireEvent.click(screen.getByRole('button', { name: 'dashboard.topUpBalance' }));
    expect(await screen.findByText('Network unavailable')).toBeTruthy();
    expect(
      screen.getByRole('button', { name: /^30 subscription.days/ }).getAttribute('aria-pressed'),
    ).toBe('true');
    expect(screen.getByTestId('route').textContent).toBe('/subscriptions/42/renew');
    expect(api.renewSubscription).toHaveBeenCalledTimes(1);
  });
});
