import { describe, expect, it } from 'vitest';
import {
  getCabinetClosePath,
  getDirectCabinetBackPath,
  getDirectConnectionBackPath,
  getUserCabinetRouteState,
} from './userCabinetRouteState';

describe('getUserCabinetRouteState', () => {
  it('opens the connection overlay from the legacy route', () => {
    expect(getUserCabinetRouteState('/connection', '?sub=42')).toEqual({
      overlay: 'connection',
      subscriptionId: 42,
    });
  });

  it('rejects invalid subscription ids', () => {
    expect(getUserCabinetRouteState('/connection', '?sub=NaN')).toEqual({
      overlay: 'connection',
      subscriptionId: undefined,
    });
  });

  it('keeps payment result routes outside the cabinet overlay', () => {
    expect(getUserCabinetRouteState('/balance/top-up/result', '')).toEqual({ overlay: null });
  });

  it('opens legacy balance details without starting a new top-up', () => {
    expect(getUserCabinetRouteState('/balance', '')).toEqual({ overlay: 'balance' });
  });

  it('opens subscription management from its compatibility route', () => {
    expect(getUserCabinetRouteState('/subscriptions/7', '')).toEqual({
      overlay: 'subscription',
      subscriptionId: 7,
    });
  });

  it('opens devices without losing the selected subscription', () => {
    expect(getUserCabinetRouteState('/', '?sub=7&overlay=devices')).toEqual({
      overlay: 'devices',
      subscriptionId: 7,
    });
  });

  it('opens devices from subscription management and preserves its parent route', () => {
    expect(getUserCabinetRouteState('/subscriptions/7', '?overlay=devices')).toEqual({
      overlay: 'devices',
      subscriptionId: 7,
      closePath: '/subscriptions/7',
    });
  });
});

describe('getDirectConnectionBackPath', () => {
  it('restores the previous wizard step after a direct reload', () => {
    expect(getDirectConnectionBackPath('?sub=7&step=success')).toBe('/connection?sub=7&step=add');
    expect(getDirectConnectionBackPath('?sub=7&step=success&platform=android&app=Happ')).toBe(
      '/connection?sub=7&step=add&platform=android&app=Happ',
    );
    expect(getDirectConnectionBackPath('?sub=7&step=add&platform=android&app=Happ')).toBe(
      '/connection?sub=7&step=application&platform=android&app=Happ',
    );
    expect(getDirectConnectionBackPath('?sub=7&step=application&platform=android')).toBe(
      '/connection?sub=7&step=platform&platform=android',
    );
  });
});

describe('getCabinetClosePath', () => {
  it('preserves the selected subscription when closing an overlay', () => {
    expect(getCabinetClosePath(7)).toBe('/?sub=7');
    expect(getCabinetClosePath()).toBe('/');
  });
});

describe('getDirectCabinetBackPath', () => {
  it('closes a directly opened devices overlay while preserving its subscription', () => {
    expect(getDirectCabinetBackPath('/', '?sub=7&overlay=devices')).toBe('/?sub=7');
  });

  it('returns nested devices to subscription management', () => {
    expect(getDirectCabinetBackPath('/subscriptions/7', '?overlay=devices')).toBe(
      '/subscriptions/7',
    );
  });

  it('closes directly opened subscription management', () => {
    expect(getDirectCabinetBackPath('/subscriptions/7', '')).toBe('/?sub=7');
  });

  it('moves through direct connection steps before closing the overlay', () => {
    expect(
      getDirectCabinetBackPath('/connection', '?sub=7&step=success&platform=android&app=Happ'),
    ).toBe('/connection?sub=7&step=add&platform=android&app=Happ');
    expect(getDirectCabinetBackPath('/connection', '?sub=7&step=platform')).toBe('/?sub=7');
  });
});
