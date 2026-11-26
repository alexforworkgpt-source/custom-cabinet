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

test('uses a noninteractive loading surface for an unknown sales mode on a cold paid subscription', async ({
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
    const loading = page.locator('[data-subscription-management-loading]');
    await expect(loading.getByRole('status', { name: /Загрузка/ })).toBeVisible();
    await expect(loading.locator('button, a')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Мои устройства/ })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Продлить подписку/ })).toHaveCount(0);
  } finally {
    options.release();
  }
  await expect(page.getByRole('link', { name: /Продлить подписку/ })).toHaveAttribute(
    'href',
    '/subscriptions/42/renew',
  );
});

test('reserves the trial action while conditions are pending without allowing navigation', async ({
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
    const loading = page.locator('[data-subscription-management-loading]');
    await expect(loading.getByRole('status', { name: /Загрузка/ })).toBeVisible();
    await expect(loading.locator('button, a')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Мои устройства/ })).toHaveCount(0);
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

test('shows the same cached action until both fresh responses arrive', async ({ page }) => {
  const details = deferred();
  const options = deferred();
  let hold = false;
  let optionRequests = 0;
  await prepareAuthenticatedPage(page, { language: 'ru', responses });
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
  const renewal = page.getByRole('link', { name: /Продлить подписку/ });
  const selectTariff = page.getByRole('link', { name: /Выберите тариф/ });
  await expect(renewal).toHaveAttribute('href', '/subscriptions/42/renew');
  await page.locator('nav:visible a[href="/"]').first().click();
  await expect(page.locator('main [data-onboarding=balance]')).toBeVisible();
  hold = true;
  try {
    await page.locator('nav:visible a[href="/subscriptions/42"]').first().click();
    await expect(page.locator('[data-subscription-overview]')).toBeVisible();
    await expect(renewal).toBeVisible();
    await expect(renewal).toHaveAttribute('aria-disabled', 'true');
    await expect(renewal).not.toHaveAttribute('href');
    await expect(page.locator('[data-subscription-purchase-loading]')).toHaveCount(0);
    await expect.poll(() => optionRequests).toBe(2);

    const freshDetails = page.waitForResponse(
      (response) => new URL(response.url()).pathname === '/api/cabinet/subscription',
    );
    details.release();
    await (await freshDetails).finished();
    await expect(page.locator('[data-subscription-overview]')).toContainText(/Пробн/i);
    await expect(renewal).toHaveAttribute('aria-disabled', 'true');
    await expect(renewal).not.toHaveAttribute('href');
    await expect(selectTariff).toHaveCount(0);

    // A partial refresh can leave the trial in the request cache.
    await page.locator('nav:visible a[href="/"]').first().click();
    await expect(page.locator('main [data-onboarding=balance]')).toBeVisible();
    await page.locator('nav:visible a[href="/subscriptions/42"]').first().click();
    await expect(renewal).toBeVisible();
    await expect(renewal).toHaveAttribute('aria-disabled', 'true');
    await expect(renewal).not.toHaveAttribute('href');
    await expect(selectTariff).toHaveCount(0);
  } finally {
    details.release();
    options.release();
  }
  await expect(page.getByRole('link', { name: /Выберите тариф/ })).toHaveAttribute(
    'href',
    '/subscription/purchase?subscriptionId=42',
  );
});

test('keeps cached actions blocked offline and unlocks after reconnection', async ({
  page,
  context,
}) => {
  const options = deferred();
  let hold = false;
  await prepareAuthenticatedPage(page, { language: 'ru', responses });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/cabinet/subscription/purchase-options**', async (route) => {
    if (hold) await options.promise;
    await route.fallback();
  });
  const renewal = page.getByRole('link', { name: /Продлить подписку/ });
  await page.goto('/subscriptions/42');
  await expect(renewal).toHaveAttribute('href', '/subscriptions/42/renew');
  await page.locator('nav:visible a[href="/"]').first().click();
  await expect(page.locator('main [data-onboarding=balance]')).toBeVisible();
  hold = true;
  try {
    await context.setOffline(true);
    await page.waitForFunction(() => !navigator.onLine);
    await page.locator('nav:visible a[href="/subscriptions/42"]').first().click();
    await expect(renewal).toBeVisible();
    await expect(renewal).toHaveAttribute('aria-disabled', 'true');
    await expect(renewal).not.toHaveAttribute('href');
    await expect(
      page.getByRole('status').filter({ hasText: 'Нет подключения к интернету' }),
    ).toBeVisible();
    await renewal.focus();
    await renewal.press('Enter');
    await expect(page).toHaveURL('/subscriptions/42');
    await context.setOffline(false);
    await expect(renewal).not.toHaveAttribute('href');
    options.release();
    await expect(renewal).toHaveAttribute('href', '/subscriptions/42/renew');
    await expect(renewal).toBeFocused();
  } finally {
    options.release();
    await context.setOffline(false);
  }
});

for (const path of ['/api/cabinet/subscription', '/api/cabinet/subscription/purchase-options']) {
  test(`retains disabled actions after a refresh error and enables them on retry ${path}`, async ({
    page,
  }) => {
    let fail = false;
    await prepareAuthenticatedPage(page, { language: 'ru', responses });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route(
      (url) => url.pathname === path,
      async (route) => {
        if (fail) await route.fulfill({ status: 500, json: { detail: 'Mock refresh failure' } });
        else await route.fallback();
      },
    );
    const renewal = page.getByRole('link', { name: /Продлить подписку/ });
    await page.goto('/subscriptions/42');
    await expect(renewal).toHaveAttribute('href', '/subscriptions/42/renew');
    await page.locator('nav:visible a[href="/"]').first().click();
    await expect(page.locator('main [data-onboarding=balance]')).toBeVisible();
    fail = true;
    await page.locator('nav:visible a[href="/subscriptions/42"]').first().click();
    const notice = page.getByRole('alert');
    await expect(notice).toBeVisible();
    await expect(page.locator('[data-subscription-overview]')).toBeVisible();
    await expect(renewal).toBeVisible();
    await expect(renewal).toHaveAttribute('aria-disabled', 'true');
    await expect(renewal).not.toHaveAttribute('href');
    fail = false;
    await notice.getByRole('button', { name: 'Повторить' }).click();
    await expect(renewal).toHaveAttribute('href', '/subscriptions/42/renew');
    await expect(notice).toHaveCount(0);
  });
}

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
  const balance = page.getByRole('link', { name: /Баланс/ }).first();
  let before: { y: number } | null = null;
  try {
    await page.goto('/');
    await expect(purchase).toBeVisible();
    await expect(balance).toHaveCount(0);
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
  await expect(balance).toBeVisible();
});
