import { describe, expect, it } from 'vitest';
import {
  buildPromocodeBonusFields,
  getPromocodeBonusSelection,
  getPromocodeBonusValidationErrors,
} from './promocodeForm';

describe('promocode traffic bonus form', () => {
  it('builds a valid traffic-only bonus payload', () => {
    const input = {
      includeBalance: false,
      includeDays: false,
      includeGroup: false,
      includeTraffic: true,
      balanceBonusRubles: 0,
      subscriptionDays: 0,
      trafficGb: 25,
      promoGroupId: null,
    } as const;

    expect(getPromocodeBonusValidationErrors(input)).toEqual([]);
    expect(buildPromocodeBonusFields(input)).toEqual({
      type: 'balance_and_days',
      balance_bonus_kopeks: 0,
      subscription_days: 0,
      traffic_gb: 25,
      promo_group_id: null,
    });
  });

  it('keeps every selected value in a mixed bonus payload', () => {
    expect(
      buildPromocodeBonusFields({
        includeBalance: true,
        includeDays: true,
        includeGroup: true,
        includeTraffic: true,
        balanceBonusRubles: 150,
        subscriptionDays: 14,
        trafficGb: 50,
        promoGroupId: 3,
      }),
    ).toEqual({
      type: 'balance_and_days',
      balance_bonus_kopeks: 15_000,
      subscription_days: 14,
      traffic_gb: 50,
      promo_group_id: 3,
    });
  });

  it.each([0, -1, ''] as const)('rejects a selected non-positive traffic value %s', (trafficGb) => {
    expect(
      getPromocodeBonusValidationErrors({
        includeBalance: false,
        includeDays: false,
        includeGroup: false,
        includeTraffic: true,
        balanceBonusRubles: 0,
        subscriptionDays: 0,
        trafficGb,
        promoGroupId: null,
      }),
    ).toContain('trafficRequired');
  });

  it('derives checkboxes from values for a traffic-only balance_and_days record', () => {
    expect(
      getPromocodeBonusSelection({
        type: 'balance_and_days',
        balance_bonus_rubles: 0,
        subscription_days: 0,
        traffic_gb: 20,
        promo_group_id: null,
      }),
    ).toEqual({
      includeBalance: false,
      includeDays: false,
      includeGroup: false,
      includeTraffic: true,
    });
  });

  it('opens an old balance-and-days record without requiring traffic_gb', () => {
    expect(
      getPromocodeBonusSelection({
        type: 'balance_and_days',
        balance_bonus_rubles: 100,
        subscription_days: 7,
        promo_group_id: null,
      }),
    ).toEqual({
      includeBalance: true,
      includeDays: true,
      includeGroup: false,
      includeTraffic: false,
    });
  });
});
