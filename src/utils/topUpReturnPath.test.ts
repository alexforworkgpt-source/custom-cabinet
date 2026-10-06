import { describe, expect, it } from 'vitest';
import { getTopUpReturnPath } from './topUpReturnPath';

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
