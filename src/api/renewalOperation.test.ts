import { AxiosError } from 'axios';
import { afterEach, expect, it, vi } from 'vitest';

const post = vi.hoisted(() => vi.fn());
vi.mock('./client', () => ({ default: { post } }));

import { subscriptionApi } from './subscription';

afterEach(() => {
  vi.unstubAllEnvs();
  post.mockReset();
});

it('uses the same operation and end date when the customer retries after a network error', async () => {
  vi.stubEnv('VITE_UPSTREAM_BOT_CONTRACT', '5.3.0');
  post.mockRejectedValueOnce(new AxiosError('Connection lost', 'ERR_NETWORK'));
  post.mockResolvedValueOnce({ data: { new_end_date: '2026-12-29T00:00:00Z' } });
  const snapshot = { userId: 5, endDate: '2026-11-29T00:00:00Z' };

  await expect(subscriptionApi.renewSubscription(30, 42, snapshot)).rejects.toThrow(
    'Connection lost',
  );
  await subscriptionApi.renewSubscription(30, 42, snapshot);

  expect(post).toHaveBeenCalledTimes(2);
  expect(post.mock.calls[0]?.[0]).toBe('/cabinet/subscription/renew');
  expect(post.mock.calls[0]?.[1]).toMatchObject({
    subscription_id: 42,
    period_days: 30,
    operation_id: expect.stringMatching(/^[0-9a-f-]{36}$/i),
    expected_end_date: snapshot.endDate,
  });
  expect(post.mock.calls[1]).toEqual(post.mock.calls[0]);
});
