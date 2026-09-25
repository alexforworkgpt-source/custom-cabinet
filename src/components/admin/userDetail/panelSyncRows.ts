import type { PanelSyncStatusResponse } from '@/api/adminUsers';

export type SyncRowKey = 'status' | 'until' | 'trafficLimit' | 'trafficUsed' | 'devices' | 'squads';

export interface SyncRow {
  key: SyncRowKey;
  differs: boolean;
  byGrace: boolean;
}

const HOUR_MS = 3_600_000;
const MSK_OFFSET_MS = 3 * HOUR_MS;
const MSK_TOLERANCE_MS = 5 * 60_000;
const TRAFFIC_LIMIT_TOLERANCE_GB = 1;
const TRAFFIC_USED_TOLERANCE_GB = 0.5;
const BOT_LIVE = new Set(['active', 'trial']);
const GRACE_OWNED: ReadonlySet<SyncRowKey> = new Set(['status', 'until', 'trafficLimit', 'squads']);

function datesDiffer(bot: string | null, panel: string | null): boolean {
  if (!bot || !panel) return false;
  const diff = Math.abs(new Date(bot).getTime() - new Date(panel).getTime());
  return diff > HOUR_MS && Math.abs(diff - MSK_OFFSET_MS) >= MSK_TOLERANCE_MS;
}

function setsDiffer(a: string[] | null | undefined, b: string[] | null | undefined): boolean {
  const left = new Set(a ?? []);
  const right = new Set(b ?? []);
  if (left.size !== right.size) return true;
  for (const value of left) if (!right.has(value)) return true;
  return false;
}

export function panelSyncRows(status: PanelSyncStatusResponse): SyncRow[] {
  const statusDiffers =
    status.bot_subscription_status !== null &&
    status.panel_status !== null &&
    BOT_LIVE.has(status.bot_subscription_status) !==
      (status.panel_status.toUpperCase() === 'ACTIVE');
  const rows: Omit<SyncRow, 'byGrace'>[] = [
    { key: 'status', differs: statusDiffers },
    {
      key: 'until',
      differs: datesDiffer(status.bot_subscription_end_date, status.panel_expire_at),
    },
    {
      key: 'trafficLimit',
      differs:
        Math.abs(status.bot_traffic_limit_gb - status.panel_traffic_limit_gb) >
        TRAFFIC_LIMIT_TOLERANCE_GB,
    },
    {
      key: 'trafficUsed',
      differs:
        Math.abs(status.bot_traffic_used_gb - status.panel_traffic_used_gb) >
        TRAFFIC_USED_TOLERANCE_GB,
    },
    { key: 'devices', differs: status.bot_device_limit !== status.panel_device_limit },
    { key: 'squads', differs: setsDiffer(status.bot_squads, status.panel_squads) },
  ];
  const grace = Boolean(status.grace_open);
  return rows.map((row) => {
    const byGrace = grace && row.differs && GRACE_OWNED.has(row.key);
    return { ...row, byGrace, differs: row.differs && !byGrace };
  });
}
