import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

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

test('the Profile badge opens Statuses and returns to Profile after reload', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...loyaltyResponses,
      '/api/cabinet/promo/group-discounts': {
        group_name: groupName,
        server_discount_percent: 0,
        traffic_discount_percent: 0,
        device_discount_percent: 0,
        period_discounts: {},
      },
    },
  });
  await page.route('**/cabinet/activity/events', (route) => route.fulfill({ json: {} }));
  await page.goto('/profile');
  const badge = page.getByRole('link', { name: groupName, exact: true });
  await expect(badge).toHaveCount(1);
  await badge.focus();
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
  await expect(page).toHaveURL('/profile');
  await expect(badge).toBeVisible();
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('Statuses shows API benefits and browser Back returns to the group card', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...loyaltyResponses,
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
  await page.goto('/profile');
  await page.getByRole('link', { name: groupName, exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Бронза', exact: true })).toBeVisible();
  await expect(page.getByText(/-10%/)).toBeVisible();
  await expect(page.getByText('Программа лояльности пока недоступна')).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL('/profile');
  await expect(page.getByRole('link', { name: groupName, exact: true })).toBeVisible();
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('gift keeps the active discount with a named promo group', async ({ page }) => {
  await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      '/api/cabinet/gift/config': {
        is_enabled: true,
        tariffs: [
          {
            id: 10,
            name: 'Подарочный тариф',
            traffic_limit_gb: 100,
            device_limit: 3,
            periods: [
              {
                days: 30,
                price_kopeks: 24000,
                price_label: '240 ₽',
                original_price_kopeks: 30000,
                discount_percent: 20,
              },
            ],
          },
        ],
        payment_methods: [],
        balance_kopeks: 125000,
        currency_symbol: '₽',
        promo_group_name: groupName,
        active_discount_percent: 20,
        active_discount_expires_at: null,
      },
      '/api/cabinet/gift/sent': [],
      '/api/cabinet/gift/received': [],
    },
  });
  await page.goto('/gift');
  await expect(page.getByText('Ваша группа: Базовый юзер', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Скидка применена -20%', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /^1 месяц.*240,00/ })).toBeVisible();
});

test('Profile hides its group badge when no name is available', async ({ page }) => {
  await prepareAuthenticatedPage(page);
  await page.goto('/profile');
  const identity = page.getByRole('heading', { name: 'Browser Test', exact: true });
  await expect(identity).toBeVisible();
  await expect(identity.locator('..').getByRole('link')).toHaveCount(0);
});
