import {
  onlineManager,
  skipToken,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { useAuthStore } from '@/store/auth';
import type { PurchaseOptions, SubscriptionStatusResponse } from '@/types';

type ActionQuery<T> = Pick<
  UseQueryResult<T>,
  'data' | 'fetchStatus' | 'isFetchedAfterMount' | 'isSuccess'
>;

function hasFreshResponse<T>(query: ActionQuery<T>) {
  return query.isSuccess && query.isFetchedAfterMount && query.fetchStatus === 'idle';
}

const subscribeOnline = (listener: () => void) => onlineManager.subscribe(listener);
const isOnline = () => onlineManager.isOnline();

export function useSubscriptionActionState(
  subscriptionId: number | undefined,
  status: ActionQuery<SubscriptionStatusResponse>,
  options: ActionQuery<PurchaseOptions>,
  isMultiTariff: boolean,
) {
  const userId = useAuthStore((state) => state.user?.id);
  const online = useSyncExternalStore(subscribeOnline, isOnline, isOnline);
  const offline = !online || status.fetchStatus === 'paused' || options.fetchStatus === 'paused';
  const subscription = status.data?.subscription;
  const salesMode = options.data?.sales_mode;
  const current = useMemo(
    () =>
      userId !== undefined &&
      subscription &&
      subscription.id === subscriptionId &&
      (salesMode === 'classic' || salesMode === 'tariffs')
        ? { userId, subscription, salesMode, isMultiTariff }
        : null,
    [userId, subscription, subscriptionId, salesMode, isMultiTariff],
  );
  const queryClient = useQueryClient();
  const snapshotKey = useMemo(
    () => ['subscription-verified-actions', userId, subscriptionId],
    [userId, subscriptionId],
  );
  const { data: lastKnown } = useQuery<NonNullable<typeof current>>({
    queryKey: snapshotKey,
    queryFn: skipToken,
  });
  const ready =
    current !== null && !offline && hasFreshResponse(status) && hasFreshResponse(options);

  // A partial refresh can update either request cache without verifying the action set.
  useEffect(() => {
    if (ready) queryClient.setQueryData(snapshotKey, current);
  }, [queryClient, snapshotKey, ready, current]);

  return { snapshot: ready ? current : (lastKnown ?? null), ready, offline };
}
