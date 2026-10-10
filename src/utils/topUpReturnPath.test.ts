import { describe, expect, it } from 'vitest';
import { getReadyTopUpClosePath, getTopUpReturnPath } from './topUpReturnPath';

describe('top-up exit destination', () => {
  it('preserves an internal task with its selection', () => {
    expect(getTopUpReturnPath('/subscriptions/42/renew?period=90')).toBe(
      '/subscriptions/42/renew?period=90',
    );
  });

  it.each([
    undefined,
    '//example.test',
    'https://example.test',
    '/\\example.test',
    '/balance/top-up/test-card',
  ])('falls back to Balance for %s', (path) => {
    expect(getTopUpReturnPath(path)).toBe('/balance');
  });

  it('does not reopen a top-up step through a normalized path', () => {
    expect(getTopUpReturnPath('/profile/../balance/top-up')).toBe('/balance');
  });

  it('returns to Home when it was explicitly supplied as the source', () => {
    expect(getTopUpReturnPath('/')).toBe('/');
  });
});

describe('closing a ready payment', () => {
  it.each([
    ['/subscriptions/42/renew?period=90', '/?sub=42'],
    ['/subscriptions/42?section=additional-options', '/?sub=42'],
    ['/subscriptions/42?overlay=devices', '/?sub=42'],
    ['/subscription/42', '/?sub=42'],
    ['/subscription/purchase?subscriptionId=42', '/?sub=42'],
    ['/subscription/purchase', '/'],
    ['/?sub=42&overlay=devices', '/?sub=42'],
    ['/connection?sub=42', '/?sub=42'],
    ['/balance', '/'],
    ['/balance/top-up/test-card', '/'],
    ['/profile', '/profile'],
    ['/subscriptions/0/renew', '/'],
    ['/subscriptions/unknown/renew', '/'],
    ['/subscriptions/-1', '/'],
    ['/subscription/unknown', '/'],
    ['/subscription/purchase?subscriptionId=invalid', '/'],
    ['/subscriptions/9007199254740992/renew', '/'],
    ['https://example.test', '/'],
    ['/profile/../balance', '/'],
    [undefined, '/'],
  ])('closes %s to %s without reopening a flow', (source, destination) => {
    expect(getReadyTopUpClosePath(source)).toBe(destination);
  });
  it('does not select a subscription absent from the loaded account', () => {
    expect(getReadyTopUpClosePath('/subscriptions/42/renew', [1, 2])).toBe('/');
    expect(getReadyTopUpClosePath('/subscription/purchase?subscriptionId=42', [])).toBe('/');
    expect(getReadyTopUpClosePath('/subscriptions/42?section=additional-options', [42])).toBe(
      '/?sub=42',
    );
  });
});
