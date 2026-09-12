import type { ActiveDiscount } from '../api/promo';
import { calculatePromoDiscount, type PromoDiscountResult } from './promoDiscount';

/** Длина «месяца» в днях — тот же множитель, что использует бэкенд при расчёте цены за месяц. */
const DAYS_IN_MONTH = 30;

export interface DailyPriceSource {
  daily_price_kopeks?: number | null;
  price_per_day_kopeks?: number | null;
  original_daily_price_kopeks?: number | null;
}

/**
 * Отображаемая суточная цена. Значение от Upstream Bot остаётся источником
 * истины; frontend только формирует единый результат для всех экранов.
 */
export function getDailyPriceQuote(
  source: DailyPriceSource,
  activeDiscount: ActiveDiscount | undefined,
): PromoDiscountResult | null {
  const price = source.daily_price_kopeks ?? source.price_per_day_kopeks ?? 0;
  if (price <= 0) return null;
  return calculatePromoDiscount(price, source.original_daily_price_kopeks, activeDiscount);
}

/**
 * Цена за месяц (в копейках) для периода длиной `days` дней.
 *
 * Возвращает `null`, когда месячная ставка не имеет смысла: для периода
 * в месяц и короче она либо повторяет цену периода (30 дней), либо
 * выдаёт цену периода за месячную (7 дней → цена семи дней «за месяц»).
 */
export function getMonthlyPriceKopeks(priceKopeks: number, days: number): number | null {
  if (!Number.isFinite(priceKopeks) || !Number.isFinite(days)) return null;
  if (days <= DAYS_IN_MONTH) return null;
  return Math.round((priceKopeks * DAYS_IN_MONTH) / days);
}
