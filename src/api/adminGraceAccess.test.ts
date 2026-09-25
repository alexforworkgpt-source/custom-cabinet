import { beforeEach, describe, expect, it, vi } from 'vitest';

const clientMocks = vi.hoisted(() => ({
  get: vi.fn(),
  put: vi.fn(),
}));

vi.mock('./client', () => ({ default: clientMocks }));

import { adminGraceAccessApi } from './adminGraceAccess';

describe('adminGraceAccessApi Bot v4.15 contracts', () => {
  beforeEach(() => {
    clientMocks.get.mockReset();
    clientMocks.put.mockReset();
  });

  it('loads external squads from their dedicated panel endpoint', async () => {
    const response = {
      available: true,
      source: 'panel' as const,
      items: [{ uuid: '94f3c12a-2b80-4bb6-9d85-fb57cf45951e', name: 'External', members_count: 2 }],
    };
    clientMocks.get.mockResolvedValue({ data: response });

    await expect(adminGraceAccessApi.getExternalSquads()).resolves.toEqual(response);
    expect(clientMocks.get).toHaveBeenCalledWith('/cabinet/admin/grace-access/external-squads');
  });
});
