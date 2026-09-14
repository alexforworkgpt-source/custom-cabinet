export type RecurringFeatureKey = 'platega_recurrent_enabled' | 'lava_recurrent_enabled';

/** Старые Bot версии не присылают флаг: тогда сохраняем прежнюю 403-пробу. */
export function isRecurringFeatureOff(purchaseOptions: unknown, key: RecurringFeatureKey): boolean {
  if (!purchaseOptions || typeof purchaseOptions !== 'object') return false;
  const options = purchaseOptions as Record<string, unknown>;
  return key in options && options[key] === false;
}
