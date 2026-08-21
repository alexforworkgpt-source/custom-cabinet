import type { Page } from '@playwright/test';
import type { User } from '../../src/types';

export const browserTestUser: User = {
  id: 1,
  telegram_id: null,
  username: 'browser_test',
  first_name: 'Browser Test',
  last_name: null,
  email: 'browser-test@example.test',
  email_verified: true,
  balance_kopeks: 0,
  balance_rubles: 0,
  referral_code: null,
  language: 'en',
  created_at: '2026-01-01T00:00:00Z',
  auth_type: 'email',
};

export const baseApiResponses: Record<string, unknown> = {
  '/api/cabinet/auth/me': browserTestUser,
  '/api/cabinet/auth/me/is-admin': { is_admin: false },
  '/api/cabinet/auth/me/permissions': { permissions: [], roles: [], role_level: 0 },
  '/api/cabinet/balance': { balance_kopeks: 0, balance_rubles: 0 },
  '/api/cabinet/balance/payment-methods': [],
  '/api/cabinet/balance/saved-cards': { cards: [], recurrent_enabled: false },
  '/api/cabinet/balance/transactions': { items: [], total: 0, page: 1, per_page: 20 },
  '/api/cabinet/branding': {
    name: 'Test Cabinet',
    logo_url: null,
    logo_letter: 'T',
    has_custom_logo: false,
  },
  '/api/cabinet/branding/analytics': {
    yandex_metrika_id: '',
    google_ads_id: '',
    google_ads_label: '',
  },
  '/api/cabinet/branding/animation-config': {
    enabled: false,
    type: 'none',
    settings: {},
    opacity: 1,
    blur: 0,
    reducedOnMobile: true,
  },
  '/api/cabinet/branding/colors': {
    accent: '#3b82f6',
    darkBackground: '#000000',
    darkSurface: '#0a0a0a',
    darkText: '#fafafa',
    darkTextSecondary: '#a3a3a3',
    lightBackground: '#ffffff',
    lightSurface: '#fafafa',
    lightText: '#0a0a0a',
    lightTextSecondary: '#525252',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  '/api/cabinet/branding/email-auth': { enabled: true, verification_enabled: true },
  '/api/cabinet/branding/fullscreen': { enabled: false },
  '/api/cabinet/branding/gift-enabled': { enabled: false },
  '/api/cabinet/branding/themes': { dark: true, light: true },
  '/api/cabinet/contests/count': { count: 0 },
  '/api/cabinet/gift/pending': [],
  '/api/cabinet/info/languages': {
    languages: [
      { code: 'en', name: 'English', flag: 'EN' },
      { code: 'ru', name: 'Русский', flag: 'RU' },
    ],
    default: 'en',
  },
  '/api/cabinet/news': { items: [], total: 0, categories: [] },
  '/api/cabinet/notifications': {
    subscription_expiry_enabled: true,
    subscription_expiry_days: 3,
    traffic_warning_enabled: true,
    traffic_warning_percent: 80,
    balance_low_enabled: true,
    balance_low_threshold: 100,
    news_enabled: true,
    promo_offers_enabled: true,
  },
  '/api/cabinet/polls/count': { count: 0 },
  '/api/cabinet/promo/active-discount': {
    discount_percent: 0,
    source: null,
    expires_at: null,
    is_active: false,
  },
  '/api/cabinet/promo/group-discounts': {
    group_name: null,
    server_discount_percent: 0,
    traffic_discount_percent: 0,
    device_discount_percent: 0,
    period_discounts: {},
  },
  '/api/cabinet/promo/offers': [],
  '/api/cabinet/public/site-verification': { apay_tag: null },
  '/api/cabinet/referral': {
    referral_code: '',
    referral_link: '',
    total_referrals: 0,
    active_referrals: 0,
    total_earnings_kopeks: 0,
    total_earnings_rubles: 0,
    commission_percent: 0,
    available_balance_kopeks: 0,
    available_balance_rubles: 0,
    withdrawn_kopeks: 0,
  },
  '/api/cabinet/referral/terms': {
    is_enabled: false,
    commission_percent: 0,
    minimum_topup_kopeks: 0,
    minimum_topup_rubles: 0,
    first_topup_bonus_kopeks: 0,
    first_topup_bonus_rubles: 0,
    inviter_bonus_kopeks: 0,
    inviter_bonus_rubles: 0,
    max_commission_payments: 0,
  },
  '/api/cabinet/subscription': { has_subscription: false, subscription: null },
  '/api/cabinet/subscription/connection-link': {
    subscription_url: null,
    display_link: null,
    happ_redirect_link: null,
    happ_scheme_link: null,
    connect_mode: 'plain',
    hide_link: false,
    instructions: { steps: [] },
  },
  '/api/cabinet/subscription/trial': {
    is_available: false,
    duration_days: 0,
    traffic_limit_gb: 0,
    device_limit: 0,
    requires_payment: false,
    price_kopeks: 0,
    price_rubles: 0,
    reason_unavailable: 'Not available in browser tests',
  },
  '/api/cabinet/subscriptions': { subscriptions: [], multi_tariff_enabled: false },
  '/api/cabinet/tickets/notifications/unread-count': { unread_count: 0 },
  '/api/cabinet/wheel/config': { is_enabled: false },
};

export interface BrowserFeatureFlags {
  referralEnabled: boolean;
  wheelEnabled: boolean;
  hasContests: boolean;
  hasPolls: boolean;
  giftEnabled: boolean;
}

interface PrepareAuthenticatedPageOptions {
  responses?: Record<string, unknown>;
  responseStatuses?: Record<string, number>;
  featureFlags?: Partial<BrowserFeatureFlags>;
  user?: typeof browserTestUser;
  language?: string;
}

export async function prepareAuthenticatedPage(
  page: Page,
  options: PrepareAuthenticatedPageOptions = {},
) {
  const unexpectedApiRequests = new Set<string>();
  const apiRequests: string[] = [];
  const persistedUser = options.user ?? browserTestUser;
  const responses = {
    ...baseApiResponses,
    '/api/cabinet/auth/me': persistedUser,
    ...options.responses,
  };
  const featureFlags: BrowserFeatureFlags = {
    referralEnabled: false,
    wheelEnabled: false,
    hasContests: false,
    hasPolls: false,
    giftEnabled: false,
    ...options.featureFlags,
  };

  await page.addInitScript(
    ({ accessToken, flags, user, language }) => {
      sessionStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', 'browser-test-refresh-token');
      localStorage.setItem('cabinet-auth', JSON.stringify({ state: { user }, version: 0 }));
      localStorage.setItem('cabinet_language', language);
      localStorage.setItem('onboarding_completed', 'true');
      localStorage.setItem('cabinet-feature-flags', JSON.stringify(flags));
    },
    {
      accessToken:
        'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxIiwiZXhwIjo0MTAyNDQ0ODAwfQ.browser-test',
      flags: featureFlags,
      user: persistedUser,
      language: options.language ?? 'en',
    },
  );

  await page.route('**/health/unified', (route) =>
    route.fulfill({ status: 200, json: { status: 'ok' } }),
  );
  await page.route('https://api.exchangerate.host/**', (route) =>
    route.fulfill({
      status: 200,
      json: { success: true, rates: { USD: 0.01, CNY: 0.07, IRR: 420 } },
    }),
  );
  await page.route('**/api/cabinet/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    const requestKey = `${route.request().method()} ${path}`;
    apiRequests.push(requestKey);
    if (!Object.hasOwn(responses, path)) {
      unexpectedApiRequests.add(requestKey);
      await route.fulfill({ status: 500, json: { detail: `Missing browser-test mock: ${path}` } });
      return;
    }
    await route.fulfill({
      status: options.responseStatuses?.[path] ?? 200,
      json: responses[path],
    });
  });

  return { apiRequests, unexpectedApiRequests };
}
