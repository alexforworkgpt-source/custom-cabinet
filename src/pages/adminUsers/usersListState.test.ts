import { describe, expect, it } from 'vitest';
import {
  DEFAULT_STATE,
  applyView,
  buildUsersQuery,
  classifySearch,
  parseUsersListState,
  serializeUsersListState,
  sortDirection,
  sortKeysForView,
  withSort,
} from './usersListState';

describe('admin users list state', () => {
  it('classifies one search field for the API', () => {
    expect(classifySearch(' 453205530 ')).toEqual({ search: '453205530' });
    expect(classifySearch('@operator')).toEqual({ search: 'operator' });
    expect(classifySearch('user@example.com')).toEqual({ email: 'user@example.com' });
    expect(classifySearch('Марина')).toEqual({ search: 'Марина' });
    expect(classifySearch('@')).toEqual({});
  });

  it('round-trips filters through the URL and ignores invalid values', () => {
    const params = new URLSearchParams(
      'q=%40olga&sub=expiring&tariff=3%2C1&sort=activity&dir=asc&view=expiring',
    );
    const state = parseUsersListState(params);

    expect(state).toMatchObject({
      q: '@olga',
      sub: 'expiring',
      tariff: '3,1',
      sort: 'activity',
      dir: 'asc',
      view: 'expiring',
    });
    expect(serializeUsersListState(state).toString()).toBe(params.toString());
    expect(parseUsersListState(new URLSearchParams('view=bad&sort=bad'))).toEqual(DEFAULT_STATE);
  });

  it('maps segments to exact Bot v4.15 filters', () => {
    expect(buildUsersQuery(applyView(DEFAULT_STATE, 'expiring'))).toMatchObject({
      subscription_status: 'active',
      expires_within_days: 7,
      sort_by: 'subscription_end_date',
    });
    expect(buildUsersQuery(applyView(DEFAULT_STATE, 'grace'))).toMatchObject({
      in_grace: true,
      sort_by: 'grace_until',
    });
    expect(buildUsersQuery(applyView(DEFAULT_STATE, 'online'))).toMatchObject({
      online: true,
      sort_by: 'last_activity',
    });
    expect(buildUsersQuery(applyView(DEFAULT_STATE, 'traffic'))).toMatchObject({
      traffic_used_percent_min: 80,
      sort_by: 'traffic',
    });
    expect(buildUsersQuery(applyView(DEFAULT_STATE, 'nopay'))).toMatchObject({
      purchase_count: 0,
    });
    expect(buildUsersQuery({ ...DEFAULT_STATE, sub: 'none' })).toMatchObject({
      has_subscription: false,
    });
  });

  it('keeps grace sorting inside the grace segment and serializes reversed direction', () => {
    expect(sortKeysForView('all')).not.toContain('grace');
    expect(sortKeysForView('grace')).toContain('grace');
    expect(parseUsersListState(new URLSearchParams('sort=grace')).sort).toBe('created');

    const reversed = withSort(applyView(DEFAULT_STATE, 'grace'), 'grace', 'desc');
    expect(sortDirection(reversed)).toBe('desc');
    expect(buildUsersQuery(reversed)).toMatchObject({
      in_grace: true,
      sort_by: 'grace_until',
      sort_order: 'desc',
    });
    expect(serializeUsersListState(reversed).get('dir')).toBe('desc');
  });
});
