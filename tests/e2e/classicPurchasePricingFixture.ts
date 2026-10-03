import type { ClassicPurchaseOptions } from '../../src/types';

const traffic = { selectable: false, mode: 'fixed', options: [], current: 100 };
const servers = { options: [], min: 0, max: 0, default: [], selected: [] };
const devices = {
  min: 1,
  max: 5,
  default: 1,
  current: 1,
  price_per_device_kopeks: 10_000,
  price_per_device_label: '100 ₽',
};

export const classicPurchaseOptions: ClassicPurchaseOptions = {
  sales_mode: 'classic',
  currency: 'RUB',
  balance_kopeks: 125_000,
  balance_label: '1 250 ₽',
  subscription_id: 1,
  periods: [14, 30, 60, 90, 180, 360].map((days, index) => ({
    id: `days:${days}`,
    period_days: days,
    months: days < 30 ? 0 : days / 30,
    label: `${days} дней`,
    price_kopeks: [5_000, 9_900, 18_810, 26_730, 50_490, 89_100][index],
    original_price_kopeks: [null, null, 19_800, 29_700, 59_400, 118_800][index],
    price_label: '',
    per_month_price_kopeks: 0,
    per_month_price_label: '',
    is_available: true,
    traffic,
    servers,
    devices,
  })),
  traffic,
  servers,
  devices,
  selection: {
    period_id: 'days:30',
    period_days: 30,
    traffic_value: 100,
    servers: [],
    devices: 1,
  },
};

export const classicPricingDiscount = {
  discount_percent: 15,
  is_active: true,
  source: 'promocode',
  expires_at: null,
};
