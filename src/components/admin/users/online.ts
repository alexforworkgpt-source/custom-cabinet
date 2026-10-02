import type { UserListItem } from '@/api/adminUsers';
import { isConnectedNow } from '@/utils/relativeTime';

export const ONLINE_TICK_MS = 10_000;

export function isUserOnline(
  user: Pick<UserListItem, 'online_at' | 'is_online'>,
  now: number,
): boolean {
  if (user.online_at) return isConnectedNow(user.online_at, now);
  return user.online_at === undefined && user.is_online === true;
}
