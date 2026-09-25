import { describe, expect, it } from 'vitest';
import type { PanelSyncStatusResponse } from '@/api/adminUsers';
import { panelSyncRows } from './panelSyncRows';

const base: PanelSyncStatusResponse = {
  user_id: 1,
  telegram_id: 1,
  remnawave_id: 9,
  subscription_id: 2,
  subscription_tariff_name: 'Командный',
  last_sync: null,
  bot_subscription_status: 'active',
  bot_subscription_end_date: '2026-12-13T12:14:00Z',
  bot_traffic_limit_gb: 1500,
  bot_traffic_used_gb: 10,
  bot_device_limit: 10,
  bot_squads: ['a', 'b'],
  panel_found: true,
  panel_status: 'ACTIVE',
  panel_expire_at: '2026-12-13T12:14:00Z',
  panel_traffic_limit_gb: 1500,
  panel_traffic_used_gb: 10.2,
  panel_device_limit: 10,
  panel_squads: ['b', 'a'],
  has_differences: false,
  differences: [],
};

describe('panelSyncRows', () => {
  it('uses the same tolerances as Bot comparison', () => {
    expect(panelSyncRows(base).every((row) => !row.differs)).toBe(true);
    expect(
      panelSyncRows({ ...base, panel_expire_at: '2026-12-13T15:14:00Z' }).every(
        (row) => !row.differs,
      ),
    ).toBe(true);
  });

  it('marks an open grace overlay separately from real differences', () => {
    const rows = panelSyncRows({
      ...base,
      grace_open: true,
      grace_until: '2026-09-16T00:00:00Z',
      bot_subscription_status: 'expired',
      bot_subscription_end_date: '2026-09-15T00:00:00Z',
      bot_traffic_limit_gb: 300,
      bot_squads: ['own'],
      panel_status: 'ACTIVE',
      panel_expire_at: '2026-09-16T00:00:00Z',
      panel_traffic_limit_gb: 74,
      panel_squads: ['grace'],
    });

    expect(rows.filter((row) => row.differs)).toEqual([]);
    expect(
      rows
        .filter((row) => row.byGrace)
        .map((row) => row.key)
        .sort(),
    ).toEqual(['squads', 'status', 'trafficLimit', 'until']);
  });
});
