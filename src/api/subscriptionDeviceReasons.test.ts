import { beforeEach, describe, expect, it, vi } from 'vitest';

const clientMocks = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock('./client', () => ({ default: clientMocks }));

import { subscriptionApi } from './subscription';

describe('Upstream Bot v4.7.1 device reason contracts', () => {
  beforeEach(() => clientMocks.get.mockReset());

  it('preserves reason codes from purchase and reduction availability responses', async () => {
    clientMocks.get
      .mockResolvedValueOnce({
        data: {
          available: false,
          reason_code: 'max_devices_reached',
          max_device_limit: 5,
        },
      })
      .mockResolvedValueOnce({
        data: {
          available: false,
          reason_code: 'at_minimum',
          current_device_limit: 1,
          min_device_limit: 1,
          can_reduce: 0,
          connected_devices_count: 0,
        },
      });

    const purchaseAvailability = await subscriptionApi.getDevicePrice(2, 42);
    const reductionAvailability = await subscriptionApi.getDeviceReductionInfo(42);

    expect(purchaseAvailability.reason_code).toBe('max_devices_reached');
    expect(reductionAvailability.reason_code).toBe('at_minimum');
    expect(clientMocks.get).toHaveBeenNthCalledWith(1, '/cabinet/subscription/devices/price', {
      params: { devices: 2, subscription_id: 42 },
    });
    expect(clientMocks.get).toHaveBeenNthCalledWith(
      2,
      '/cabinet/subscription/devices/reduction-info',
      { params: { subscription_id: 42 } },
    );
  });
});
