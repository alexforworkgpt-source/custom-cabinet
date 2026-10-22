import type { Subscription } from '@/types';

/** Presentation guidance only; device availability and prices remain API-owned. */
export function renewalDeviceGuidance(
  subscription: Subscription,
  maxDeviceLimit?: number,
): string | null {
  if (
    subscription.is_trial ||
    subscription.is_daily ||
    subscription.requires_tariff_selection ||
    subscription.device_limit <= 0
  )
    return null;
  const expired = subscription.is_expired || subscription.status === 'expired';
  const current =
    subscription.is_active ||
    subscription.is_limited ||
    subscription.status === 'active' ||
    subscription.status === 'limited';
  if (!expired && !current) return null;
  if (
    maxDeviceLimit !== undefined &&
    Number.isSafeInteger(maxDeviceLimit) &&
    maxDeviceLimit > 0 &&
    subscription.device_limit >= maxDeviceLimit
  )
    return 'subscription.renewDevicesMaxHint';
  if (expired) return 'subscription.renewDevicesExpiredHint';
  return 'subscription.renewDevicesActiveHint';
}
