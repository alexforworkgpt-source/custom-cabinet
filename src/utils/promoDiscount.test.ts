import { describe, expect, it } from 'vitest';
import { calculatePromoDiscount } from './promoDiscount';

describe('calculatePromoDiscount', () => {
  it('keeps the base price when no discount applies', () => {
    expect(calculatePromoDiscount(10_000, null, undefined)).toEqual({
      price: 10_000,
      original: null,
      percent: null,
      isPromoGroup: false,
    });
  });

  it('applies an active discount to the base price in kopeks', () => {
    expect(
      calculatePromoDiscount(10_000, null, {
        discount_percent: 20,
        source: 'offer',
        expires_at: null,
        is_active: true,
      }),
    ).toEqual({
      price: 8_000,
      original: 10_000,
      percent: 20,
      isPromoGroup: false,
    });
  });

  it('reports an existing promo-group price without changing it', () => {
    expect(calculatePromoDiscount(8_000, 10_000, undefined)).toEqual({
      price: 8_000,
      original: 10_000,
      percent: 20,
      isPromoGroup: true,
    });
  });

  it('combines an active discount with an existing promo-group price', () => {
    expect(
      calculatePromoDiscount(8_000, 10_000, {
        discount_percent: 10,
        source: 'offer',
        expires_at: null,
        is_active: true,
      }),
    ).toEqual({
      price: 7_200,
      original: 10_000,
      percent: 28,
      isPromoGroup: true,
    });
  });

  it('ignores inactive and zero-percent discounts', () => {
    expect(
      calculatePromoDiscount(10_000, null, {
        discount_percent: 20,
        source: 'offer',
        expires_at: null,
        is_active: false,
      }),
    ).toEqual({ price: 10_000, original: null, percent: null, isPromoGroup: false });

    expect(
      calculatePromoDiscount(10_000, null, {
        discount_percent: 0,
        source: 'offer',
        expires_at: null,
        is_active: true,
      }),
    ).toEqual({ price: 10_000, original: null, percent: null, isPromoGroup: false });
  });

  it('rounds the discounted price to whole kopeks', () => {
    expect(
      calculatePromoDiscount(9_999, null, {
        discount_percent: 15,
        source: 'offer',
        expires_at: null,
        is_active: true,
      }).price,
    ).toBe(8_499);
  });
});
