import { safeSession } from './safeStorage';
import type { Subscription } from '@/types';

const KEY = 'cabinet-device-intent';
export interface DeviceIntent {
  targetLimit: number;
  signature: string;
  blockedCart?: boolean;
}
interface SavedIntents {
  userId: number;
  subscriptions: Record<string, DeviceIntent>;
}
export function deviceSignature(subscription: Subscription): string {
  return JSON.stringify([
    subscription.id,
    subscription.end_date,
    subscription.status,
    subscription.device_limit,
    subscription.tariff_id ?? null,
    subscription.is_trial,
    subscription.is_active,
  ]);
}
export function readDeviceIntent(userId: number, subscriptionId: number): DeviceIntent | null {
  const saved = safeSession.getJson<SavedIntents | null>(KEY, null);
  const intent = saved?.userId === userId ? saved.subscriptions?.[subscriptionId] : null;
  return intent &&
    Number.isInteger(intent.targetLimit) &&
    intent.targetLimit > 0 &&
    typeof intent.signature === 'string'
    ? intent
    : null;
}
export function saveDeviceIntent(
  userId: number,
  subscriptionId: number,
  intent: DeviceIntent | null,
): void {
  const saved = safeSession.getJson<SavedIntents | null>(KEY, null);
  const subscriptions = saved?.userId === userId ? { ...saved.subscriptions } : {};
  if (intent) subscriptions[subscriptionId] = intent;
  else delete subscriptions[subscriptionId];
  safeSession.setJson(KEY, { userId, subscriptions });
}
export function clearDeviceIntents(): void {
  safeSession.removeItem(KEY);
}
