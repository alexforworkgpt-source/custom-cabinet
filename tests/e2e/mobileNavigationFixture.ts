import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { informationEntranceResponses } from './informationEntranceFixture';
import type { Page } from '@playwright/test';

export const mobileNavigationResponses = {
  ...informationEntranceResponses,
  '/api/cabinet/branding/telegram-widget': { enabled: false, bot_username: null },
  '/api/cabinet/contests': [],
  '/api/cabinet/polls': [],
  '/api/cabinet/contests/count': { count: 1 },
  '/api/cabinet/polls/count': { count: 1 },
  '/api/cabinet/wheel/config': {
    is_enabled: true,
    name: 'Local wheel',
    spin_cost_stars: null,
    spin_cost_days: 1,
    spin_cost_stars_enabled: false,
    spin_cost_days_enabled: true,
    prizes: [
      { id: 1, display_name: 'Nothing', emoji: '🎰', color: '#3b82f6', prize_type: 'nothing' },
    ],
    daily_limit: 5,
    user_spins_today: 0,
    can_spin: false,
    can_spin_reason: null,
    can_pay_stars: false,
    can_pay_days: false,
    user_balance_kopeks: 0,
    required_balance_kopeks: 0,
    has_subscription: false,
    eligible_subscriptions: [],
  },
  '/api/cabinet/wheel/history': { items: [], total: 0, page: 1, per_page: 10, pages: 0 },
  '/api/cabinet/branding/gift-enabled': { enabled: true },
  '/api/cabinet/gift/config': {
    is_enabled: true,
    tariffs: [],
    payment_methods: [],
    balance_kopeks: 0,
    currency_symbol: '₽',
    promo_group_name: null,
    active_discount_percent: null,
    active_discount_expires_at: null,
  },
  '/api/cabinet/gift/sent': [],
  '/api/cabinet/gift/received': [],
  '/api/cabinet/news/navigation-news': {
    id: 1,
    title: 'Navigation news',
    slug: 'navigation-news',
    content: '<p>Local navigation fixture</p>',
    excerpt: 'Local fixture',
    category: 'Updates',
    category_color: '#3b82f6',
    category_id: null,
    tag: null,
    tag_id: null,
    featured_image_url: null,
    is_published: true,
    is_featured: false,
    published_at: '2026-10-27T00:00:00Z',
    read_time_minutes: 1,
    views_count: 0,
    created_at: '2026-10-27T00:00:00Z',
    updated_at: null,
  },
  '/api/cabinet/info/support-config': {
    support_type: 'tickets',
    tickets_enabled: true,
    support_username: null,
    support_url: null,
    support_available: true,
  },
  '/api/cabinet/tickets': { items: [], total: 0, page: 1, per_page: 20, pages: 0 },
};

export function prepareMobileNavigation(page: Page, responses: Record<string, unknown> = {}) {
  return prepareAuthenticatedPage(page, {
    responses: { ...mobileNavigationResponses, ...responses },
    featureFlags: {
      referralEnabled: true,
      wheelEnabled: true,
      hasContests: true,
      hasPolls: true,
      giftEnabled: true,
    },
  });
}

export function mainNavigation(page: Page) {
  return page
    .getByRole('navigation')
    .filter({ has: page.getByRole('link', { name: 'Dashboard', exact: true }) });
}
