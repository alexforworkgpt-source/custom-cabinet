import { describe, expect, it } from 'vitest';
import type { ActiveDiscount, PromoOffer } from '../api/promo';
import { isCurrentDiscount, isCurrentPromoOffer, promoDeadline } from './promoExpiry';

const now = Date.parse('2026-10-21T00:00:00Z');
const discount: ActiveDiscount = {
  is_active: true,
  discount_percent: 20,
  source: 'offer:1',
  expires_at: '2026-10-22T00:00:00Z',
};
describe('promotion deadlines', () => {
  it('normalizes the existing UTC and offset formats', () => {
    expect(promoDeadline('2026-10-21T00:00:00')).toBe(now);
    expect(promoDeadline('2026-10-21T03:00:00+03:00')).toBe(now);
    expect(promoDeadline('unknown')).toBeNull();
  });
  it('keeps an active future or explicitly unlimited discount available', () => {
    expect(isCurrentDiscount(discount, now)).toBe(true);
    expect(isCurrentDiscount({ ...discount, expires_at: null }, now)).toBe(true);
  });
  it.each(['2026-10-20T23:59:59Z', '2026-10-21T00:00:00Z', 'invalid'])(
    'does not promise a discount with deadline %s',
    (expires_at) => {
      expect(isCurrentDiscount({ ...discount, expires_at }, now)).toBe(false);
    },
  );
  it('does not grant availability from a percentage alone', () => {
    expect(isCurrentDiscount(undefined, now)).toBe(false);
    expect(isCurrentDiscount({ ...discount, is_active: false }, now)).toBe(false);
    expect(isCurrentDiscount({ ...discount, discount_percent: 0 }, now)).toBe(false);
  });
  it('filters expired, claimed and inactive offers without manufacturing access', () => {
    const offer: PromoOffer = {
      id: 1,
      notification_type: 'test',
      effect_type: 'discount',
      discount_percent: 20,
      expires_at: '2026-10-22T00:00:00Z',
      is_active: true,
      is_claimed: false,
      claimed_at: null,
      extra_data: null,
    };
    expect(isCurrentPromoOffer(offer, now)).toBe(true);
    expect(isCurrentPromoOffer({ ...offer, expires_at: '2026-10-21T00:00:00Z' }, now)).toBe(false);
    expect(isCurrentPromoOffer({ ...offer, is_claimed: true }, now)).toBe(false);
    expect(isCurrentPromoOffer({ ...offer, is_active: false }, now)).toBe(false);
  });
});
