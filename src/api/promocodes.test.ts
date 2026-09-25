import { beforeEach, describe, expect, it, vi } from 'vitest';

const clientMocks = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock('./client', () => ({ default: clientMocks }));

import { promocodesApi } from './promocodes';

describe('promocodesApi promo-group recalculation', () => {
  beforeEach(() => {
    clientMocks.get.mockReset();
    clientMocks.post.mockReset();
  });

  it('starts the background pass and reads its current status from the exact Bot routes', async () => {
    const running = {
      running: true,
      queued: true,
      reason: 'started from cabinet',
      started: false,
      last: null,
    };
    const finished = {
      running: false,
      queued: false,
      reason: null,
      started: false,
      last: {
        reason: 'started from cabinet',
        checked: 5913,
        changed: 42,
        failed: 0,
        started_at: '2026-09-24T08:00:00Z',
        finished_at: '2026-09-24T08:00:14Z',
        error: null,
      },
    };
    clientMocks.post.mockResolvedValue({ data: running });
    clientMocks.get.mockResolvedValue({ data: finished });

    await expect(promocodesApi.recalculatePromoGroups()).resolves.toEqual(running);
    await expect(promocodesApi.getPromoGroupRecalculation()).resolves.toEqual(finished);

    expect(clientMocks.post).toHaveBeenCalledWith('/cabinet/admin/promo-groups/recalculate');
    expect(clientMocks.get).toHaveBeenCalledWith('/cabinet/admin/promo-groups/recalculate');
  });
});
