import { describe, expect, it } from 'vitest';
import type { UserSubscriptionInfo } from '@/api/adminUsers';
import { isLiveSubscription, salesModeOf, selectSubscription } from './salesMode';

const sub = (extra: Partial<UserSubscriptionInfo> = {}) =>
  ({ id: 1, status: 'active', is_active: true, ...extra }) as UserSubscriptionInfo;

describe('salesModeOf', () => {
  it('honours classic, tariff and multi-tariff Bot contracts', () => {
    expect(
      salesModeOf({ sales_mode: 'classic', multi_tariff_enabled: true, subscriptions: [] }),
    ).toBe('classic');
    expect(
      salesModeOf({ sales_mode: 'tariffs', multi_tariff_enabled: false, subscriptions: [sub()] }),
    ).toBe('tariffs');
    expect(
      salesModeOf({ sales_mode: 'tariffs', multi_tariff_enabled: true, subscriptions: [sub()] }),
    ).toBe('multi');
    expect(salesModeOf({ subscriptions: [sub(), sub({ id: 2 })] })).toBe('multi');
  });

  it('treats active, trial and limited subscriptions as live', () => {
    expect(isLiveSubscription(sub())).toBe(true);
    expect(isLiveSubscription(sub({ status: 'trial', is_active: false }))).toBe(true);
    expect(isLiveSubscription(sub({ status: 'limited', is_active: false }))).toBe(true);
    expect(isLiveSubscription(sub({ status: 'expired', is_active: false }))).toBe(false);
  });
});

describe('selectSubscription', () => {
  it('never falls back to another subscription when an explicit id is selected', () => {
    const first = sub({ id: 1 });
    const second = sub({ id: 2 });

    expect(selectSubscription([first, second], 2, first)).toBe(second);
    expect(selectSubscription([first, second], 99, first)).toBeNull();
    expect(selectSubscription([first, second], null, first)).toBe(first);
  });
});
