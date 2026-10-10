import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { subscriptionApi } from '@/api/subscription';
import type { PeriodOption, PurchasePreview, PurchaseSelection } from '@/types';

interface ConfirmedPreview {
  preview: PurchasePreview;
  selection: PurchaseSelection;
  period: PeriodOption;
  subscriptionId: number | undefined;
}

export function useClassicPurchasePreview(
  selection: PurchaseSelection,
  period: PeriodOption | null,
  subscriptionId: number | undefined,
  enabled: boolean,
) {
  const query = useQuery({
    queryKey: ['purchase-preview', selection, subscriptionId],
    queryFn: () => subscriptionApi.previewPurchase(selection, subscriptionId),
    enabled: !!period && enabled,
  });
  const [confirmed, setConfirmed] = useState<ConfirmedPreview | null>(null);

  useEffect(() => {
    if (query.data && !query.isFetching && !query.isError && period) {
      setConfirmed({ preview: query.data, selection, period, subscriptionId });
    }
  }, [query.data, query.isFetching, query.isError, selection, period, subscriptionId]);

  // Only presentation may reuse an old response. Payment always uses the current query.
  const summary =
    query.data && !query.isFetching && !query.isError && period
      ? { preview: query.data, selection, period }
      : confirmed?.subscriptionId === subscriptionId
        ? confirmed
        : null;

  return { ...query, summary };
}
