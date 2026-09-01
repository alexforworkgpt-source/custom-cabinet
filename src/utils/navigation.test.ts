import { describe, expect, it } from 'vitest';
import { getFallbackParentPath } from './navigation';

describe('getFallbackParentPath', () => {
  it('keeps instruction deep links inside their Profile information flow', () => {
    expect(getFallbackParentPath('/instructions/connect-android')).toBe('/instructions');
    expect(getFallbackParentPath('/instructions')).toBe('/profile');
  });
});
