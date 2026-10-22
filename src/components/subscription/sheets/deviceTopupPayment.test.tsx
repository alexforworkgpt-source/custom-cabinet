// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DeviceTopupSheet } from './DeviceTopupSheet';
import { useState } from 'react';
import { AxiosError } from 'axios';
import { useAuthStore } from '@/store/auth';
import { resetSafeStorage, safeSession } from '@/utils/safeStorage';
import { PlatformProvider } from '@/platform/PlatformProvider';

const api = vi.hoisted(() => ({
  getDevicePrice: vi.fn(),
  purchaseDevices: vi.fn(),
  saveDevicesCart: vi.fn(),
  getSubscription: vi.fn(),
  getPurchaseOptions: vi.fn(),
  getBalance: vi.fn(),
}));
vi.mock('@/api/subscription', () => ({ subscriptionApi: api }));
vi.mock('@/api/balance', () => ({ balanceApi: { getBalance: api.getBalance } }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'ru' } }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));
vi.mock('@/hooks/useCurrency', () => ({
  useCurrency: () => ({ formatAmount: (value: number) => String(value), currencySymbol: '₽' }),
}));
const subscription = {
  id: 42,
  status: 'active',
  is_active: true,
  is_trial: false,
  device_limit: 1,
  end_date: '2027-01-24T00:00:00Z',
  traffic_limit_gb: 100,
  connected_squads: [],
};
const quote = {
  available: true,
  current_device_limit: 1,
  max_device_limit: 5,
  days_left: 97,
  total_price_kopeks: 16166,
  total_price_label: '161.66 ₽',
  price_per_device_kopeks: 16166,
  price_per_device_label: '161.66 ₽',
};
function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="route">
      {location.pathname}
      {location.search}
    </div>
  );
}
function renderDevices(balance = 0) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <PlatformProvider>
        <MemoryRouter
          initialEntries={['/subscriptions/42?section=additional-options&action=devices']}
        >
          <Routes>
            <Route path="/subscriptions/:id" element={<StatefulDevices balance={balance} />} />
            <Route path="/balance/top-up" element={<LocationProbe />} />
          </Routes>
        </MemoryRouter>
      </PlatformProvider>
    </QueryClientProvider>,
  );
}
function StatefulDevices({ balance }: { balance: number }) {
  const [devices, setDevices] = useState(1);
  return (
    <DeviceTopupSheet
      open
      onOpen={() => {}}
      onClose={() => {}}
      subscription={subscription as never}
      subscriptionId={42}
      devicesToAdd={devices}
      onDevicesToAddChange={setDevices}
      purchaseOptions={{ balance_kopeks: balance } as never}
      isDark
    />
  );
}
beforeEach(() => {
  resetSafeStorage();
  safeSession.removeItem('cabinet-device-intent');
  useAuthStore.setState({ user: { id: 1 } as never });
  api.getDevicePrice.mockResolvedValue(quote);
  api.getSubscription.mockResolvedValue({ subscription });
  api.getPurchaseOptions.mockResolvedValue({ sales_mode: 'classic', balance_kopeks: 0 });
  api.getBalance.mockResolvedValue({ balance_kopeks: 0 });
  api.purchaseDevices.mockResolvedValue({ success: true });
  api.saveDevicesCart.mockResolvedValue(undefined);
});
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

