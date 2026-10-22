import type { ActiveDiscount, PromoOffer } from '../api/promo';

/** Keep the API's existing UTC convention for timestamps without an explicit zone. */
export function promoDeadline(value: string | null | undefined): number | null {
  if (!value) return null;
  const timestamp = Date.parse(/(?:z|[+-]\d{2}:?\d{2})$/i.test(value) ? value : `${value}Z`);
  return Number.isFinite(timestamp) ? timestamp : null;
}

export function isCurrentDiscount(discount: ActiveDiscount | undefined, now = Date.now()): boolean {
  if (
    !discount?.is_active ||
    !Number.isFinite(discount.discount_percent) ||
    discount.discount_percent <= 0
  )
    return false;
  if (!discount.expires_at) return true;
  const deadline = promoDeadline(discount.expires_at);
  return deadline !== null && deadline > now;
}

export function isCurrentPromoOffer(offer: PromoOffer, now = Date.now()): boolean {
  const deadline = promoDeadline(offer.expires_at);
  return offer.is_active && !offer.is_claimed && deadline !== null && deadline > now;
}
