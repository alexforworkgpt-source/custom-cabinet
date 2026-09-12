import { beforeEach, describe, expect, it, vi } from 'vitest';

const clientMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}));

vi.mock('./client', () => ({ default: clientMocks }));

import { subscriptionApi } from './subscription';
import { tariffsApi, type TariffCreateRequest, type TariffUpdateRequest } from './tariffs';

describe('Upstream Bot v4.7.1 tariff pricing contracts', () => {
  beforeEach(() => {
    clientMocks.get.mockReset();
    clientMocks.post.mockReset();
    clientMocks.put.mockReset();
  });

  it('preserves highlighted tariff and period fields in admin tariff details', async () => {
    clientMocks.get.mockResolvedValue({
      data: { id: 7, name: 'Про', is_highlighted: true, highlight_period_days: 180 },
    });

    const result = await tariffsApi.getTariff(7);

    expect(result.is_highlighted).toBe(true);
    expect(result.highlight_period_days).toBe(180);
  });

  it('sends highlighted tariff and period fields in create and update requests', async () => {
    clientMocks.post.mockResolvedValue({ data: {} });
    clientMocks.put.mockResolvedValue({ data: {} });
    const create: TariffCreateRequest = {
      name: 'Про',
      is_highlighted: true,
      highlight_period_days: 180,
    };
    const update: TariffUpdateRequest = {
      is_highlighted: false,
      highlight_period_days: null,
    };

    await tariffsApi.createTariff(create);
    await tariffsApi.updateTariff(7, update);

    expect(clientMocks.post).toHaveBeenCalledWith('/cabinet/admin/tariffs', create);
    expect(clientMocks.put).toHaveBeenCalledWith('/cabinet/admin/tariffs/7', update);
  });

  it('preserves best-value markers in purchase and renewal responses', async () => {
    clientMocks.get
      .mockResolvedValueOnce({
        data: {
          sales_mode: 'tariffs',
          tariffs: [
            {
              id: 7,
              name: 'Про',
              is_highlighted: true,
              periods: [{ days: 180, is_highlighted: true }],
            },
          ],
        },
      })
      .mockResolvedValueOnce({
        data: [{ period_days: 180, price_kopeks: 270_000, is_highlighted: true }],
      });

    const purchase = await subscriptionApi.getPurchaseOptions();
    const renewal = await subscriptionApi.getRenewalOptions(42);

    expect(purchase.sales_mode).toBe('tariffs');
    if (purchase.sales_mode !== 'tariffs') throw new Error('expected tariff purchase contract');
    expect(purchase.tariffs[0]?.is_highlighted).toBe(true);
    expect(purchase.tariffs[0]?.periods[0]?.is_highlighted).toBe(true);
    expect(renewal[0]?.is_highlighted).toBe(true);
  });
});
