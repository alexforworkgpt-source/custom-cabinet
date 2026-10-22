import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses } from './classicRenewalFixture';
import { classicPurchaseOptions } from './classicPurchasePricingFixture';
import { preparePromoPage, subscription } from './promoDiscountFixture';

test('an active discount opens the existing paid subscription renewal without a purchase detour', async ({
  page,
}) => {
  const { apiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscription/purchase-options': classicPurchaseOptions,
      '/api/cabinet/promo/active-discount': {
        is_active: true,
        discount_percent: 20,
        source: 'offer:1',
        expires_at: '2030-01-01T00:00:00Z',
      },
      '/api/cabinet/promo/offers': [],
    },
  });
  await page.goto('/');
  await page.getByRole('button', { name: /Использовать сейчас|Продлить подписку/ }).click();
  await expect(page).toHaveURL('/subscriptions/42/renew');
  await expect(page.getByRole('button', { name: /^30 дней/ })).toContainText('500.00');
  expect(
    apiRequests.filter((request) =>
      /^POST .*subscription\/(purchase(?:-tariff)?|renew)(?:\?|$)/.test(request),
    ),
  ).toEqual([]);
});

test('a successful promocode refreshes the active discount without waiting for its cache TTL', async ({
  page,
}) => {
  let activated = false;
  await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/promo/offers': [],
    },
  });
  await page.route('**/api/cabinet/promo/active-discount', (route) =>
    route.fulfill({
      json: {
        is_active: activated,
        discount_percent: 20,
        source: 'promocode:TEST20',
        expires_at: '2030-01-01T00:00:00Z',
      },
    }),
  );
  await page.route('**/api/cabinet/promocode/activate', (route) => {
    activated = true;
    return route.fulfill({
      json: {
        success: true,
        balance_before: 0,
        balance_after: 0,
        bonus_description: 'Скидка20 активирована',
      },
    });
  });
  await page.goto('/');
  await page
    .getByRole('link', { name: /Баланс/ })
    .first()
    .click();
  const form = page.locator('[data-balance-promocode]');
  await form.locator('input').fill('TEST20');
  await form.getByRole('button', { name: 'Активировать', exact: true }).click();
  await expect(page.getByText('Скидка20 активирована', { exact: true })).toBeVisible();
  await page.goBack();
  await expect(page.locator('[data-promo-active-discount]')).toBeVisible();
});

test('a stale expired discount cannot remain an active navigation offer', async ({ page }) => {
  const { apiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/promo/offers': [],
      '/api/cabinet/promo/active-discount': {
        is_active: true,
        discount_percent: 20,
        source: 'offer:1',
        expires_at: '2020-01-01T00:00:00Z',
      },
    },
  });
  await page.goto('/');
  await expect(page.locator('[data-promo-unavailable-discount]')).toBeVisible();
  await expect(page.locator('[data-promo-active-discount]')).toHaveCount(0);
  expect(
    apiRequests.filter((request) =>
      /^POST .*subscription\/(purchase(?:-tariff)?|renew)(?:\?|$)/.test(request),
    ),
  ).toEqual([]);
});

for (const scenario of [
  { name: 'confirmed empty account', fields: null, path: '/subscription/purchase' },
  {
    name: 'trial',
    fields: { status: 'trial', is_trial: true },
    path: '/subscription/purchase?subscriptionId=42',
  },
  {
    name: 'expired classic',
    fields: { status: 'expired', is_expired: true, is_active: false },
    path: '/subscriptions/42/renew',
  },
  { name: 'periodic tariff', fields: { tariff_id: 7 }, path: '/subscriptions/42/renew' },
  {
    name: 'legacy tariff selection',
    fields: { requires_tariff_selection: true },
    path: '/subscription/purchase?subscriptionId=42',
  },
  { name: 'daily', fields: { is_daily: true }, path: '/subscriptions/42' },
  { name: 'limited', fields: { is_limited: true }, path: '/subscriptions/42' },
]) {
  test(`discount navigation respects ${scenario.name}`, async ({ page }) => {
    const current = scenario.fields ? { ...subscription, ...scenario.fields } : null;
    const fixture = await preparePromoPage(page, {
      '/api/cabinet/subscription': { has_subscription: !!current, subscription: current },
      '/api/cabinet/subscriptions': {
        subscriptions: current ? [current] : [],
        multi_tariff_enabled: false,
      },
    });
    await page.goto('/');
    await page.locator('[data-promo-active-discount]').getByRole('button').first().click();
    await expect(page).toHaveURL(scenario.path);
    fixture.expectNoPayment();
  });
}

for (const selection of [null, 43, 99]) {
  test(`multiple subscriptions preserve explicit selection ${selection ?? 'none'}`, async ({
    page,
  }) => {
    const second = { ...subscription, id: 43, tariff_id: 8, tariff_name: 'Семейная' };
    const fixture = await preparePromoPage(page, {
      '/api/cabinet/subscriptions': {
        subscriptions: [subscription, second],
        multi_tariff_enabled: true,
      },
    });
    await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, (route) => {
      const id = new URL(route.request().url()).searchParams.get('subscription_id');
      return route.fulfill({
        json: { has_subscription: true, subscription: id === '43' ? second : subscription },
      });
    });
    await page.goto(selection === null ? '/' : `/?sub=${selection}`);
    const banner = page.locator('[data-promo-active-discount]');
    if (selection !== 43) await expect(banner).toContainText('Выбрать подписку');
    await banner.getByRole('button').first().click();
    await expect(page).toHaveURL(selection === 43 ? '/subscriptions/43/renew' : '/subscriptions');
    if (selection === 43) {
      await expect
        .poll(() =>
          fixture.requests.some(
            ({ url }) =>
              url.pathname.endsWith('/renewal-options') &&
              url.searchParams.get('subscription_id') === '43',
          ),
        )
        .toBe(true);
    }
    fixture.expectNoPayment();
  });
}

test('a failed fresh list read remains on Dashboard and can be retried', async ({ page }) => {
  const fixture = await preparePromoPage(page);
  await page.goto('/');
  const action = page.locator('[data-promo-active-discount]').getByRole('button').first();
  await expect(action).toBeEnabled();
  await page.route('**/api/cabinet/subscriptions', (route) =>
    route.fulfill({ status: 503, json: { detail: 'Временная ошибка списка' } }),
  );
  await action.click();
  await expect(page.locator('[data-promo-offers]').getByRole('alert')).toContainText(
    'Временная ошибка списка',
  );
  await expect(page).toHaveURL('/');
  await page.unroute('**/api/cabinet/subscriptions');
  await action.click();
  await expect(page).toHaveURL('/subscriptions/42/renew');
  fixture.expectNoPayment();
});

test('a removed selected subscription is not replaced by another record during fresh navigation', async ({
  page,
}) => {
  const fixture = await preparePromoPage(page);
  await page.goto('/?sub=42');
  const action = page.locator('[data-promo-active-discount]').getByRole('button').first();
  await expect(action).toBeEnabled();
  await page.route('**/api/cabinet/subscriptions', (route) =>
    route.fulfill({
      json: { subscriptions: [{ ...subscription, id: 43 }], multi_tariff_enabled: true },
    }),
  );
  await action.click();
  await expect(page).toHaveURL('/subscriptions');
  fixture.expectNoPayment();
});
