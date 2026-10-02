export type RelativeKey =
  | 'now'
  | 'minutes'
  | 'hours'
  | 'yesterday'
  | 'days'
  | 'weeks'
  | 'months'
  | 'never';

export interface RelativeTimeParts {
  key: RelativeKey;
  count: number;
}

export const PANEL_ONLINE_WINDOW_MS = 60_000;
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function isConnectedNow(
  onlineAt: string | null | undefined,
  now: number = Date.now(),
): boolean {
  if (!onlineAt) return false;
  const timestamp = new Date(onlineAt).getTime();
  return !Number.isNaN(timestamp) && now - timestamp <= PANEL_ONLINE_WINDOW_MS;
}

export function relativeTimeParts(
  value: string | null | undefined,
  now: number = Date.now(),
): RelativeTimeParts {
  if (!value) return { key: 'never', count: 0 };
  const timestamp = new Date(value).getTime();
  if (Number.isNaN(timestamp)) return { key: 'never', count: 0 };

  const diff = Math.max(0, now - timestamp);
  const minutes = Math.floor(diff / MINUTE);
  if (minutes < 1) return { key: 'now', count: 0 };
  if (minutes < 60) return { key: 'minutes', count: minutes };
  const hours = Math.floor(diff / HOUR);
  if (hours < 24) return { key: 'hours', count: hours };
  const days = Math.floor(diff / DAY);
  if (days === 1) return { key: 'yesterday', count: 1 };
  if (days < 14) return { key: 'days', count: days };
  if (days < 60) return { key: 'weeks', count: Math.floor(days / 7) };
  return { key: 'months', count: Math.floor(days / 30) };
}
