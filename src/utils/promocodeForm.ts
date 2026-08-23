import type { PromoCodeCreateRequest, PromoCodeType } from '../api/promocodes';

type NumberInputValue = number | '';

export interface PromocodeBonusSelection {
  includeBalance: boolean;
  includeDays: boolean;
  includeGroup: boolean;
  includeTraffic: boolean;
}

export interface PromocodeBonusInput extends PromocodeBonusSelection {
  balanceBonusRubles: NumberInputValue;
  subscriptionDays: NumberInputValue;
  trafficGb: NumberInputValue;
  promoGroupId: number | null;
}

interface PromocodeBonusRecord {
  type: PromoCodeType;
  balance_bonus_rubles?: number | null;
  subscription_days?: number | null;
  traffic_gb?: number | null;
  promo_group_id?: number | null;
}

type PromocodeBonusFields = Required<
  Pick<
    PromoCodeCreateRequest,
    'type' | 'balance_bonus_kopeks' | 'subscription_days' | 'traffic_gb' | 'promo_group_id'
  >
>;

const numberValue = (value: NumberInputValue): number => (value === '' ? 0 : value);

export function getPromocodeBonusSelection(
  promocode: PromocodeBonusRecord,
): PromocodeBonusSelection {
  return {
    includeBalance: promocode.type === 'balance' || (promocode.balance_bonus_rubles ?? 0) > 0,
    includeDays: promocode.type === 'subscription_days' || (promocode.subscription_days ?? 0) > 0,
    includeGroup: promocode.type === 'promo_group' || Boolean(promocode.promo_group_id),
    includeTraffic: (promocode.traffic_gb ?? 0) > 0,
  };
}

export function getPromocodeBonusValidationErrors(input: PromocodeBonusInput): string[] {
  const errors: string[] = [];

  if (!input.includeBalance && !input.includeDays && !input.includeGroup && !input.includeTraffic) {
    errors.push('bonusSetEmpty');
  }
  if (input.includeBalance && numberValue(input.balanceBonusRubles) <= 0) {
    errors.push('balanceRequired');
  }
  if (input.includeDays && numberValue(input.subscriptionDays) <= 0) {
    errors.push('daysRequired');
  }
  if (input.includeGroup && !input.promoGroupId) {
    errors.push('groupRequired');
  }
  if (input.includeTraffic && numberValue(input.trafficGb) <= 0) {
    errors.push('trafficRequired');
  }

  return errors;
}

export function buildPromocodeBonusFields(input: PromocodeBonusInput): PromocodeBonusFields {
  const type: PromoCodeType =
    input.includeTraffic || (input.includeBalance && input.includeDays)
      ? 'balance_and_days'
      : input.includeBalance
        ? 'balance'
        : input.includeDays
          ? 'subscription_days'
          : 'promo_group';

  return {
    type,
    balance_bonus_kopeks: input.includeBalance
      ? Math.round(numberValue(input.balanceBonusRubles) * 100)
      : 0,
    subscription_days: input.includeDays ? numberValue(input.subscriptionDays) : 0,
    traffic_gb: input.includeTraffic ? numberValue(input.trafficGb) : 0,
    promo_group_id: input.includeGroup ? input.promoGroupId : null,
  };
}
