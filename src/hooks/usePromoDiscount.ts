import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { promoApi } from '../api/promo';
import { calculatePromoDiscount, type PromoDiscountResult } from '../utils/promoDiscount';
import { isCurrentDiscount } from '../utils/promoExpiry';
import { useNow } from './useNow';

export type { PromoDiscountResult } from '../utils/promoDiscount';

// ──────────────────────────────────────────────────────────────────
// usePromoDiscount
//
// Single source of truth for the active-discount query + the
// applyPromoDiscount helper. Extracted from SubscriptionPurchase.tsx
// so that every flow / sub-component (tariff picker, tariff purchase
// form, classic wizard, switch-tariff sheet) can call the same hook
// without re-fetching or threading a function through props.
//
// Returns:
//   activeDiscount: an unexpired API discount (or undefined)
//   applyPromoDiscount: combines the active discount with any
//     pre-existing price reduction (promo-group pricing) and reports
//     final price, original price, total percent off, and whether
//     the existing reduction is a promo-group price.
// ──────────────────────────────────────────────────────────────────

export function usePromoDiscount() {
  const { data: activeDiscount } = useQuery({
    queryKey: ['active-discount'],
    queryFn: promoApi.getActiveDiscount,
    staleTime: 30000,
  });
  const now = useNow(1000, Boolean(activeDiscount?.is_active && activeDiscount.expires_at));
  const availableDiscount = isCurrentDiscount(activeDiscount, now) ? activeDiscount : undefined;

  const applyPromoDiscount = useCallback(
    (priceKopeks: number, existingOriginalPrice?: number | null): PromoDiscountResult =>
      calculatePromoDiscount(priceKopeks, existingOriginalPrice, availableDiscount),
    [availableDiscount],
  );

  return { activeDiscount: availableDiscount, applyPromoDiscount };
}
