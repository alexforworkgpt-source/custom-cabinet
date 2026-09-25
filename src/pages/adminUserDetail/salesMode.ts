import type { UserDetailResponse, UserSubscriptionInfo } from '@/api/adminUsers';

export type SalesMode = 'classic' | 'tariffs' | 'multi';

type ModeSource = Pick<UserDetailResponse, 'sales_mode' | 'multi_tariff_enabled' | 'subscriptions'>;

export function salesModeOf(user: ModeSource): SalesMode {
  if (user.sales_mode === 'classic') return 'classic';
  if (user.multi_tariff_enabled ?? user.subscriptions.length > 1) return 'multi';
  return 'tariffs';
}

export function isLiveSubscription(
  sub: Pick<UserSubscriptionInfo, 'status' | 'is_active'>,
): boolean {
  return sub.is_active || sub.status === 'trial' || sub.status === 'limited';
}

export function selectSubscription(
  subscriptions: UserSubscriptionInfo[],
  selectedId: number | null,
  primary: UserSubscriptionInfo | null,
): UserSubscriptionInfo | null {
  if (selectedId !== null) {
    return subscriptions.find((subscription) => subscription.id === selectedId) ?? null;
  }
  return primary ?? subscriptions[0] ?? null;
}
