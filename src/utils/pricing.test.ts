import { describe, expect, it } from 'vitest';
import { getDailyPriceQuote, getMonthlyPriceKopeks } from './pricing';

describe('getMonthlyPriceKopeks', () => {
  it('hides the monthly rate for periods of a month or shorter', () => {
    expect(getMonthlyPriceKopeks(4830, 7)).toBeNull();
    expect(getMonthlyPriceKopeks(9900, 14)).toBeNull();
    expect(getMonthlyPriceKopeks(16030, 30)).toBeNull();
  });

  it('divides by whole months for multiples of 30 days', () => {
    expect(getMonthlyPriceKopeks(30000, 90)).toBe(10000);
    expect(getMonthlyPriceKopeks(60000, 180)).toBe(10000);
  });

  it('prorates periods that are not whole months', () => {
    expect(getMonthlyPriceKopeks(15000, 45)).toBe(10000);
    expect(getMonthlyPriceKopeks(100000, 365)).toBe(8219);
  });

  it('returns null for non-finite input', () => {
    expect(getMonthlyPriceKopeks(Number.NaN, 90)).toBeNull();
    expect(getMonthlyPriceKopeks(30000, Number.NaN)).toBeNull();
    expect(getMonthlyPriceKopeks(30000, Number.POSITIVE_INFINITY)).toBeNull();
  });
});

describe('getDailyPriceQuote', () => {
  it('uses the Upstream Bot daily price when no discount applies', () => {
    expect(getDailyPriceQuote({ daily_price_kopeks: 1_500 }, undefined)).toEqual({
      price: 1_500,
      original: null,
      percent: null,
      isPromoGroup: false,
    });
  });

  it('preserves the Upstream Bot promo-group discount and its original price', () => {
    expect(
      getDailyPriceQuote(
        { daily_price_kopeks: 1_200, original_daily_price_kopeks: 1_500 },
        undefined,
      ),
    ).toEqual({
      price: 1_200,
      original: 1_500,
      percent: 20,
      isPromoGroup: true,
    });
  });

  it('applies an active promo code exactly once to the server daily price', () => {
    expect(
      getDailyPriceQuote(
        { daily_price_kopeks: 1_500 },
        {
          discount_percent: 20,
          source: 'promocode',
          expires_at: null,
          is_active: true,
        },
      ),
    ).toEqual({
      price: 1_200,
      original: 1_500,
      percent: 20,
      isPromoGroup: false,
    });
  });

  it('combines the server group price with one promo-code discount', () => {
    expect(
      getDailyPriceQuote(
        { daily_price_kopeks: 1_200, original_daily_price_kopeks: 1_500 },
        {
          discount_percent: 20,
          source: 'promocode',
          expires_at: null,
          is_active: true,
        },
      ),
    ).toEqual({
      price: 960,
      original: 1_500,
      percent: 36,
      isPromoGroup: true,
    });
  });
});
