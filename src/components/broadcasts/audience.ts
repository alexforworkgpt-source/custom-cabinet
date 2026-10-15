import type { BroadcastAudience, BroadcastFilter, TariffFilter } from '../../api/adminBroadcasts';

export type Channel = 'telegram' | 'email';
export type Category = 'system' | 'news' | 'promo';
export type Filter = BroadcastFilter | TariffFilter;

export type UserField = 'telegram_id' | 'telegram_username' | 'email_user';
export type FieldKind = 'select' | 'fixed' | 'number' | 'date' | 'user';
export interface FieldChoice {
  field: string;
  label: string;
  kind: FieldKind;
  values?: { value: string; label: string }[];
}

const DATE_FIELDS = new Set(['registration_date', 'activity_date', 'subscription_end_date']);
const NUMBER_FIELDS = new Set(['traffic_gt', 'traffic_lt']);
let nextRowId = 0;
export const rowId = () => String(++nextRowId);

export const emptyAudience = (): BroadcastAudience => ({
  conditions: [{ client_id: rowId(), field: '', operator: 'eq', value: '', join: null }],
});

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export const isAudienceComplete = (audience: BroadcastAudience): boolean =>
  audience.conditions.length > 0 &&
  audience.conditions.every((condition) => {
    if (!condition.field || !condition.value) return false;
    if (DATE_FIELDS.has(condition.field)) {
      if (!isIsoDate(condition.value)) return false;
      return (
        condition.operator !== 'between' ||
        (!!condition.value_to &&
          isIsoDate(condition.value_to) &&
          condition.value_to >= condition.value)
      );
    }
    if (NUMBER_FIELDS.has(condition.field)) {
      const value = Number(condition.value);
      return Number.isFinite(value) && value >= 0 && value <= 1_000_000;
    }
    return true;
  });
