import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

const paymentMethod = {
  id: 'test-card',
  name: 'Тестовая карта',
  description: 'Локальный мок',
  min_amount_kopeks: 10_000,
  max_amount_kopeks: 100_000,
  is_available: true,
  quick_amounts: [30_000],
  open_url_direct: false,
};

const traffic = { selectable: false, mode: 'fixed', options: [], current: 100 };
const servers = { options: [], min: 0, max: 0, default: [], selected: [] };
const devices = {
  min: 1,
  max: 1,
  default: 1,
  current: 1,
  price_per_device_kopeks: 0,
  price_per_device_label: '0 ₽',
};

const classicOptions = {
  sales_mode: 'classic',
  currency: 'RUB',
  balance_kopeks: 20_000,
  balance_label: '200 ₽',
  subscription_id: null,
  periods: [
    {
      id: 'month',
      period_days: 30,
      months: 1,
      label: '30 дней',
      price_kopeks: 50_000,
      price_label: '500 ₽',
      per_month_price_kopeks: 50_000,
      per_month_price_label: '500 ₽',
      is_available: true,
      traffic,
      servers,
      devices,
    },
  ],
  traffic,
  servers,
  devices,
  selection: { period_id: 'month', period_days: 30, traffic_value: 100, servers: [], devices: 1 },
};

const classicPreview = {
  total_price_kopeks: 50_000,
  total_price_label: '500 ₽',
  per_month_price_kopeks: 50_000,
  per_month_price_label: '500 ₽',
  breakdown: [{ label: 'Период', value: '500 ₽' }],
  balance_kopeks: 20_000,
  balance_label: '200 ₽',
  missing_amount_kopeks: 30_000,
  can_purchase: false,
};

const tariff = (daily: boolean) => ({
  id: 7,
  name: daily ? 'Суточный' : 'Базовый',
  description: daily ? 'Оплата каждый день' : 'Оплата за месяц',
  tier_level: 1,
  traffic_limit_gb: 100,
  traffic_limit_label: '100 ГБ',
  is_unlimited_traffic: false,
  device_limit: 1,
  extra_devices_count: 0,
  servers_count: 0,
  servers: [],
  periods: daily
    ? []
    : [
        {
          days: 30,
          months: 1,
          label: '30 дней',
          price_kopeks: 50_000,
          price_label: '500 ₽',
          price_per_month_kopeks: 50_000,
          price_per_month_label: '500 ₽',
        },
      ],
  is_current: false,
  is_available: true,
  is_daily: daily,
  daily_price_kopeks: daily ? 5_000 : 0,
});

test('mobile Classic purchase saves the cart before choosing a top-up method @critical-flow', async ({
  page,
}) => {
  const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      '/api/cabinet/subscription/purchase-options': classicOptions,
      '/api/cabinet/subscription/purchase-preview': classicPreview,
      '/api/cabinet/balance/payment-methods': [paymentMethod],
    },
  });
  let selection: unknown;
  let purchaseRequests = 0;
  await page.route('**/api/cabinet/subscription/purchase', async (route) => {
    purchaseRequests += 1;
    selection = route.request().postDataJSON().selection;
    await route.fulfill({
      status: 402,
      json: {
        detail: {
          code: 'insufficient_funds',
          cart_saved: true,
          cart_mode: 'subscription_purchase',
          missing_amount: 30_000,
        },
      },
    });
  });

  await page.goto('/subscription/purchase');
  await page.getByRole('button', { name: /^Далее/ }).click();
  const topUp = page.getByRole('button', { name: 'Пополнить баланс', exact: true });
  await expect(topUp).toHaveCount(1);
  await expect(topUp).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Оплатить', exact: true })).toHaveCount(0);
  await expect(
    page.getByText(
      'На балансе не хватает 300.00 ₽. После пополнения вернитесь к выбору тарифа, проверьте параметры и нажмите «Оплатить» ещё раз, чтобы завершить покупку.',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByText(/После пополнения тариф оформится автоматически/)).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Пополнить', exact: true })).toHaveCount(0);
  await topUp.click();

  await expect(page).toHaveURL(/\/balance\/top-up\?amount=300/);
  await expect(page.getByRole('heading', { name: 'Выберите способ оплаты' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Тестовая карта/ })).toBeVisible();
  expect(selection).toEqual({
    period_id: 'month',
    period_days: 30,
    traffic_value: 100,
    servers: [],
    devices: 1,
  });
  expect(apiRequests).not.toContain('POST /api/cabinet/balance/topup');
  expect([...unexpectedApiRequests]).toEqual([]);

  // Returning after top-up reloads server state; Classic checkout requires another payment action.
  await page.goto('/subscription/purchase');
  await expect(page.getByRole('button', { name: /^Далее/ })).toBeVisible();
  expect(purchaseRequests).toBe(1);
});

for (const daily of [false, true]) {
  test(`${daily ? 'daily' : 'ordinary'} tariff sends purchase before top-up @critical-flow`, async ({
    page,
  }) => {
    const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
      language: 'ru',
      responses: {
        '/api/cabinet/subscription/purchase-options': {
          sales_mode: 'tariffs',
          tariffs: [tariff(daily)],
          current_tariff_id: null,
          balance_kopeks: 0,
          balance_label: '0 ₽',
        },
        '/api/cabinet/balance/payment-methods': [paymentMethod],
      },
    });
    let sentBody: Record<string, unknown> | undefined;
    await page.route('**/api/cabinet/subscription/purchase-tariff', async (route) => {
      sentBody = route.request().postDataJSON();
      await route.fulfill({
        status: 402,
        json: {
          detail: {
            code: 'insufficient_funds',
            cart_saved: true,
            cart_mode: 'tariff',
            missing_amount: daily ? 5_000 : 50_000,
          },
        },
      });
    });

    await page.goto('/subscription/purchase');
    const card = page
      .getByText(daily ? 'Оплата каждый день' : 'Оплата за месяц')
      .locator('xpath=ancestor::div[contains(@class, "bento-card-hover")][1]');
    await card.getByRole('button', { name: 'Купить' }).click();
    const pay = page.getByRole('button', { name: 'Оплатить', exact: true });
    await expect(pay).toBeVisible();
    await expect(page.getByRole('button', { name: 'Пополнить', exact: true })).toHaveCount(0);
    await pay.click();

    await expect(page).toHaveURL(new RegExp(`/balance/top-up\\?amount=${daily ? 50 : 500}`));
    expect(sentBody).toMatchObject({ tariff_id: 7, period_days: daily ? 1 : 30 });
    expect(apiRequests).not.toContain('POST /api/cabinet/balance/topup');
    expect([...unexpectedApiRequests]).toEqual([]);
  });
}
