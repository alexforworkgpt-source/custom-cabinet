import { describe, expect, it } from 'vitest';
import type { UserActivityItem } from '@/api/adminUsers';
import { describeItem } from './activityLabels';

const t = (key: string) => key;
const item = (overrides: Partial<UserActivityItem>): UserActivityItem =>
  ({
    type: 'cabinet_action',
    subtype: null,
    source: 'cabinet',
    title: null,
    amount_kopeks: null,
    timestamp: '2026-09-13T00:00:00Z',
    meta: null,
    ...overrides,
  }) as UserActivityItem;

describe('activity labels', () => {
  it('maps screens, actions and safe message kinds while preserving unknown events', () => {
    expect(
      describeItem(item({ subtype: 'screen', title: '/subscriptions/{id}' }), t),
    ).toMatchObject({
      typeLabel: 'admin.users.detail.activity.types.screen',
      title: 'admin.users.detail.activity.screens.subscription',
    });
    expect(describeItem(item({ title: 'POST /cabinet/subscription/trial' }), t).title).toBe(
      'admin.users.detail.activity.actions.trial',
    );
    expect(
      describeItem(item({ type: 'button_click', subtype: 'message', title: 'photo' }), t).title,
    ).toBe('admin.users.detail.activity.messageKinds.photo');
    expect(describeItem(item({ title: 'POST /cabinet/unknown' }), t).title).toBe(
      'POST /cabinet/unknown',
    );
  });
});
