import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

import { responses, subscription } from './classicRenewalFixture';

test('retries balance renewal with the same operation and confirmed term @critical-flow', async ({
  page,
}) => {
  test.skip(process.env.VITE_UPSTREAM_BOT_SHA !== '64beb370e6d69b23d3b651f91033f3b72e9e1f56');
  await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscription/purchase-options': {
        ...responses['/api/cabinet/subscription/purchase-options'],
        balance_kopeks: 50_000,
      },
    },
  });
  const attempts: unknown[] = [];
  await page.route(/\/api\/cabinet\/subscription\/renew(?:\?|$)/, async (route) => {
    attempts.push(route.request().postDataJSON());
    if (attempts.length === 1) {
      await route.abort('connectionreset');
      return;
    }
    await route.fulfill({ json: { new_end_date: '2026-11-29T00:00:00Z' } });
  });
  await page.goto('/subscriptions/42/renew');
  await page.getByRole('button', { name: /^30 дней/ }).click();
  await page.getByRole('button', { name: 'Оплатить', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Операция могла выполниться');
  await page.getByRole('button', { name: 'Повторить', exact: true }).click();
  await expect(page).toHaveURL('/subscriptions/42');
  expect(attempts).toHaveLength(2);
  expect(attempts[0]).toMatchObject({
    subscription_id: 42,
    period_days: 30,
    expected_end_date: subscription.end_date,
    operation_id: expect.stringMatching(/^[0-9a-f-]{36}$/i),
  });
  expect(attempts[1]).toEqual(attempts[0]);
});

for (const status of ['active', 'expired']) {
  test(`Dashboard waits for the sales mode before ${status} classic renewal @critical-flow`, async ({
    page,
  }) => {
    const current = {
      ...subscription,
      tariff_id: null,
      status,
      is_active: status === 'active',
      is_expired: status === 'expired',
    };
    await prepareAuthenticatedPage(page, {
      language: 'ru',
      responses: {
        ...responses,
        '/api/cabinet/subscription': { has_subscription: true, subscription: current },
        '/api/cabinet/subscriptions': { subscriptions: [current], multi_tariff_enabled: false },
      },
    });
    let release!: () => void;
    const waiting = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(/\/api\/cabinet\/subscription\/purchase-options(?:\?|$)/, async (route) => {
      await waiting;
      await route.fulfill({ json: responses['/api/cabinet/subscription/purchase-options'] });
    });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Управление подпиской/ }).click();
    await expect(page.getByRole('link', { name: /Мои устройства/ })).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Продлить подписку|Оформить подписку/ }),
    ).toHaveCount(0);
    release();
    const renew = page.getByRole('link', {
      name: /Продлить подписку.*Продление с текущими параметрами/,
    });
    await expect(renew).toHaveAttribute('href', '/subscriptions/42/renew');
    await renew.click();
    await expect(page).toHaveURL('/subscriptions/42/renew');
  });
}

test('Dashboard retries a failed sales mode without opening purchase @critical-flow', async ({
  page,
}) => {
  await prepareAuthenticatedPage(page, { language: 'ru', responses });
  let failed = true;
  await page.route(/\/api\/cabinet\/subscription\/purchase-options(?:\?|$)/, (route) =>
    route.fulfill({
      status: failed ? 503 : 200,
      json: failed
        ? { detail: 'Unavailable' }
        : responses['/api/cabinet/subscription/purchase-options'],
    }),
  );
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Управление подпиской/ }).click();
  await expect(page.getByText('Не удалось загрузить условия оплаты')).toBeVisible({
    timeout: 20000,
  });
  await expect(page.getByRole('link', { name: /Продлить подписку/ })).toHaveCount(0);
  failed = false;
  await page.getByRole('button', { name: 'Повторить', exact: true }).click();
  await page
    .getByRole('link', { name: /Продлить подписку.*Продление с текущими параметрами/ })
    .click();
  await expect(page).toHaveURL('/subscriptions/42/renew');
});

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
  const currentTerms = page.locator('[data-renewal-info]');
  await expect(currentTerms.getByText('Трафик', { exact: true }).locator('..')).toContainText(
    '100 ГБ',
  );
  await expect(currentTerms.getByText('Устройства', { exact: true }).locator('..')).toContainText(
    '3 устройства',
  );
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
