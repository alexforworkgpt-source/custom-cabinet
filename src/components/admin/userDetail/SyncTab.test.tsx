// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PanelSyncStatusResponse, UserDetailResponse } from '@/api/adminUsers';
import { SyncTab } from './SyncTab';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const status: PanelSyncStatusResponse = {
  user_id: 1,
  telegram_id: 10,
  remnawave_id: 4,
  subscription_id: 7,
  subscription_tariff_name: 'Командный',
  last_sync: null,
  bot_subscription_status: 'expired',
  bot_subscription_end_date: '2026-09-15T00:00:00Z',
  bot_traffic_limit_gb: 300,
  bot_traffic_used_gb: 5,
  bot_device_limit: 3,
  bot_squads: ['own'],
  panel_found: true,
  panel_status: 'ACTIVE',
  panel_expire_at: '2026-09-16T00:00:00Z',
  panel_traffic_limit_gb: 74,
  panel_traffic_used_gb: 5,
  panel_device_limit: 3,
  panel_squads: ['grace'],
  grace_open: true,
  grace_until: '2026-09-16T00:00:00Z',
  has_differences: true,
  differences: ['legacy backend wording'],
};

describe('SyncTab grace comparison', () => {
  it('explains a grace overlay instead of reporting a real panel difference', () => {
    render(
      <SyncTab
        user={{ remnawave_id: 4 } as UserDetailResponse}
        syncStatus={status}
        userSubscriptions={[]}
        activeSubscriptionId={null}
        onActiveSubscriptionChange={() => {}}
        actionLoading={false}
        onSyncFromPanel={() => {}}
        onSyncToPanel={() => {}}
        locale="ru-RU"
      />,
    );

    expect(screen.getByText('admin.users.detail.sync.graceOverlay')).toBeTruthy();
    expect(screen.queryByText('admin.users.detail.sync.hasDifferences')).toBeNull();
    expect(screen.getAllByText(/admin.users.detail.sync.byGrace/).length).toBeGreaterThan(0);
  });
});
