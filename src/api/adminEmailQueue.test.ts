import { beforeEach, describe, expect, it, vi } from 'vitest';

const clientMocks = vi.hoisted(() => ({
  get: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('./client', () => ({ default: clientMocks }));

import { adminEmailQueueApi } from './adminEmailQueue';

describe('Upstream Bot v4.7.1 admin email queue contract', () => {
  beforeEach(() => {
    clientMocks.get.mockReset();
    clientMocks.delete.mockReset();
  });

  it('reads the queue without exposing message bodies and clears the requested scope', async () => {
    clientMocks.get.mockResolvedValue({
      data: {
        pending: 1,
        sent: 2,
        dead: 3,
        smtp_configured: true,
        items: [],
      },
    });
    clientMocks.delete.mockResolvedValue({ data: { removed: 1, pending_only: true } });

    await expect(adminEmailQueueApi.getQueue()).resolves.toMatchObject({ pending: 1, items: [] });
    await expect(adminEmailQueueApi.clearQueue(true)).resolves.toEqual({
      removed: 1,
      pending_only: true,
    });

    expect(clientMocks.get).toHaveBeenCalledWith('/cabinet/admin/email-queue');
    expect(clientMocks.delete).toHaveBeenCalledWith('/cabinet/admin/email-queue', {
      params: { pending_only: true },
    });
  });
});
