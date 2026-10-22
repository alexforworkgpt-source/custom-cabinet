import { useQuery } from '@tanstack/react-query';
import { promoApi } from '../api/promo';
import type { PurchaseOptions, Subscription, Tariff } from '../types';

interface Input {
  subscription: Pick<Subscription, 'is_trial'> | null;
  purchaseOptions:
    | (Pick<PurchaseOptions, 'sales_mode'> & { subscription_is_expired?: boolean })
    | undefined;
  tariffs: ReadonlyArray<Pick<Tariff, 'promo_group_name'>>;
  showPromoGroup: boolean;
  enabled: boolean;
}

/** Existing display-only group query, resolved before revealing its dependent layout. */
export function usePurchaseContext({
  subscription,
  purchaseOptions,
  tariffs,
  showPromoGroup,
  enabled,
}: Input) {
  const tariffGroup = tariffs.find((tariff) => tariff.promo_group_name)?.promo_group_name;
  const group = useQuery({
    queryKey: ['promo-group-discounts'],
    queryFn: promoApi.getGroupDiscounts,
    enabled: enabled && showPromoGroup && !tariffGroup,
    staleTime: 30_000,
    // Optional presentation metadata must fail open rather than hold the whole page on retries.
    retry: false,
  });
  const expiredTariff =
    purchaseOptions?.sales_mode === 'tariffs' && purchaseOptions.subscription_is_expired === true;
  return {
    showTrialUpgrade: Boolean(subscription?.is_trial && !expiredTariff),
    promoGroupName: showPromoGroup ? (tariffGroup ?? group.data?.group_name) : undefined,
    isLoading: group.isLoading,
  };
}

export type PurchaseContext = ReturnType<typeof usePurchaseContext>;
