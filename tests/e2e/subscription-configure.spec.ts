import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription } from './classicRenewalFixture';
import { classicPurchaseOptions } from './classicPurchasePricingFixture';

for (const status of ['active', 'expired']) {
  test(`${status} tariff subscription opens the catalogue for its own ID`, async ({ page }) => {
    const current = {
      ...subscription,
      tariff_id: 7,
      tariff_name: 'Текущий',
      status,
      is_active: status === 'active',
      is_expired: status === 'expired',
    };
    const { apiRequests } = await prepareAuthenticatedPage(page, {
      language: 'ru',
      responses: {
        ...responses,
        '/api/cabinet/subscription/platega-recurrent': { status: 'none' },
        '/api/cabinet/subscription/lava-recurrent': { status: 'none' },
        '/api/cabinet/subscription': { has_subscription: true, subscription: current },
        '/api/cabinet/subscriptions': { subscriptions: [current], multi_tariff_enabled: false },
        '/api/cabinet/subscription/purchase-options': {
          sales_mode: 'tariffs',
          balance_kopeks: 0,
          subscription_is_expired: status === 'expired',
          tariffs: [
            {
              id: 8,
              name: 'Другой тариф',
              description: 'Один аппарат',
              traffic_limit_gb: 100,
              traffic_limit_label: '100 ГБ',
              device_limit: 1,
              servers_count: 0,
              servers: [],
              is_available: true,
              periods: [
                {
                  days: 30,
                  months: 1,
                  label: '30 дней',
                  price_kopeks: 9900,
                  price_label: '99 ₽',
                  price_per_month_kopeks: 9900,
                  price_per_month_label: '99 ₽',
                },
              ],
            },
          ],
        },
      },
    });
    await page.goto('/subscriptions/42', { waitUntil: 'domcontentloaded' });
    const renew = page.getByRole('link', { name: /Продлить подписку/ });
    const choose = page.getByRole('link', { name: 'Выбрать тариф', exact: true });
    await expect(renew).toHaveAttribute('href', '/subscriptions/42/renew');
    await expect(choose).toBeVisible();
    const [renewBox, chooseBox] = await Promise.all([renew.boundingBox(), choose.boundingBox()]);
    if (!chooseBox || !renewBox) throw new Error('Subscription actions are missing');
    expect(chooseBox.y).toBeGreaterThanOrEqual(renewBox.y + renewBox.height);
    await choose.click();
    await expect(page).toHaveURL('/subscription/purchase?subscriptionId=42');
    await expect(page.getByText('Другой тариф', { exact: true })).toBeVisible();
    expect(
      apiRequests.filter((request) => /^POST .*\/(purchase|renew|switch)$/.test(request)),
    ).toEqual([]);
  });
}

test('classic configuration entry keeps active paid subscriptions in management', async ({
  page,
}) => {
  const { apiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscription/purchase-options': classicPurchaseOptions,
    },
  });
  await page.goto('/subscription/purchase?subscriptionId=42&mode=configure', {
    waitUntil: 'domcontentloaded',
  });
  await expect(page).toHaveURL('/subscriptions/42');
  await expect(page.getByRole('link', { name: 'Изменить подписку', exact: true })).toHaveCount(0);
  expect(apiRequests).not.toContain('POST /api/cabinet/subscription/purchase-preview');
});

test('expired classic subscription can choose one device and save its new configuration before top-up', async ({
  page,
}) => {
  const expired = { ...subscription, status: 'expired', is_active: false, is_expired: true };
  const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscription/platega-recurrent': { status: 'none' },
      '/api/cabinet/subscription/lava-recurrent': { status: 'none' },
      '/api/cabinet/subscription': { has_subscription: true, subscription: expired },
      '/api/cabinet/subscriptions': { subscriptions: [expired], multi_tariff_enabled: false },
      '/api/cabinet/subscription/purchase-options': {
        ...classicPurchaseOptions,
        subscription_id: 42,
        balance_kopeks: 0,
        devices: { ...classicPurchaseOptions.devices, default: 3, current: 3 },
        periods: classicPurchaseOptions.periods.map((period) => ({
          ...period,
          devices: { ...period.devices, default: 3, current: 3 },
        })),
        selection: { ...classicPurchaseOptions.selection, devices: 3 },
      },
    },
  });
  const selections: unknown[] = [];
  await page.route(
    (url) => url.pathname === '/api/cabinet/subscription/purchase-preview',
    (route) => {
      const selection = route.request().postDataJSON().selection;
      const total = selection.devices === 1 ? 9900 : 29900;
      return route.fulfill({
        json: {
          total_price_kopeks: total,
          total_price_label: `${total / 100} ₽`,
          per_month_price_kopeks: total,
          per_month_price_label: `${total / 100} ₽`,
          balance_kopeks: 0,
          balance_label: '0 ₽',
          missing_amount_kopeks: total,
          can_purchase: false,
          breakdown: [{ label: 'Устройства', value: String(selection.devices) }],
        },
      });
    },
  );
  await page.route(
    (url) => url.pathname === '/api/cabinet/subscription/purchase',
    async (route) => {
      expect(new URL(route.request().url()).searchParams.get('subscription_id')).toBe('42');
      selections.push(route.request().postDataJSON().selection);
      await route.fulfill({
        status: 402,
        json: {
          detail: {
            code: 'insufficient_funds',
            cart_saved: true,
            cart_mode: 'subscription_purchase',
            missing_amount: 9900,
          },
        },
      });
    },
  );
  await page.goto('/subscriptions/42', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('link', { name: /Продлить подписку/ })).toHaveAttribute(
    'href',
    '/subscriptions/42/renew',
  );
  await page.getByRole('link', { name: 'Изменить подписку', exact: true }).click();
  await expect(page).toHaveURL('/subscription/purchase?subscriptionId=42&mode=configure');
  const wizard = page.locator('[data-purchase-layout="classic"]');
  await wizard.getByRole('button', { name: /^30 дней/ }).click();
  await wizard.getByRole('button', { name: /^Далее/ }).click();
  await wizard.getByRole('button', { name: '-', exact: true }).click();
  await wizard.getByRole('button', { name: '-', exact: true }).click();
  await wizard.getByRole('button', { name: /^Далее/ }).click();
  expect(selections).toEqual([]);
  await wizard.getByRole('button', { name: 'Пополнить баланс', exact: true }).click();
  await expect(page).toHaveURL(/\/balance\/top-up\?amount=99&returnTo=/);
  expect(selections).toEqual([
    {
      period_id: 'days:30',
      period_days: 30,
      traffic_value: 100,
      servers: [],
      devices: 1,
    },
  ]);
  expect(apiRequests).not.toContain('POST /api/cabinet/subscription/renew');
  expect([...unexpectedApiRequests]).toEqual([]);
});
