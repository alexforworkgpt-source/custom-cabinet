import { expect, it } from 'vitest';
import { isAudienceComplete } from './audience';

it('accepts zero traffic and rejects nonfinite or negative traffic', () => {
  const check = (value: string) =>
    isAudienceComplete({
      conditions: [{ field: 'traffic_gt', operator: 'eq', value, join: null }],
    });
  expect(check('0')).toBe(true);
  expect(check('-1')).toBe(false);
  expect(check('Infinity')).toBe(false);
});

it('requires two real dates in ascending order for a range', () => {
  const check = (value: string, value_to: string) =>
    isAudienceComplete({
      conditions: [
        { field: 'registration_date', operator: 'between', value, value_to, join: null },
      ],
    });
  expect(check('2026-10-01', '2026-10-13')).toBe(true);
  expect(check('2026-10-13', '2026-10-01')).toBe(false);
  expect(check('2026-10-01', '')).toBe(false);
  expect(check('2026-02-30', '2026-10-13')).toBe(false);
  expect(check('2026-10-01', 'invalid')).toBe(false);
});
