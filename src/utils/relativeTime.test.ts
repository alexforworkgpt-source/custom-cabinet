import { describe, expect, it } from 'vitest';
import { PANEL_ONLINE_WINDOW_MS, isConnectedNow, relativeTimeParts } from './relativeTime';

const now = Date.parse('2026-09-14T12:00:00Z');
const ago = (ms: number) => new Date(now - ms).toISOString();

describe('relativeTimeParts', () => {
  it('returns stable locale parts for activity timestamps', () => {
    expect(relativeTimeParts(null, now)).toEqual({ key: 'never', count: 0 });
    expect(relativeTimeParts(ago(20_000), now)).toEqual({ key: 'now', count: 0 });
    expect(relativeTimeParts(ago(4 * 60_000), now)).toEqual({ key: 'minutes', count: 4 });
    expect(relativeTimeParts(ago(3 * 3_600_000), now)).toEqual({ key: 'hours', count: 3 });
  });
});

describe('isConnectedNow', () => {
  it('uses the one-minute panel window', () => {
    expect(PANEL_ONLINE_WINDOW_MS).toBe(60_000);
    expect(isConnectedNow(ago(59_000), now)).toBe(true);
    expect(isConnectedNow(ago(61_000), now)).toBe(false);
  });
});
