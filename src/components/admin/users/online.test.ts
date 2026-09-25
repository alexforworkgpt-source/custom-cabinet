import { describe, expect, it } from 'vitest';
import { isUserOnline } from './online';

describe('isUserOnline', () => {
  const now = Date.parse('2026-09-16T12:00:00Z');
  const at = (secondsAgo: number) => new Date(now - secondsAgo * 1000).toISOString();

  it('expires the panel online marker after one minute without a refetch', () => {
    const user = { online_at: at(55) };
    expect(isUserOnline(user, now)).toBe(true);
    expect(isUserOnline(user, now + 10_000)).toBe(false);
  });

  it('uses is_online only when an older Bot omitted online_at', () => {
    expect(isUserOnline({ online_at: null, is_online: true }, now)).toBe(false);
    expect(isUserOnline({ is_online: true }, now)).toBe(true);
    expect(isUserOnline({ is_online: false }, now)).toBe(false);
  });
});
