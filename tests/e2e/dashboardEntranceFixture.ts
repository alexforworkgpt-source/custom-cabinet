import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription } from './classicRenewalFixture';
import { activeDiscount } from './promoDiscountFixture';
import type { Page } from '@playwright/test';

const news = (id: number, featured: boolean) => ({
  id,
  title: `Entrance news ${id}`,
  slug: `entrance-news-${id}`,
  excerpt: 'Local fixture',
  category: 'Updates',
  category_color: '#3b82f6',
  category_id: 1,
  tag: null,
  tag_id: null,
  featured_image_url: null,
  is_published: true,
  is_featured: featured,
  published_at: '2026-10-26T00:00:00Z',
  read_time_minutes: 1,
  views_count: 0,
});

export const dashboardEntranceTargets = {
  discount: { css: '[data-promo-active-discount]' },
  offer: { css: '[data-promo-offers] > .space-y-3 > div' },
  reminder: { css: 'main button[aria-label="Dismiss"]', closest: '.relative.overflow-hidden' },
  selector: { css: 'main label:has(select)' },
  news: { css: 'main section:has(article)' },
};

export function prepareEntranceDashboard(page: Page) {
  return prepareAuthenticatedPage(page, {
    responses: {
      ...responses,
      '/api/cabinet/subscriptions': {
        subscriptions: [subscription, { ...subscription, id: 43 }],
        multi_tariff_enabled: true,
      },
      '/api/cabinet/subscriptions/42': subscription,
      '/api/cabinet/subscriptions/42/devices': { devices: [], total: 0, device_limit: 3 },
      '/api/cabinet/subscriptions/42/connection-link': {
        subscription_url: subscription.subscription_url,
        hide_link: false,
        instructions: { steps: [] },
      },
      '/api/cabinet/subscriptions/42/purchase-options':
        responses['/api/cabinet/subscription/purchase-options'],
      '/api/cabinet/promo/active-discount': activeDiscount,
      '/api/cabinet/promo/offers': [
        {
          id: 1,
          notification_type: 'test',
          effect_type: 'discount',
          discount_percent: 20,
          expires_at: activeDiscount.expires_at,
          is_active: true,
          is_claimed: false,
          claimed_at: null,
          extra_data: {},
        },
      ],
      '/api/cabinet/reminders/active': [
        { id: 1, title: 'Entrance reminder', body: 'Local fixture', button: null },
      ],
      '/api/cabinet/news': {
        items: [news(1, true), news(2, false)],
        total: 2,
        categories: ['Updates'],
      },
    },
  });
}
