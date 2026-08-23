import { beforeEach, describe, expect, it, vi } from 'vitest';

const clientMocks = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
}));

vi.mock('./client', () => ({
  default: clientMocks,
}));

import { adminUsersApi } from './adminUsers';

describe('adminUsersApi v1.66 contracts', () => {
  beforeEach(() => {
    clientMocks.delete.mockReset().mockResolvedValue({ data: { status: 'ok' } });
    clientMocks.get.mockReset().mockResolvedValue({
      data: { users: [], total: 0, offset: 0, limit: 20 },
    });
  });

  it('forwards subscription_end_date as the users sort query', async () => {
    await adminUsersApi.getUsers({
      offset: 0,
      limit: 20,
      sort_by: 'subscription_end_date',
    });

    expect(clientMocks.get).toHaveBeenCalledWith('/cabinet/admin/users', {
      params: { offset: 0, limit: 20, sort_by: 'subscription_end_date' },
    });
  });

  it('deletes a subscription without force after an ordinary confirmation', async () => {
    await adminUsersApi.deleteSubscription(42, 7);

    expect(clientMocks.delete).toHaveBeenCalledWith('/cabinet/admin/users/42/subscriptions/7');
  });

  it('adds force=true only after the destructive confirmation path', async () => {
    await adminUsersApi.deleteSubscription(42, 7, true);

    expect(clientMocks.delete).toHaveBeenCalledWith('/cabinet/admin/users/42/subscriptions/7', {
      params: { force: true },
    });
  });
});