describe('separate device payment', () => {
  it('keeps a server-available add-on usable for a paid traffic-limited subscription', async () => {
    api.getBalance.mockResolvedValue({ balance_kopeks: 100000 });
    api.getSubscription.mockResolvedValue({
      subscription: { ...subscription, status: 'limited', is_active: false, is_limited: true },
    });
    renderDevices(100000);
    const buy = await screen.findByRole('button', { name: 'subscription.additionalOptions.buy' });
    await waitFor(() => expect(buy.hasAttribute('disabled')).toBe(false));
    fireEvent.click(buy);
    await waitFor(() => expect(api.purchaseDevices).toHaveBeenCalledExactlyOnceWith(1, 42));
  });
  it('opens funding without creating a server cart or attempting an underfunded purchase', async () => {
    renderDevices();
    fireEvent.click(await screen.findByRole('button', { name: 'balance.topUp' }));
    expect((await screen.findByTestId('route')).textContent).toBe(
      '/balance/top-up?amount=162&returnTo=%2Fsubscriptions%2F42%3Fsection%3Dadditional-options%26action%3Ddevices',
    );
    expect(api.saveDevicesCart).not.toHaveBeenCalled();
    expect(api.purchaseDevices).not.toHaveBeenCalled();
  });

  it('restores only the intended limit after funding and buys delta once after a manual confirmation', async () => {
    renderDevices();
    fireEvent.click(
      await screen.findByRole('button', {
        name: 'subscription.additionalOptions.incrementDevices',
      }),
    );
    fireEvent.click(await screen.findByRole('button', { name: 'balance.topUp' }));
    await screen.findByTestId('route');
    cleanup();
    api.getDevicePrice.mockClear();
    api.getBalance.mockResolvedValue({ balance_kopeks: 100000 });
    renderDevices(100000);
    await waitFor(() => expect(api.getDevicePrice).toHaveBeenLastCalledWith(2, 42));
    expect(api.purchaseDevices).not.toHaveBeenCalled();
    const buy = await screen.findByRole('button', { name: 'subscription.additionalOptions.buy' });
    fireEvent.click(buy);
    fireEvent.click(buy);
    await waitFor(() => expect(api.purchaseDevices).toHaveBeenCalledExactlyOnceWith(2, 42));
  });

  it('requires confirmation of a refreshed quote instead of charging an old price', async () => {
    api.getBalance.mockResolvedValue({ balance_kopeks: 100000 });
    renderDevices(100000);
    await screen.findByText('161.66 ₽', { selector: '.text-2xl' });
    api.getDevicePrice.mockResolvedValue({
      ...quote,
      total_price_kopeks: 20100,
      total_price_label: '201 ₽',
    });
    fireEvent.click(screen.getByRole('button', { name: 'subscription.additionalOptions.buy' }));
    await waitFor(() => expect(api.getDevicePrice.mock.calls.length).toBeGreaterThan(1));
    expect(api.purchaseDevices).not.toHaveBeenCalled();
    await screen.findByText('201 ₽', { selector: '.text-2xl' });
    const buy = screen.getByRole('button', { name: 'subscription.additionalOptions.buy' });
    await waitFor(() => expect(buy.hasAttribute('disabled')).toBe(false));
    fireEvent.click(buy);
    await waitFor(() => expect(api.purchaseDevices).toHaveBeenCalledExactlyOnceWith(1, 42));
  });

  it('allows a smaller manual selection when the restored device intent exceeds the new maximum', async () => {
    renderDevices();
    const increment = await screen.findByRole('button', {
      name: 'subscription.additionalOptions.incrementDevices',
    });
    fireEvent.click(increment);
    fireEvent.click(increment);
    fireEvent.click(increment);
    fireEvent.click(await screen.findByRole('button', { name: 'balance.topUp' }));
    await screen.findByTestId('route');
    cleanup();
    api.getBalance.mockResolvedValue({ balance_kopeks: 100000 });
    api.getDevicePrice.mockImplementation(async (count: number) =>
      count > 2
        ? { available: false, reason_code: 'can_add_limited', can_add: 2, max_device_limit: 3 }
        : { ...quote, max_device_limit: 3 },
    );
    renderDevices(100000);
    await waitFor(() => expect(api.getDevicePrice).toHaveBeenLastCalledWith(4, 42));
    await screen.findByText('subscription.additionalOptions.reasons.canAddLimited');
    const decrement = screen.getByRole('button', {
      name: 'subscription.additionalOptions.decrementDevices',
    });
    const buy = screen.getByRole('button', { name: 'subscription.additionalOptions.buy' });
    expect(buy.hasAttribute('disabled')).toBe(true);
    expect(api.purchaseDevices).not.toHaveBeenCalled();
    fireEvent.click(decrement);
    await waitFor(() => expect(api.getDevicePrice).toHaveBeenLastCalledWith(3, 42));
    fireEvent.click(decrement);
    await waitFor(() => expect(api.getDevicePrice).toHaveBeenLastCalledWith(2, 42));
    await waitFor(() => expect(buy.hasAttribute('disabled')).toBe(false));
    expect(api.purchaseDevices).not.toHaveBeenCalled();
    fireEvent.click(buy);
    await waitFor(() => expect(api.purchaseDevices).toHaveBeenCalledExactlyOnceWith(2, 42));
  });

  it('blocks a zero quote without an explicit 100 percent device discount', async () => {
    api.getDevicePrice.mockResolvedValue({
      ...quote,
      total_price_kopeks: 0,
      total_price_label: '0 ₽',
    });
    renderDevices();
    await screen.findByText('subscription.switchTariff.free');
    const buy = screen.getByRole('button', { name: 'subscription.additionalOptions.buy' });
    expect(buy.hasAttribute('disabled')).toBe(true);
    expect(api.purchaseDevices).not.toHaveBeenCalled();
  });

  it.each(['no_active_subscription', 'max_devices_reached', 'can_add_limited'])(
    'does not offer reselection when no devices can be added (%s)',
    async (reasonCode) => {
      api.getDevicePrice.mockResolvedValue({
        available: false,
        reason_code: reasonCode,
        can_add: 0,
      });
      renderDevices();
      await waitFor(() => expect(api.getDevicePrice).toHaveBeenCalled());
      await waitFor(() =>
        expect(
          screen.queryByRole('button', { name: 'subscription.additionalOptions.buy' }),
        ).toBeNull(),
      );
      expect(
        screen.queryByRole('button', { name: 'subscription.additionalOptions.decrementDevices' }),
      ).toBeNull();
      expect(api.purchaseDevices).not.toHaveBeenCalled();
    },
  );

  it('keeps an unexpected saved server cart blocked across remount without offering ordinary funding', async () => {
    api.getBalance.mockResolvedValue({ balance_kopeks: 100000 });
    api.purchaseDevices.mockRejectedValue(
      Object.assign(new AxiosError('Payment required'), {
        response: { status: 402, data: { detail: { cart_saved: true } } },
      }),
    );
    renderDevices(100000);
    const buy = await screen.findByRole('button', { name: 'subscription.additionalOptions.buy' });
    await waitFor(() => expect(buy.hasAttribute('disabled')).toBe(false));
    fireEvent.click(buy);
    await screen.findByText('subscription.devicePayment.cartSaved');
    cleanup();
    api.getBalance.mockResolvedValue({ balance_kopeks: 0 });
    renderDevices();
    await screen.findByText('subscription.devicePayment.cartSaved');
    expect(screen.queryByRole('button', { name: 'balance.topUp' })).toBeNull();
    expect(
      screen
        .getByRole('button', { name: 'subscription.additionalOptions.buy' })
        .hasAttribute('disabled'),
    ).toBe(true);
    expect(api.purchaseDevices).toHaveBeenCalledTimes(1);
  });

  it('does not charge if the signed-in account changes during confirmation', async () => {
    api.getBalance.mockResolvedValue({ balance_kopeks: 100000 });
    renderDevices(100000);
    const buy = await screen.findByRole('button', { name: 'subscription.additionalOptions.buy' });
    await waitFor(() => expect(buy.hasAttribute('disabled')).toBe(false));
    api.getDevicePrice.mockImplementation(async () => {
      useAuthStore.setState({ user: { id: 2 } as never });
      return quote;
    });
    fireEvent.click(buy);
    await screen.findByText('subscription.devicePayment.changed');
    expect(api.purchaseDevices).not.toHaveBeenCalled();
  });

  it.each([
    { discount: undefined, total: 16166, label: '161.66 ₽' },
    { discount: 50, total: 8083, label: '80.83 ₽' },
    { discount: 100, total: 0, label: '0 ₽' },
  ])(
    'uses the final device quote with $discount discount without adding a frontend discount',
    async ({ discount, total, label }) => {
      api.getBalance.mockResolvedValue({ balance_kopeks: total });
      api.getDevicePrice.mockResolvedValue({
        ...quote,
        discount_percent: discount,
        total_price_kopeks: total,
        total_price_label: label,
        price_per_device_label: label,
      });
      renderDevices(total);
      const buy = await screen.findByRole('button', { name: 'subscription.additionalOptions.buy' });
      await waitFor(() => expect(buy.hasAttribute('disabled')).toBe(false));
      expect(screen.queryByRole('button', { name: 'balance.topUp' })).toBeNull();
      fireEvent.click(buy);
      await waitFor(() => expect(api.purchaseDevices).toHaveBeenCalledExactlyOnceWith(1, 42));
    },
  );

  it('does not repeat an intent whose desired limit was already applied before returning', async () => {
    renderDevices();
    fireEvent.click(await screen.findByRole('button', { name: 'balance.topUp' }));
    await screen.findByTestId('route');
    cleanup();
    api.getBalance.mockResolvedValue({ balance_kopeks: 100000 });
    api.getSubscription.mockResolvedValue({ subscription: { ...subscription, device_limit: 2 } });
    api.getDevicePrice.mockResolvedValue({ ...quote, current_device_limit: 2 });
    renderDevices(100000);
    await screen.findByText('subscription.devicePayment.alreadyApplied');
    expect(
      screen
        .getByRole('button', { name: 'subscription.additionalOptions.buy' })
        .hasAttribute('disabled'),
    ).toBe(true);
    expect(api.purchaseDevices).not.toHaveBeenCalled();
  });

  it('does not submit a changed subscription even when its price remains the same', async () => {
    api.getBalance.mockResolvedValue({ balance_kopeks: 100000 });
    renderDevices(100000);
    const buy = await screen.findByRole('button', { name: 'subscription.additionalOptions.buy' });
    await waitFor(() => expect(buy.hasAttribute('disabled')).toBe(false));
    api.getSubscription.mockResolvedValue({
      subscription: { ...subscription, end_date: '2027-02-23T00:00:00Z' },
    });
    fireEvent.click(buy);
    await screen.findByText('subscription.devicePayment.changed');
    expect(api.purchaseDevices).not.toHaveBeenCalled();
  });

  it('locks the device quantity while a confirmation is checking the server', async () => {
    api.getBalance.mockResolvedValue({ balance_kopeks: 100000 });
    renderDevices(100000);
    const buy = await screen.findByRole('button', { name: 'subscription.additionalOptions.buy' });
    await waitFor(() => expect(buy.hasAttribute('disabled')).toBe(false));
    let finish!: (value: typeof quote) => void;
    api.getDevicePrice.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    fireEvent.click(buy);
    expect(
      screen
        .getByRole('button', { name: 'subscription.additionalOptions.incrementDevices' })
        .hasAttribute('disabled'),
    ).toBe(true);
    finish(quote);
    await waitFor(() => expect(api.purchaseDevices).toHaveBeenCalledExactlyOnceWith(1, 42));
  });

  it('does not start a purchase after leaving during the preflight check', async () => {
    api.getBalance.mockResolvedValue({ balance_kopeks: 100000 });
    renderDevices(100000);
    const buy = await screen.findByRole('button', { name: 'subscription.additionalOptions.buy' });
    await waitFor(() => expect(buy.hasAttribute('disabled')).toBe(false));
    let finish!: (value: typeof quote) => void;
    api.getDevicePrice.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    fireEvent.click(buy);
    cleanup();
    await act(async () => {
      finish(quote);
    });
    expect(api.purchaseDevices).not.toHaveBeenCalled();
  });
});
