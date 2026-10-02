import { safeSession } from './safeStorage';
import type { Subscription } from '../types';

const KEY = 'cabinet-renewal-selection';
interface Intent {
  periodDays: number;
  signature: string;
}
interface SavedSelection {
  userId: number;
  subscriptions: Record<string, Intent>;
}

// Only intent is stored. Prices, balance and payment confirmation are never persisted.
export function renewalSignature(subscription: Subscription, salesMode: string): string {
  return JSON.stringify([
    salesMode,
    subscription.end_date,
    subscription.status,
    subscription.tariff_id ?? null,
    subscription.is_trial,
    Boolean(subscription.is_daily),
    subscription.is_limited,
    Boolean(subscription.requires_tariff_selection),
    subscription.traffic_limit_gb,
    subscription.device_limit,
    subscription.connected_squads,
  ]);
}

export function readRenewalSelection(userId: number, subscriptionId: number): Intent | null {
  const saved = safeSession.getJson<SavedSelection | null>(KEY, null);
  const intent = saved?.userId === userId ? saved.subscriptions?.[subscriptionId] : null;
  return intent &&
    Number.isInteger(intent.periodDays) &&
    intent.periodDays > 0 &&
    typeof intent.signature === 'string'
    ? intent
    : null;
}

export function saveRenewalSelection(
  userId: number,
  subscriptionId: number,
  intent: Intent | null,
): void {
  const saved = safeSession.getJson<SavedSelection | null>(KEY, null);
  const subscriptions = saved?.userId === userId ? { ...saved.subscriptions } : {};
  if (intent) subscriptions[subscriptionId] = intent;
  else delete subscriptions[subscriptionId];
  safeSession.setJson(KEY, { userId, subscriptions });
}

export function clearRenewalSelections(): void {
  safeSession.removeItem(KEY);
}
