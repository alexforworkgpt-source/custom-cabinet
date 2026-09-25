import { describe, expect, it } from 'vitest';
import { parseCalendarDate } from './format';

describe('parseCalendarDate', () => {
  it('reads a date-only string as a local calendar day, not UTC midnight', () => {
    const day = parseCalendarDate('2026-09-12');

    expect([day.getFullYear(), day.getMonth(), day.getDate()]).toEqual([2026, 8, 12]);
    expect(day.getHours()).toBe(0);
  });

  it('keeps full timestamps as instants', () => {
    const iso = '2026-09-12T10:00:00Z';

    expect(parseCalendarDate(iso).getTime()).toBe(Date.parse(iso));
  });
});
