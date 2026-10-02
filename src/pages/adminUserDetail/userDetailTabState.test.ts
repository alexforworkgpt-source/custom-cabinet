import { describe, expect, it } from 'vitest';
import { parseUserDetailTab, withUserDetailTab } from './userDetailTabState';

describe('user detail tab URL state', () => {
  it('accepts Custom tabs and falls back to info', () => {
    expect(parseUserDetailTab(new URLSearchParams('tab=subscription'))).toBe('subscription');
    expect(parseUserDetailTab(new URLSearchParams('tab=unknown'))).toBe('info');
  });

  it('keeps unrelated query values and omits the default tab', () => {
    expect(withUserDetailTab(new URLSearchParams('from=list'), 'activity').toString()).toBe(
      'from=list&tab=activity',
    );
    expect(withUserDetailTab(new URLSearchParams('from=list&tab=sync'), 'info').toString()).toBe(
      'from=list',
    );
  });
});
