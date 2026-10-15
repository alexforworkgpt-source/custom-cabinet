import { beforeEach, expect, it, vi } from 'vitest';
const client = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('./client', () => ({ default: client }));
import { subscriptionApi } from './subscription';

beforeEach(() => {
  vi.resetAllMocks();
  client.get.mockResolvedValue({ data: { status: 'none' } });
  client.post.mockResolvedValue({
    data: { status: 'PENDING', redirect_url: null, subscription_id: 7 },
  });
});

it('enables recurring for the selected subscription through its query parameter', async () => {
  await subscriptionApi.enableCasheraRecurring(7);
  expect(client.post).toHaveBeenCalledWith(
    '/cabinet/subscription/cashera-recurrent/enable',
    {},
    {
      params: { subscription_id: 7 },
    },
  );
});

it('reads and cancels the selected subscription without moving its ID into the body', async () => {
  await subscriptionApi.getCasheraRecurring(7);
  await subscriptionApi.cancelCasheraRecurring(7);
  expect(client.get).toHaveBeenCalledWith('/cabinet/subscription/cashera-recurrent', {
    params: { subscription_id: 7 },
  });
  expect(client.post).toHaveBeenCalledWith(
    '/cabinet/subscription/cashera-recurrent/cancel',
    {},
    { params: { subscription_id: 7 } },
  );
});

it('creates recurring authorization with tariff_id and an empty body', async () => {
  await subscriptionApi.purchaseWithCasheraRecurring(42);
  expect(client.post).toHaveBeenCalledWith(
    '/cabinet/subscription/cashera-recurrent/purchase',
    {},
    { params: { tariff_id: 42 } },
  );
});
