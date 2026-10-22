import type { PromoOffer } from '../../api/promo';
import { promoDeadline } from '../../utils/promoExpiry';

type Translate = (key: string, options?: Record<string, unknown>) => string;
export function formatOfferTimeLeft(expiresAt: string, t: Translate, now = Date.now()): string {
  const deadline = promoDeadline(expiresAt);
  if (deadline === null) return t('dashboard.dataUnavailable');
  const diff = deadline - now;
  if (diff <= 0) return t('promo.offers.expired');
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  if (hours > 24) return `${Math.floor(hours / 24)} ${t('promo.time.days')}`;
  return hours > 0
    ? `${hours}${t('promo.time.hours')} ${minutes}${t('promo.time.minutes')}`
    : `${minutes}${t('promo.time.minutes')}`;
}
export function getOfferIcon(effect: string, percent?: number | null) {
  return <span className="text-2xl">{effect === 'test_access' ? '🚀' : percent ? '🏷️' : '🎁'}</span>;
}
export function getOfferTitle(offer: PromoOffer, t: Translate): string {
  return offer.effect_type === 'test_access'
    ? t('promo.offers.testAccess')
    : offer.discount_percent
      ? t('promo.offers.discountPercent', { percent: offer.discount_percent })
      : t('promo.offers.specialOffer');
}
export function getOfferDescription(offer: PromoOffer, t: Translate): string {
  if (offer.effect_type === 'test_access') {
    const count = offer.extra_data?.test_squad_uuids?.length ?? 0;
    return count > 0
      ? t('promo.offers.serverAccess', { count })
      : t('promo.offers.additionalServers');
  }
  return t(
    offer.discount_percent ? 'promo.offers.activateDiscountHint' : 'promo.offers.specialOfferHint',
  );
}
