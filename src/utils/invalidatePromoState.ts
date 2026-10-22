import type { QueryClient } from '@tanstack/react-query';

/** Mark existing read-only consumers stale after a benefit changes; never initiate a purchase. */
export function invalidatePromoState(client: QueryClient): void {
  for (const key of [
    'active-discount',
    'promo-offers',
    'promo-group-discounts',
    'subscription',
    'subscriptions-list',
    'purchase-options',
    'renewal-options',
    'purchase-preview',
    'tariff-switch-preview',
    'gift-config',
    'device-price',
    'traffic-packages',
    'countries',
  ]) {
    void client.invalidateQueries({ queryKey: [key] });
  }
}
