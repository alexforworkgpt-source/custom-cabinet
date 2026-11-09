import type { Page } from '@playwright/test';
import type { WheelConfig } from '../../src/api/wheel';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription } from './classicRenewalFixture';

export const wheelConfig: WheelConfig = {
  is_enabled: true,
  name: 'Local Fortune Wheel',
  spin_cost_stars: null,
  spin_cost_days: 1,
  spin_cost_stars_enabled: false,
  spin_cost_days_enabled: true,
  prizes: [
    {
      id: 1,
      display_name: 'One day',
      emoji: '📅',
      color: '#3b82f6',
      prize_type: 'subscription_days',
    },
    { id: 2, display_name: 'Balance', emoji: '💰', color: '#22c55e', prize_type: 'balance' },
    { id: 3, display_name: 'Traffic', emoji: '🌐', color: '#f59e0b', prize_type: 'traffic' },
    { id: 4, display_name: 'Nothing', emoji: '🎰', color: '#8b5cf6', prize_type: 'nothing' },
  ],
  daily_limit: 5,
  user_spins_today: 0,
  can_spin: false,
  can_spin_reason: null,
  can_pay_stars: false,
  can_pay_days: false,
  user_balance_kopeks: 0,
  required_balance_kopeks: 0,
  has_subscription: true,
  eligible_subscriptions: [{ id: 42, tariff_name: 'Local plan', days_left: 30 }],
};

export function prepareQrWheel(page: Page) {
  return prepareAuthenticatedPage(page, {
    featureFlags: { wheelEnabled: true },
    responses: {
      ...responses,
      '/api/cabinet/subscription/connection-link': {
        subscription_url: subscription.subscription_url,
        display_link: subscription.subscription_url,
        hide_link: false,
        connect_mode: 'plain',
        instructions: { steps: [] },
      },
      '/api/cabinet/wheel/config': wheelConfig,
      '/api/cabinet/wheel/history': { items: [], total: 0, page: 1, per_page: 10, pages: 0 },
    },
  });
}

export const wheelGraphic = 'main svg[viewBox="0 0 400 400"]';
export const qrTargets = {
  qr: { css: 'main svg[height="280"][width="280"]', closest: 'div.bg-white' },
  header: { css: 'main h1' },
};
export const wheelTargets = {
  wheel: { css: wheelGraphic, closest: 'div.relative.overflow-hidden' },
  header: { css: 'main h1' },
  history: { css: 'main div:has(> button > h3)' },
};
