import type { TFunction } from 'i18next';
import { describe, expect, it } from 'vitest';
import { deviceUnavailableText } from './deviceReasons';

const t = ((key: string, params?: Record<string, unknown>) =>
  params ? `${key}:${JSON.stringify(params)}` : key) as TFunction;

const FALLBACK = 'subscription.additionalOptions.reduceUnavailable';

describe('deviceUnavailableText', () => {
  it('hides unknown and legacy server text behind a localized fallback', () => {
    expect(
      deviceUnavailableText(
        t,
        {
          reason_code: 'brand_new_internal_code',
          reason: 'SQLSTATE 23505: internal provider detail',
        },
        FALLBACK,
      ),
    ).toBe(FALLBACK);
    expect(deviceUnavailableText(t, { reason: 'Already at minimum device limit' }, FALLBACK)).toBe(
      FALLBACK,
    );
    expect(deviceUnavailableText(t, undefined, FALLBACK)).toBe(FALLBACK);
  });

  it('maps the minimum-limit code to a stable locale key', () => {
    expect(
      deviceUnavailableText(
        t,
        {
          reason_code: 'at_minimum',
          reason: 'Already at minimum device limit',
          min_device_limit: 1,
        },
        FALLBACK,
      ),
    ).toBe('subscription.additionalOptions.alreadyAtMinDeviceLimit');
  });

  it('maps every supported code and interpolates server-owned limits', () => {
    expect(deviceUnavailableText(t, { reason_code: 'no_subscription' }, FALLBACK)).toBe(
      'subscription.additionalOptions.reasons.noSubscription',
    );
    expect(deviceUnavailableText(t, { reason_code: 'no_active_subscription' }, FALLBACK)).toBe(
      'subscription.additionalOptions.reasons.noActiveSubscription',
    );
    expect(deviceUnavailableText(t, { reason_code: 'devices_unavailable' }, FALLBACK)).toBe(
      'subscription.additionalOptions.devicesUnavailable',
    );
    expect(deviceUnavailableText(t, { reason_code: 'trial' }, FALLBACK)).toBe(
      'subscription.additionalOptions.reasons.trialNotAllowed',
    );
    expect(
      deviceUnavailableText(
        t,
        { reason_code: 'max_devices_reached', max_device_limit: 5 },
        FALLBACK,
      ),
    ).toBe('subscription.additionalOptions.reasons.maxDevicesReached:{"count":5}');
    expect(deviceUnavailableText(t, { reason_code: 'can_add_limited', can_add: 2 }, FALLBACK)).toBe(
      'subscription.additionalOptions.reasons.canAddLimited:{"count":2}',
    );
  });
});
