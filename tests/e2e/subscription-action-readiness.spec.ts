import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription as activeSubscription } from './classicRenewalFixture';

function deferred() {
  let release = () => {};
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

test('requests purchase conditions while the selected subscription is still loading', async ({
  page,
}) => {
  const subscription = deferred();
  const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses,
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route(
    (url) => url.pathname === '/api/cabinet/subscription',
    async (route) => {
      await subscription.promise;
      await route.fallback();
    },
  );
  try {
    const conditions = page.waitForRequest(
      (request) => new URL(request.url()).pathname === '/api/cabinet/subscription/purchase-options',
    );
    await page.goto('/subscriptions/42');
    await page.getByRole('heading', { name: 'Подписка', exact: true }).waitFor();
    await expect
      .poll(() => apiRequests.includes('GET /api/cabinet/subscription/purchase-options'))
      .toBe(true);
    expect(new URL((await conditions).url()).searchParams.get('subscription_id')).toBe('42');
    await expect(page.getByRole('link', { name: /Продлить подписку/ })).toHaveCount(0);
  } finally {
    subscription.release();
  }
  await expect(page.getByRole('link', { name: /Продлить подписку/ })).toBeVisible();
  expect(
    apiRequests.filter((r) => r === 'GET /api/cabinet/subscription/purchase-options'),
  ).toHaveLength(1);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('shows neutral pending text for an unknown sales mode on a cold paid subscription', async ({
  page,
}) => {
  const options = deferred();
  await prepareAuthenticatedPage(page, { language: 'ru', responses });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/cabinet/subscription/purchase-options**', async (route) => {
    await options.promise;
    await route.fallback();
  });
  try {
    await page.goto('/subscriptions/42');
    await page.getByRole('link', { name: /Мои устройства/ }).waitFor();
    await expect(page.getByRole('button', { name: /Проверяем условия/ })).toBeDisabled();
    await expect(page.getByRole('link', { name: /Продлить подписку/ })).toHaveCount(0);
  } finally {
    options.release();
  }
  await expect(page.getByRole('link', { name: /Продлить подписку/ })).toHaveAttribute(
    'href',
    '/subscriptions/42/renew',
  );
});

test('shows the trial upgrade action while its conditions are pending without allowing navigation', async ({
  page,
}) => {
  const options = deferred();
  const trial = { ...activeSubscription, is_trial: true };
  const { apiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscription': { has_subscription: true, subscription: trial },
      '/api/cabinet/subscriptions': { subscriptions: [trial], multi_tariff_enabled: false },
    },
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/cabinet/subscription/purchase-options**', async (route) => {
    await options.promise;
    await route.fallback();
  });
  try {
    await page.goto('/subscriptions/42');
    await page.getByRole('link', { name: /Мои устройства/ }).waitFor();
    await expect(page.getByRole('button', { name: /Выберите тариф/ })).toBeDisabled();
    await expect(page.getByRole('link', { name: /Выберите тариф/ })).toHaveCount(0);
    await expect(page).toHaveURL('/subscriptions/42');
    expect(
      apiRequests.filter((request) => request.startsWith('POST /api/cabinet/subscription/')),
    ).toEqual([]);
  } finally {
    options.release();
  }
  await expect(page.getByRole('link', { name: /Выберите тариф/ })).toHaveAttribute(
    'href',
    '/subscription/purchase?subscriptionId=42',
  );
});

test('keeps the cached action visible and blocked until both subscription and conditions are fresh', async ({
  page,
}) => {
  const details = deferred();
  const options = deferred();
  let hold = false;
  let optionRequests = 0;
  const { apiRequests } = await prepareAuthenticatedPage(page, { language: 'ru', responses });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route(
    (url) => url.pathname === '/api/cabinet/subscription',
    async (route) => {
      if (hold) {
        await details.promise;
        await route.fulfill({
          json: { has_subscription: true, subscription: { ...activeSubscription, is_trial: true } },
        });
      } else await route.fallback();
    },
  );
  await page.route('**/api/cabinet/subscription/purchase-options**', async (route) => {
    optionRequests += 1;
    if (hold) await options.promise;
    await route.fallback();
  });
  await page.goto('/subscriptions/42');
  await page.getByRole('link', { name: /Продлить подписку/ }).waitFor();
  await page.locator('nav:visible a[href="/profile"]').first().click();
  await page.getByRole('heading', { name: 'Профиль', exact: true }).waitFor();
  hold = true;
  try {
    await page.locator('nav:visible a[href="/subscriptions/42"]').first().click();
    const pending = page.getByRole('button', { name: /Продлить подписку/ });
    await expect(pending).toBeDisabled();
    await expect(page.getByRole('link', { name: /Продлить подписку/ })).toHaveCount(0);
    await expect.poll(() => optionRequests).toBe(2);
    const freshOptions = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === '/api/cabinet/subscription/purchase-options',
    );
    options.release();
    await (await freshOptions).finished();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    await expect
      .poll(
        () =>
          apiRequests.filter((r) => r === 'GET /api/cabinet/subscription/purchase-options').length,
      )
      .toBe(2);
    await expect(pending).toBeDisabled();
    await expect(page.getByRole('link', { name: /Продлить подписку/ })).toHaveCount(0);
  } finally {
    details.release();
    options.release();
  }
  await expect(page.getByRole('link', { name: /Выберите тариф/ })).toHaveAttribute(
    'href',
    '/subscription/purchase?subscriptionId=42',
  );
});

test('offers purchase before trial availability resolves and keeps it in place when trial appears', async ({
  page,
}) => {
  const trial = deferred();
  await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      '/api/cabinet/subscription/trial': {
        is_available: true,
        duration_days: 3,
        traffic_limit_gb: 10,
        device_limit: 1,
        requires_payment: false,
        price_kopeks: 0,
        price_rubles: 0,
        reason_unavailable: null,
      },
    },
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/cabinet/subscription/trial', async (route) => {
    await trial.promise;
    await route.fallback();
  });
  const purchase = page.getByRole('link', { name: 'Выберите тариф', exact: true });
  let before: { y: number } | null = null;
  try {
    await page.goto('/');
    await page
      .getByRole('link', { name: /Баланс/ })
      .first()
      .waitFor();
    await expect(purchase).toBeVisible();
    await expect(purchase).toHaveAttribute('href', '/subscription/purchase');
    await page.evaluate(() => document.fonts.ready);
    before = await purchase.boundingBox();
  } finally {
    trial.release();
  }
  await expect(
    page.getByRole('button', { name: 'Активировать бесплатно', exact: true }),
  ).toBeVisible();
  const after = await purchase.boundingBox();
  if (!before || !after)
    throw new Error('Purchase must remain visible before and after trial data');
  expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(1);
  await expect(purchase).toHaveCount(1);
});
