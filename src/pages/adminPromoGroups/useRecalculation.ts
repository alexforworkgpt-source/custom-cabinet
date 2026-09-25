import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { promocodesApi, type PromoGroupRecalculationStatus } from '@/api/promocodes';
import { RECALCULATION_MAX_POLLS, RECALCULATION_POLL_MS } from './recalculationConfig';

export const RECALCULATION_QUERY_KEY = ['admin-promo-groups-recalculation'] as const;
const GROUPS_QUERY_KEY = ['admin-promo-groups'] as const;

export function useRecalculation() {
  const queryClient = useQueryClient();
  const pollCount = useRef(0);
  const [observedPollCount, setObservedPollCount] = useState(0);
  const wasActive = useRef(false);

  const status = useQuery({
    queryKey: RECALCULATION_QUERY_KEY,
    queryFn: async () => {
      const result = await promocodesApi.getPromoGroupRecalculation();
      pollCount.current += 1;
      setObservedPollCount(pollCount.current);
      return result;
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      const active = Boolean(data?.running || data?.queued);
      return active && pollCount.current < RECALCULATION_MAX_POLLS ? RECALCULATION_POLL_MS : false;
    },
  });

  const active = Boolean(status.data?.running || status.data?.queued);

  useEffect(() => {
    if (wasActive.current && !active) {
      void queryClient.invalidateQueries({ queryKey: GROUPS_QUERY_KEY });
    }
    if (!active) {
      pollCount.current = 0;
      setObservedPollCount(0);
    }
    wasActive.current = active;
  }, [active, queryClient]);

  const start = useMutation({
    mutationFn: promocodesApi.recalculatePromoGroups,
    onSuccess: (data: PromoGroupRecalculationStatus) => {
      pollCount.current = 0;
      setObservedPollCount(0);
      queryClient.setQueryData(RECALCULATION_QUERY_KEY, data);
    },
  });

  return {
    status: status.data ?? null,
    isStatusLoading: status.isLoading,
    isStatusError: status.isError,
    isStarting: start.isPending,
    isStartError: start.isError,
    isActive: active,
    pollLimitReached: active && observedPollCount >= RECALCULATION_MAX_POLLS,
    start: () => start.mutate(),
  };
}
