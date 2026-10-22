import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription } from './classicRenewalFixture';
import { classicPurchaseOptions } from './classicPurchasePricingFixture';

for (const status of ['limited', 'pending', 'disabled'] as const) {
  test(`paid classic ${status} shows unavailable renewal without a purchase detour`, async ({
    page,
  }) => {
    const current = { ...subscription, status, is_active: false, is_limited: status === 'limited' };
    const { apiRequests } = await prepareAuthenticatedPage(page, {
      language: 'ru',
      responses: {
        ...responses,
        '/api/cabinet/subscription': { has_subscription: true, subscription: current },
        '/api/cabinet/subscriptions': { subscriptions: [current], multi_tariff_enabled: false },
        '/api/cabinet/subscription/purchase-options': classicPurchaseOptions,
      },
    });
    await page.goto('/subscriptions/42');
    await expect(page.getByRole('note')).toHaveText(
      'Продление недоступно в текущем состоянии подписки.',
    );
    await expect(
      page.getByRole('link', { name: /Продлить подписку|Оформить подписку/ }),
    ).toHaveCount(0);
    await expect(page).toHaveURL('/subscriptions/42');
    expect(
      apiRequests.filter((request) => /^POST .*subscription\/(purchase|renew)/.test(request)),
    ).toEqual([]);
  });
}

test('trial conversion keeps the selected subscription for both status and purchase options', async ({
  page,
}) => {
  const primary = { ...subscription, tariff_id: 7, tariff_name: 'Основной тариф' };
  const trial = {
    ...subscription,
    id: 43,
    is_trial: true,
    tariff_id: 8,
    tariff_name: 'Пробный тариф',
  };
  const requestedIds: (string | null)[] = [];
  const { apiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscriptions': { subscriptions: [primary, trial], multi_tariff_enabled: true },
    },
  });
  await page.route(/\/api\/cabinet\/subscription(?:\/purchase-options)?(?:\?|$)/, async (route) => {
    const url = new URL(route.request().url());
    const id = url.searchParams.get('subscription_id');
    requestedIds.push(id);
    await route.fulfill({
      json: url.pathname.endsWith('/purchase-options')
        ? { sales_mode: 'tariffs', tariffs: [], balance_kopeks: 20_000 }
        : { has_subscription: true, subscription: id === '43' ? trial : primary },
    });
  });
  await page.goto('/subscriptions/43');
  // The trial-specific label is localized; its explicit destination is the stable contract.
  const purchase = page.locator('main a[href="/subscription/purchase?subscriptionId=43"]');
  await expect(purchase).toBeVisible();
  await expect(page.locator('[data-subscription-overview]')).toContainText('Пробный');
  requestedIds.length = 0;
  await purchase.click();
  await expect(page).toHaveURL('/subscription/purchase?subscriptionId=43');
  await expect(page.getByText('Доступных опций нет', { exact: true })).toBeVisible();
  expect(requestedIds.length).toBeGreaterThanOrEqual(2);
  expect(requestedIds.every((id) => id === '43')).toBe(true);
  expect(apiRequests.some((request) => /^POST .*\/purchase/.test(request))).toBe(false);
});

test('device funding return permits a smaller quantity under fresh limits and charges only after confirmation', async ({
  page,
}) => {
  const current = { ...subscription, device_limit: 1, end_date: '2027-01-24T00:00:00Z' };
  let funded = false;
  const purchases: { devices: number; subscriptionId: string | null }[] = [];
  const { apiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscription': { has_subscription: true, subscription: current },
      '/api/cabinet/subscriptions': { subscriptions: [current], multi_tariff_enabled: false },
    },
  });
  await page.route(/\/api\/cabinet\/balance(?:\?|$)/, (route) =>
    route.fulfill({
      json: {
        balance_kopeks: funded ? 100_000 : 0,
        balance_rubles: funded ? 1000 : 0,
      },
    }),
  );
  await page.route(/\/api\/cabinet\/subscription\/devices\/price(?:\?|$)/, async (route) => {
    const count = Number(new URL(route.request().url()).searchParams.get('devices'));
    await route.fulfill({
      json:
        funded && count > 2
          ? {
              available: false,
              reason_code: 'can_add_limited',
              can_add: 2,
              current_device_limit: 1,
              max_device_limit: 3,
            }
          : {
              available: true,
              devices: count,
              current_device_limit: 1,
              max_device_limit: funded ? 3 : 5,
              total_price_kopeks: 10000 * count,
              total_price_label: `${100 * count} ₽`,
              days_left: 97,
              price_per_device_kopeks: 10000,
              price_per_device_label: '100 ₽',
            },
    });
  });
  await page.route(/\/api\/cabinet\/subscription\/devices\/purchase(?:\?|$)/, async (route) => {
    purchases.push({
      devices: route.request().postDataJSON().devices,
      subscriptionId: new URL(route.request().url()).searchParams.get('subscription_id'),
    });
    await route.fulfill({ json: { success: true, new_device_limit: 3, price_kopeks: 20000 } });
  });
  const returnTo = '/subscriptions/42?section=additional-options&action=devices';
  await page.goto(returnTo);
  const increment = page.getByRole('button', { name: 'Увеличить кол-во устройств', exact: true });
  await increment.click();
  await increment.click();
  await increment.click();
  await expect(page.getByText('400 ₽', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Пополнить', exact: true }).click();
  await expect(page).toHaveURL(
    `/balance/top-up?amount=400&returnTo=${encodeURIComponent(returnTo)}`,
  );
  funded = true;
  await page.goto(returnTo);
  await expect(
    page.getByText('Можно добавить максимум 2 устройства', { exact: true }),
  ).toBeVisible();
  const buy = page.getByRole('button', { name: 'Купить', exact: true });
  await expect(buy).toBeDisabled();
  expect(purchases).toEqual([]);
  const decrement = page.getByRole('button', { name: 'Уменьшить кол-во устройств', exact: true });
  await decrement.click();
  await decrement.click();
  await expect(page.getByText('200 ₽', { exact: true })).toBeVisible();
  await expect(buy).toBeEnabled();
  expect(purchases).toEqual([]);
  await buy.click();
  await expect.poll(() => purchases).toEqual([{ devices: 2, subscriptionId: '42' }]);
  expect(apiRequests).not.toContain('POST /api/cabinet/subscription/devices/save-cart');
  expect(apiRequests).not.toContain('POST /api/cabinet/subscription/purchase');
});
