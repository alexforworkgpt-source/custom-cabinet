// @vitest-environment jsdom
import { type ReactNode, useState } from 'react';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { PromoGroupDiscounts } from '@/api/promo';
import { usePurchaseContext } from './usePurchaseContext';

const api = vi.hoisted(() => ({ getGroupDiscounts: vi.fn() }));
vi.mock('@/api/promo', () => ({ promoApi: api }));
const group: PromoGroupDiscounts = {
  group_name: 'Базовый юзер',
  server_discount_percent: 0,
  traffic_discount_percent: 0,
  device_discount_percent: 0,
  period_discounts: {},
};
const clients: QueryClient[] = [];
function Wrapper({ children }: { children: ReactNode }) {
  const [client] = useState(() => {
    const instance = new QueryClient({ defaultOptions: { queries: { gcTime: 0 } } });
    clients.push(instance);
    return instance;
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
const wrapper = Wrapper;
const input: Parameters<typeof usePurchaseContext>[0] = {
  subscription: null,
  purchaseOptions: { sales_mode: 'classic' },
  tariffs: [],
  showPromoGroup: true,
  enabled: true,
};
beforeEach(() => {
  api.getGroupDiscounts.mockResolvedValue(group);
});
afterEach(() => {
  cleanup();
  for (const client of clients) client.clear();
  clients.length = 0;
  vi.resetAllMocks();
});

describe('purchase context layout readiness', () => {
  it('keeps context pending until the existing group request resolves', async () => {
    let release = (_value: PromoGroupDiscounts) => {};
    api.getGroupDiscounts.mockReturnValue(
      new Promise<PromoGroupDiscounts>((resolve) => {
        release = resolve;
      }),
    );
    const { result } = renderHook(() => usePurchaseContext(input), { wrapper });
    expect(result.current.isLoading).toBe(true);
    expect(result.current.promoGroupName).toBeUndefined();
    await act(async () => release(group));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.promoGroupName).toBe('Базовый юзер');
  });

  it('finishes with no invented group when the API returns no group', async () => {
    api.getGroupDiscounts.mockResolvedValue({ ...group, group_name: null });
    const { result } = renderHook(() => usePurchaseContext(input), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.promoGroupName).toBeNull();
  });

  it('fails open after one failed optional metadata request', async () => {
    api.getGroupDiscounts.mockRejectedValue(new Error('Optional metadata unavailable'));
    const { result } = renderHook(() => usePurchaseContext(input), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.promoGroupName).toBeUndefined();
    expect(api.getGroupDiscounts).toHaveBeenCalledTimes(1);
  });

  it('uses an inline tariff group without a redundant API request', () => {
    const { result } = renderHook(
      () => usePurchaseContext({ ...input, tariffs: [{ promo_group_name: 'Группа тарифа' }] }),
      { wrapper },
    );
    expect(result.current.isLoading).toBe(false);
    expect(result.current.promoGroupName).toBe('Группа тарифа');
    expect(api.getGroupDiscounts).not.toHaveBeenCalled();
  });

  it.each([{ enabled: false }, { showPromoGroup: false }])(
    'does not fetch disabled context %j',
    (override) => {
      const { result } = renderHook(() => usePurchaseContext({ ...input, ...override }), {
        wrapper,
      });
      expect(result.current.isLoading).toBe(false);
      expect(api.getGroupDiscounts).not.toHaveBeenCalled();
    },
  );

  it.each([false, true])('preserves trial-upgrade visibility with expired tariff=%s', (expired) => {
    const { result } = renderHook(
      () =>
        usePurchaseContext({
          ...input,
          subscription: { is_trial: true },
          showPromoGroup: false,
          purchaseOptions: { sales_mode: 'tariffs', subscription_is_expired: expired },
        }),
      { wrapper },
    );
    expect(result.current.showTrialUpgrade).toBe(!expired);
  });
});
