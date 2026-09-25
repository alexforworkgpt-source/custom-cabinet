import { describe, expect, it } from 'vitest';
import {
  hasLegacySubscription,
  needsTariff,
  planTitle,
  showsAddonOptions,
  showsAutopayToggle,
  tariffSelectionPath,
} from './legacySubscription';

describe('needsTariff', () => {
  it('uses only the explicit Bot flag for legacy subscriptions', () => {
    expect(needsTariff({ requires_tariff_selection: true })).toBe(true);
    expect(needsTariff({ requires_tariff_selection: false })).toBe(false);
    expect(needsTariff({})).toBe(false);
    expect(needsTariff(null)).toBe(false);
    expect(needsTariff(undefined)).toBe(false);
  });
});

describe('tariffSelectionPath', () => {
  it('keeps the target subscription while opening tariff selection', () => {
    expect(tariffSelectionPath(42)).toBe('/subscription/purchase?subscriptionId=42');
  });
});

describe('showsAutopayToggle', () => {
  it('hides autopay for legacy, trial, and daily subscriptions only', () => {
    expect(
      showsAutopayToggle({ is_trial: false, is_daily: false, requires_tariff_selection: true }),
    ).toBe(false);
    expect(showsAutopayToggle({ is_trial: true, is_daily: false })).toBe(false);
    expect(showsAutopayToggle({ is_trial: false, is_daily: true })).toBe(false);
    expect(showsAutopayToggle({ is_trial: false, is_daily: false })).toBe(true);
  });
});

describe('planTitle', () => {
  it('labels only explicitly legacy subscriptions as having no tariff', () => {
    const t = (key: string) => key;

    expect(planTitle({ tariff_name: undefined, requires_tariff_selection: true }, t)).toBe(
      'subscription.legacy.noTariff',
    );
    expect(planTitle({ tariff_name: 'Basic', requires_tariff_selection: false }, t)).toBe('Basic');
    expect(planTitle({ tariff_name: undefined }, t)).toBe('subscription.currentPlan');
  });
});

describe('showsAddonOptions', () => {
  it('keeps addons only for live paid non-legacy subscriptions with device slots', () => {
    const live = { is_active: true, is_limited: false, is_trial: false, device_limit: 3 };

    expect(showsAddonOptions({ ...live, requires_tariff_selection: true })).toBe(false);
    expect(showsAddonOptions({ ...live, requires_tariff_selection: false })).toBe(true);
    expect(showsAddonOptions({ ...live, is_active: false, is_limited: true })).toBe(true);
    expect(showsAddonOptions({ ...live, is_trial: true })).toBe(false);
    expect(showsAddonOptions({ ...live, is_active: false })).toBe(false);
    expect(showsAddonOptions({ ...live, device_limit: 0 })).toBe(false);
  });
});

describe('hasLegacySubscription', () => {
  it('blocks new purchases while any returned subscription is explicitly legacy', () => {
    expect(hasLegacySubscription([{ requires_tariff_selection: true }])).toBe(true);
    expect(
      hasLegacySubscription([
        { requires_tariff_selection: false },
        { requires_tariff_selection: true },
      ]),
    ).toBe(true);
    expect(hasLegacySubscription([{ requires_tariff_selection: false }, {}])).toBe(false);
    expect(hasLegacySubscription([])).toBe(false);
    expect(hasLegacySubscription(undefined)).toBe(false);
  });
});
