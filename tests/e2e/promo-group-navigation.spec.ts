import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { classicPurchaseOptions } from './classicPurchasePricingFixture';
import { responses as renewalResponses } from './classicRenewalFixture';

const groupName = 'Базовый юзер';
const loyaltyResponses = {
  '/api/cabinet/info-pages/tab-replacements': {
    faq: null,
    rules: null,
    privacy: null,
    offer: null,
  },
  '/api/cabinet/info-pages': [],
  '/api/cabinet/info/visibility': {
    faq: true,
    rules: true,
    privacy: true,
    offer: true,
    recurrent: true,
  },
  '/api/cabinet/info/faq': [],
  '/api/cabinet/promo/loyalty-tiers': {
    tiers: [],
    current_spent_rubles: 0,
    current_tier_name: null,
    next_tier_name: null,
    next_tier_threshold_rubles: null,
    progress_percent: 0,
  },
};

for (const source of ['/subscription/purchase', '/subscriptions/42/renew', '/gift']) {
  test(`group card opens Statuses and returns to ${source} after reload`, async ({ page }) => {
    const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
      language: 'ru',
      responses: {
        ...renewalResponses,
        ...loyaltyResponses,
        '/api/cabinet/subscription/purchase-options': classicPurchaseOptions,
        '/api/cabinet/subscription/purchase-preview': {
          total_price_kopeks: 9900,
          total_price_label: '99 ₽',
          breakdown: [],
          balance_kopeks: 125000,
          missing_amount_kopeks: 0,
          can_purchase: true,
        },
        '/api/cabinet/promo/group-discounts': {
          group_name: groupName,
          server_discount_percent: 0,
          traffic_discount_percent: 0,
          device_discount_percent: 0,
          period_discounts: {},
        },
        '/api/cabinet/gift/config': {
          is_enabled: true,
          tariffs: [],
          payment_methods: [],
          balance_kopeks: 0,
          currency_symbol: '₽',
          promo_group_name: groupName,
          active_discount_percent: null,
          active_discount_expires_at: null,
        },
      },
    });
    await page.route('**/cabinet/activity/events', (route) => route.fulfill({ json: {} }));
    await page.goto(source);
    const card = page.getByRole('link', { name: /Ваша группа: Базовый юзер/ });
    await card.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/info');
    await expect(page.getByText('Программа лояльности пока недоступна')).toBeVisible();
    if ((page.viewportSize()?.width ?? 0) < 768) {
      await expect(page.getByRole('heading', { name: 'Статусы', level: 1 })).toBeFocused();
    } else {
      await expect(page.getByRole('button', { name: 'Статусы', exact: true })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    }
    await page.reload();
    await expect(page.getByText('Программа лояльности пока недоступна')).toBeVisible();
    await page.getByRole('main').getByRole('button', { name: 'Назад', exact: true }).click();
    await expect(page).toHaveURL(source);
    expect([...unexpectedApiRequests]).toEqual([]);
  });
}

test('Statuses shows API benefits and browser Back returns to the group card', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...loyaltyResponses,
      '/api/cabinet/subscription/purchase-options': classicPurchaseOptions,
      '/api/cabinet/subscription/purchase-preview': {
        total_price_kopeks: 9900,
        total_price_label: '99 ₽',
        breakdown: [],
        balance_kopeks: 125000,
        missing_amount_kopeks: 0,
        can_purchase: true,
      },
      '/api/cabinet/promo/group-discounts': {
        group_name: groupName,
        server_discount_percent: 0,
        traffic_discount_percent: 0,
        device_discount_percent: 0,
        period_discounts: {},
      },
      '/api/cabinet/promo/loyalty-tiers': {
        tiers: [
          {
            id: 1,
            name: 'Бронза',
            threshold_rubles: 0,
            server_discount_percent: 10,
            traffic_discount_percent: 0,
            device_discount_percent: 0,
            period_discounts: {},
            is_current: true,
            is_achieved: true,
          },
        ],
        current_spent_rubles: 200,
        current_tier_name: 'Бронза',
        next_tier_name: null,
        next_tier_threshold_rubles: null,
        progress_percent: 100,
      },
    },
  });
  await page.route('**/cabinet/activity/events', (route) => route.fulfill({ json: {} }));
  await page.goto('/subscription/purchase');
  await page.getByRole('link', { name: /Ваша группа: Базовый юзер/ }).click();
  await expect(page.getByRole('heading', { name: 'Бронза', exact: true })).toBeVisible();
  await expect(page.getByText(/-10%/)).toBeVisible();
  await expect(page.getByText('Программа лояльности пока недоступна')).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL('/subscription/purchase');
  await expect(page.getByRole('link', { name: /Ваша группа: Базовый юзер/ })).toBeVisible();
  expect([...unexpectedApiRequests]).toEqual([]);
});
