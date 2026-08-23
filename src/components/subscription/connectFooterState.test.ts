import { describe, expect, it } from 'vitest';
import { connectFooterState } from './connectFooterState';

const base = {
  status: 'active',
  subscriptionUrl: 'https://example.test/subscription',
  deviceLimit: 5,
  connected: 2,
  hasError: false,
};

describe('connectFooterState', () => {
  it('opens Connection while the subscription has a free device slot', () => {
    expect(connectFooterState(base)).toEqual({
      kind: 'connect',
      used: 2,
      limit: 5,
      unlimited: false,
      highlight: false,
    });
  });

  it('highlights a subscription with no connected devices', () => {
    expect(connectFooterState({ ...base, connected: 0 })).toMatchObject({
      kind: 'connect',
      highlight: true,
    });
  });

  it('opens device management when the limit is full or exceeded', () => {
    expect(connectFooterState({ ...base, connected: 5 })).toEqual({
      kind: 'full',
      used: 5,
      limit: 5,
    });
    expect(connectFooterState({ ...base, connected: 7 }).kind).toBe('full');
  });

  it('treats a zero device limit as unlimited', () => {
    expect(connectFooterState({ ...base, deviceLimit: 0, connected: 12 })).toEqual({
      kind: 'connect',
      used: 12,
      limit: 0,
      unlimited: true,
      highlight: false,
    });
  });

  it('keeps loading distinct from zero connected devices', () => {
    expect(connectFooterState({ ...base, connected: undefined })).toEqual({ kind: 'loading' });
  });

  it('offers retry after the device request fails without cached data', () => {
    expect(connectFooterState({ ...base, connected: undefined, hasError: true })).toEqual({
      kind: 'error',
    });
  });

  it('keeps usable cached data after a background refresh fails', () => {
    expect(connectFooterState({ ...base, hasError: true }).kind).toBe('connect');
  });

  it.each(['expired', 'disabled'])('hides the action for a %s subscription', (status) => {
    expect(connectFooterState({ ...base, status })).toEqual({ kind: 'hidden' });
  });

  it.each(['active', 'trial', 'limited'])('supports the connectable %s status', (status) => {
    expect(connectFooterState({ ...base, status }).kind).toBe('connect');
  });

  it.each([null, undefined, ''])('hides the action without a subscription URL (%s)', (url) => {
    expect(connectFooterState({ ...base, subscriptionUrl: url })).toEqual({ kind: 'hidden' });
  });
});
