import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription } from './classicRenewalFixture';
import { classicPurchaseOptions } from './classicPurchasePricingFixture';

const tariffOptions = {
  sales_mode: 'tariffs',
  balance_kopeks: 100000,
  tariffs: [
    {
      id: 7,
      name: 'Дополнительный тариф',
      description: 'Каталог для нескольких подписок',
      traffic_limit_gb: 100,
      traffic_limit_label: '100 ГБ',
      device_limit: 3,
      servers: [],
      is_available: true,
      is_current: false,
      periods: [{ days: 30, months: 1, price_kopeks: 10000, price_label: '100 ₽' }],
    },
  ],
};
const multi = {
  subscriptions: [subscription, { ...subscription, id: 43 }],
  multi_tariff_enabled: true,
};

test('generic tariff catalogue does not require an unavailable primary subscription endpoint', async ({
  page,
}) => {
  const { apiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscriptions': multi,
      '/api/cabinet/subscription/purchase-options': tariffOptions,
    },
    responseStatuses: { '/api/cabinet/subscription': 400 },
  });
  await page.goto('/subscription/purchase');
  await expect(page.locator('[data-purchase-layout="tariffs"]')).toBeVisible();
  await expect(page.getByText('Дополнительный тариф', { exact: true })).toBeVisible();
  expect(apiRequests).not.toContain('GET /api/cabinet/subscription');
  expect(apiRequests.some((request) => /^POST .*\/purchase/.test(request))).toBe(false);
});

test('a purchase-options failure in the multi-subscription list is retryable without reloading', async ({
  page,
}) => {
  const { apiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscriptions': multi,
    },
  });
  let available = false;
  await page.route('**/api/cabinet/subscription/purchase-options**', (route) =>
    route.fulfill({
      status: available ? 200 : 503,
      json: available ? tariffOptions : { detail: 'Temporary purchase-options failure' },
    }),
  );
  await page.goto('/subscriptions');
  await expect(page.getByRole('heading', { name: 'Мои подписки', exact: true })).toBeVisible();
  const failure = page.getByRole('alert');
  await expect(failure).toBeVisible();
  await expect(page.getByRole('button', { name: 'Купить ещё', exact: true })).toHaveCount(0);
  available = true;
  await failure.getByRole('button', { name: 'Повторить', exact: true }).click();
  await expect(failure).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Купить ещё', exact: true })).toBeVisible();
  await expect(page).toHaveURL('/subscriptions');
  await page.getByRole('button', { name: 'Купить ещё', exact: true }).click();
  await expect(page.locator('[data-purchase-layout="tariffs"]')).toBeVisible();
  expect(apiRequests.some((request) => /^POST .*\/purchase/.test(request))).toBe(false);
});

for (const mode of ['classic', 'selected-tariff'] as const) {
  test(`${mode} still requires its subscription query before presenting purchase controls`, async ({
    page,
  }) => {
    const { apiRequests } = await prepareAuthenticatedPage(page, {
      language: 'ru',
      responses: {
        ...responses,
        '/api/cabinet/subscriptions': multi,
        '/api/cabinet/subscription/purchase-options':
          mode === 'classic' ? classicPurchaseOptions : tariffOptions,
      },
      responseStatuses: { '/api/cabinet/subscription': 503 },
    });
    const path =
      mode === 'classic' ? '/subscription/purchase' : '/subscription/purchase?subscriptionId=42';
    await page.goto(path);
    await expect(page.getByText('Не удалось загрузить подписку', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Повторить', exact: true })).toBeVisible();
    await expect(page.locator('[data-purchase-layout="tariffs"]')).toHaveCount(0);
    expect(apiRequests.some((request) => /^POST .*\/purchase/.test(request))).toBe(false);
  });
}
