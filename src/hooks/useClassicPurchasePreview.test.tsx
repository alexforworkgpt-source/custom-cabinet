// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import { useClassicPurchasePreview } from './useClassicPurchasePreview';
import type { PeriodOption, PurchasePreview } from '@/types';

const period: PeriodOption = {
  id: 'days:30',
  period_days: 30,
  months: 1,
  label: '30 дней',
  price_kopeks: 9900,
  price_label: '99 ₽',
  per_month_price_kopeks: 9900,
  per_month_price_label: '99 ₽',
  is_available: true,
  traffic: { selectable: false, mode: 'fixed', options: [], current: 100 },
  servers: { options: [], min: 0, max: 0, default: [], selected: [] },
  devices: {
    min: 1,
    max: 5,
    default: 1,
    current: 1,
    price_per_device_kopeks: 0,
    price_per_device_label: '0 ₽',
  },
};
const selection = { period_id: period.id, period_days: 30, devices: 1, servers: [] };

const api = vi.hoisted(() => ({ previewPurchase: vi.fn() }));
vi.mock('@/api/subscription', () => ({ subscriptionApi: api }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it('does not reuse another subscription’s confirmed price while the first preview is pending', async () => {
  const preview: PurchasePreview = {
    total_price_kopeks: 9900,
    total_price_label: '99 ₽',
    per_month_price_kopeks: 9900,
    per_month_price_label: '99 ₽',
    breakdown: [{ label: 'Устройства', value: '99 ₽' }],
    balance_kopeks: 125000,
    balance_label: '1250 ₽',
    missing_amount_kopeks: 0,
    can_purchase: true,
  };
  api.previewPurchase.mockResolvedValue(preview);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  const { result, rerender } = renderHook(
    ({ id }) => useClassicPurchasePreview(selection, period, id, true),
    { initialProps: { id: 42 }, wrapper },
  );
  await waitFor(() => expect(result.current.summary?.preview.total_price_kopeks).toBe(9900));
  let finish!: (value: PurchasePreview) => void;
  api.previewPurchase.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  rerender({ id: 43 });
  await waitFor(() => expect(result.current.isFetching).toBe(true));
  expect(result.current.summary).toBeNull();
  expect(result.current.data).toBeUndefined();
  await act(async () => finish({ ...preview, total_price_kopeks: 19900 }));
  await waitFor(() => expect(result.current.summary?.preview.total_price_kopeks).toBe(19900));
  client.clear();
});
