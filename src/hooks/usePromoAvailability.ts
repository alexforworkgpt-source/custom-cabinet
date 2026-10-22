import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { ActiveDiscount, PromoOffer } from '../api/promo';
import { useAuthStore } from '../store/auth';
import { invalidatePromoState } from '../utils/invalidatePromoState';
import { isCurrentDiscount, isCurrentPromoOffer, promoDeadline } from '../utils/promoExpiry';
import { useNow } from './useNow';

/** Local deadline display plus one read-only refresh per expired benefit/account. */
export function usePromoAvailability(discount: ActiveDiscount | undefined, offers: PromoOffer[]) {
  const client = useQueryClient();
  const owner = useAuthStore((state) => state.user?.id);
  const refreshed = useRef(new Set<string>());
  const clockEnabled =
    Boolean(discount?.is_active && discount.expires_at) ||
    offers.some((offer) => offer.is_active && !offer.is_claimed);
  const now = useNow(1000, clockEnabled);
  useEffect(() => {
    if (owner === undefined) return;
    const entries = [
      ...(discount?.is_active
        ? [
            {
              key: `active:${discount.source}:${discount.discount_percent}`,
              expires: discount.expires_at,
            },
          ]
        : []),
      ...offers
        .filter((offer) => offer.is_active && !offer.is_claimed)
        .map((offer) => ({ key: `offer:${offer.id}`, expires: offer.expires_at })),
    ];
    let refresh = false;
    for (const entry of entries) {
      const deadline = promoDeadline(entry.expires);
      const key = `${owner}:${entry.key}:${entry.expires}`;
      if (deadline !== null && deadline <= now && !refreshed.current.has(key)) {
        refreshed.current.add(key);
        refresh = true;
      }
    }
    if (refresh) invalidatePromoState(client);
  }, [discount, offers, now, owner, client]);
  const currentDiscount = isCurrentDiscount(discount, now);
  return {
    now,
    currentDiscount,
    unavailableDiscount: Boolean(
      discount?.is_active && discount.discount_percent > 0 && !currentDiscount,
    ),
    availableOffers: offers.filter((offer) => isCurrentPromoOffer(offer, now)),
  };
}
