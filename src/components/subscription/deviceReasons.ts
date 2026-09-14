import type { TFunction } from 'i18next';

export interface DeviceReasonInfo {
  reason?: string | null;
  reason_code?: string | null;
  max_device_limit?: number | null;
  can_add?: number | null;
  min_device_limit?: number | null;
}

type KnownDeviceReasonCode =
  | 'at_minimum'
  | 'can_add_limited'
  | 'devices_unavailable'
  | 'max_devices_reached'
  | 'no_active_subscription'
  | 'no_subscription'
  | 'trial';

type ReasonTranslation = readonly [key: string, params?: Record<string, number>];

const REASON_TRANSLATIONS: Record<
  KnownDeviceReasonCode,
  (info: DeviceReasonInfo) => ReasonTranslation
> = {
  at_minimum: () => ['subscription.additionalOptions.alreadyAtMinDeviceLimit'],
  can_add_limited: (info) => [
    'subscription.additionalOptions.reasons.canAddLimited',
    { count: info.can_add ?? 0 },
  ],
  devices_unavailable: () => ['subscription.additionalOptions.devicesUnavailable'],
  max_devices_reached: (info) => [
    'subscription.additionalOptions.reasons.maxDevicesReached',
    { count: info.max_device_limit ?? 0 },
  ],
  no_active_subscription: () => ['subscription.additionalOptions.reasons.noActiveSubscription'],
  no_subscription: () => ['subscription.additionalOptions.reasons.noSubscription'],
  trial: () => ['subscription.additionalOptions.reasons.trialNotAllowed'],
};

const KNOWN_DEVICE_REASON_CODES = new Set<string>(Object.keys(REASON_TRANSLATIONS));

function isKnownDeviceReasonCode(code: string): code is KnownDeviceReasonCode {
  return KNOWN_DEVICE_REASON_CODES.has(code);
}

export function deviceUnavailableText(
  t: TFunction,
  info: DeviceReasonInfo | undefined,
  fallbackKey: string,
): string {
  if (info?.reason_code && isKnownDeviceReasonCode(info.reason_code)) {
    const [key, params] = REASON_TRANSLATIONS[info.reason_code](info);
    return params ? t(key, params) : t(key);
  }
  return t(fallbackKey);
}
