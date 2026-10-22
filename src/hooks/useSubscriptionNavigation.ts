import { useQuery } from '@tanstack/react-query';
import { subscriptionApi } from '@/api/subscription';
import type { MobileNavItem } from '@/components/layout/AppShell/mobileNavRoutes';

/** One authoritative destination for the subscription slot in both menus. */
export function useSubscriptionNavigation(enabled = true): MobileNavItem {
  const query = useQuery({
    queryKey: ['subscriptions-list'],
    queryFn: () => subscriptionApi.getSubscriptions(),
    enabled,
    retry: false,
    staleTime: 30_000,
  });
  if (!enabled) return { key: 'tariffs', path: '/subscription/purchase' };
  if (!query.isSuccess) {
    return {
      key: 'tariffs',
      path: '/subscriptions',
      labelKey: query.isError ? 'common.retry' : 'common.loading',
      pending: !query.isError,
      onRetry: query.isError
        ? () => {
            void query.refetch();
          }
        : undefined,
    };
  }
  const subscriptions = query.data.subscriptions;
  if (subscriptions.length === 0) return { key: 'tariffs', path: '/subscription/purchase' };
  return subscriptions.length === 1
    ? { key: 'subscription', path: `/subscriptions/${subscriptions[0].id}` }
    : { key: 'subscriptions', path: '/subscriptions', labelKey: 'dashboard.subscriptions' };
}
