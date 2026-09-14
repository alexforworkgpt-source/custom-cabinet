import { describe, expect, it } from 'vitest';
import { isRecurringFeatureOff } from './recurringFeature';

describe('isRecurringFeatureOff', () => {
  it('treats only an explicit false flag as disabled', () => {
    expect(
      isRecurringFeatureOff({ platega_recurrent_enabled: false }, 'platega_recurrent_enabled'),
    ).toBe(true);
    expect(
      isRecurringFeatureOff({ platega_recurrent_enabled: true }, 'platega_recurrent_enabled'),
    ).toBe(false);
    expect(isRecurringFeatureOff({}, 'platega_recurrent_enabled')).toBe(false);
  });
});
