import type { ActiveDiscount } from '../api/promo';

export interface PromoDiscountResult {
  price: number;
  original: number | null;
  percent: number | null;
  isPromoGroup: boolean;
}

export function calculatePromoDiscount(
  priceKopeks: number,
  existingOriginalPrice: number | null | undefined,
  activeDiscount: ActiveDiscount | undefined,
): PromoDiscountResult {
  const promoGroupOriginal = existingOriginalPrice ?? 0;
  const hasExisting = promoGroupOriginal > priceKopeks;
  const discountPercent = activeDiscount?.is_active ? activeDiscount.discount_percent : 0;
  const hasPromo = Boolean(discountPercent);

  if (!hasExisting && !hasPromo) {
    return { price: priceKopeks, original: null, percent: null, isPromoGroup: false };
  }

  const finalPrice = hasPromo ? Math.round(priceKopeks * (1 - discountPercent / 100)) : priceKopeks;

  if (hasExisting) {
    return {
      price: finalPrice,
      original: promoGroupOriginal,
      percent: Math.round((1 - finalPrice / promoGroupOriginal) * 100),
      isPromoGroup: true,
    };
  }

  return {
    price: finalPrice,
    original: priceKopeks,
    percent: discountPercent,
    isPromoGroup: false,
  };
}
