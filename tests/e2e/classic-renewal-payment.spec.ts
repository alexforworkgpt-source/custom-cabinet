import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

const subscription = {
  id: 42,
  status: 'active',
  is_trial: false,
  start_date: '2026-09-01T00:00:00Z',
  end_date: '2026-10-30T00:00:00Z',
  days_left: 30,
  hours_left: 0,
  minutes_left: 0,
  time_left_display: '30 дней',
  traffic_limit_gb: 100,
  traffic_used_gb: 0,
  traffic_used_percent: 0,
  device_limit: 3,
  connected_squads: [],
  servers: [],
  autopay_enabled: false,
  autopay_days_before: 3,
  subscription_url: 'https://example.test/subscription',
  hide_subscription_link: false,
  is_active: true,
  is_expired: false,
  is_limited: false,
};

const responses = {
  '/api/cabinet/subscription': { has_subscription: true, subscription },
  '/api/cabinet/subscriptions': { subscriptions: [subscription], multi_tariff_enabled: false },
  '/api/cabinet/subscription/devices': { devices: [], total: 0, device_limit: 3 },
  '/api/cabinet/subscription/refresh-traffic': {
    traffic_used_gb: 0,
    traffic_used_percent: 0,
    is_unlimited: false,
  },
  '/api/cabinet/subscription/purchase-options': {
    sales_mode: 'classic',
    balance_kopeks: 20_000,
    periods: [],
    platega_recurrent_enabled: false,
    lava_recurrent_enabled: false,
  },
  '/api/cabinet/subscription/renewal-options': [
    {
      period_days: 30,
      price_kopeks: 50_000,
      price_rubles: 500,
      discount_percent: 0,
      original_price_kopeks: null,
    },
    {
      period_days: 90,
      price_kopeks: 120_000,
      price_rubles: 1200,
      discount_percent: 20,
      original_price_kopeks: 150_000,
    },
  ],
  '/api/cabinet/balance/payment-methods': [
    {
      id: 'test-card',
      name: 'Тестовая карта',
      description: 'Локальный мок',
      min_amount_kopeks: 10_000,
      max_amount_kopeks: 200_000,
      is_available: true,
      quick_amounts: [100_000],
      open_url_direct: false,
    },
  ],
};

test('classic management renews with the selected period before top-up @critical-flow', async ({
  page,
}) => {
  const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses,
  });
  const sent: { period_days: number; subscription_id: string | null }[] = [];
  await page.route(/\/api\/cabinet\/subscription\/renew(?:\?|$)/, async (route) => {
    const request = route.request();
    sent.push({
      period_days: request.postDataJSON().period_days,
      subscription_id: new URL(request.url()).searchParams.get('subscription_id'),
    });
    await route.fulfill({
      status: 402,
      json: {
        detail: {
          code: 'insufficient_funds',
          cart_saved: true,
          cart_mode: 'extend',
          missing_amount: 100_000,
        },
      },
    });
  });

  await page.goto('/subscriptions/42');
  const renew = page.getByRole('link', {
    name: /Продлить подписку.*Продление с текущими параметрами/,
  });
  await expect(renew).toHaveAttribute('href', '/subscriptions/42/renew');
  await renew.click();
  await expect(page).toHaveURL('/subscriptions/42/renew');
  await expect(page.getByText('Трафик: 100 ГБ · Устройства: 3', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /^90 дней/ }).click();
  const topUp = page.getByRole('button', { name: 'Пополнить баланс', exact: true });
  await expect(topUp).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Оплатить', exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await topUp.click();
  await expect(page).toHaveURL(
    '/balance/top-up?amount=1000&returnTo=%2Fsubscriptions%2F42%2Frenew',
  );
  await expect(page.getByRole('button', { name: /Тестовая карта/ })).toBeVisible();
  expect(sent).toEqual([{ period_days: 90, subscription_id: '42' }]);
  expect(apiRequests).not.toContain('POST /api/cabinet/subscription/purchase');
  expect(apiRequests).not.toContain('POST /api/cabinet/balance/topup');
  expect([...unexpectedApiRequests]).toEqual([]);

  await page.goto('/subscriptions/42/renew');
  await expect(page.getByRole('button', { name: /^90 дней/ })).toBeVisible();
  expect(sent).toHaveLength(1);
});

test('classic renewal pays directly when the balance covers the chosen period @critical-flow', async ({
  page,
}) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscription/purchase-options': {
        ...responses['/api/cabinet/subscription/purchase-options'],
        balance_kopeks: 50_000,
      },
    },
  });
  let renewals = 0;
  await page.route(/\/api\/cabinet\/subscription\/renew(?:\?|$)/, async (route) => {
    renewals += 1;
    expect(route.request().postDataJSON().period_days).toBe(30);
    await route.fulfill({
      json: {
        message: 'Subscription renewed successfully',
        new_end_date: '2026-11-29T00:00:00Z',
        amount_paid_kopeks: 50_000,
      },
    });
  });
  await page.goto('/subscriptions/42/renew');
  await page.getByRole('button', { name: /^30 дней/ }).click();
  await expect(page.getByRole('button', { name: 'Пополнить баланс', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Оплатить', exact: true }).click();
  await expect(page).toHaveURL('/subscriptions/42');
  expect(renewals).toBe(1);
  expect([...unexpectedApiRequests]).toEqual([]);
});
