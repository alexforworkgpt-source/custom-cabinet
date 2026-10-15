import { beforeEach, expect, it, vi } from 'vitest';

const client = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('./client', () => ({ default: client }));
import { adminBroadcastsApi } from './adminBroadcasts';

beforeEach(() => {
  client.get.mockReset().mockResolvedValue({ data: { count: 0, users: [] } });
  client.post.mockReset().mockResolvedValue({ data: { count: 0, users: [] } });
});

it('previews server-evaluated audience rules with channel, category and pagination', async () => {
  const data = {
    channel: 'email' as const,
    category: 'news' as const,
    audience: {
      conditions: [{ field: 'email_user', operator: 'eq' as const, value: '42', join: null }],
    },
    offset: 50,
    limit: 50,
  };
  await adminBroadcastsApi.previewAudience(data);
  expect(client.post).toHaveBeenCalledWith('/cabinet/admin/broadcasts/audience/preview', data);
});
