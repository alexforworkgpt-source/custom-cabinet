export const USER_DETAIL_TABS = [
  'info',
  'subscription',
  'balance',
  'sync',
  'tickets',
  'gifts',
  'referrals',
  'activity',
] as const;

export type UserDetailTab = (typeof USER_DETAIL_TABS)[number];

export function parseUserDetailTab(params: URLSearchParams): UserDetailTab {
  const value = params.get('tab');
  return USER_DETAIL_TABS.includes(value as UserDetailTab) ? (value as UserDetailTab) : 'info';
}

export function withUserDetailTab(params: URLSearchParams, tab: UserDetailTab): URLSearchParams {
  const next = new URLSearchParams(params);
  if (tab === 'info') next.delete('tab');
  else next.set('tab', tab);
  return next;
}
