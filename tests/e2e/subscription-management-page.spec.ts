import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription as currentSubscription } from './classicRenewalFixture';
import { classicPurchaseOptions } from './classicPurchasePricingFixture';

test('management page shows compact subscription conditions above its existing controls', async ({
  page,
}) => {
  const { apiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscription': {
        has_subscription: true,
        subscription: {
          ...currentSubscription,
          servers: [{ uuid: 'nl', name: '🇳🇱', country_code: 'NL' }],
        },
      },
    },
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/subscriptions/42');
  await expect(page.getByRole('link', { name: 'Назад', exact: true })).toHaveCount(0);
  const overview = page.locator('[data-subscription-overview]');
  await expect(overview.getByRole('heading', { name: 'Текущий тариф', exact: true })).toBeVisible();
  await expect(overview.getByText('Активна', { exact: true })).toBeVisible();
  await expect(overview).toContainText('100 ГБ');
  await expect(overview).toContainText('3 устройства');
  await expect(overview).toContainText('🇳🇱');
  await expect(overview.locator('time')).toHaveAttribute('dateTime', currentSubscription.end_date);
  await expect(overview.getByRole('note')).toHaveCount(0);
  const renew = page.getByRole('link', { name: /Продлить подписку/ });
  await expect(renew).toBeVisible();
  const [overviewBox, renewBox] = await Promise.all([overview.boundingBox(), renew.boundingBox()]);
  if (!overviewBox || !renewBox)
    throw new Error('Subscription overview or renewal control is missing');
  expect(overviewBox.y).toBeLessThan(renewBox.y);
  await expect(page.getByRole('button', { name: /Настроить VPN/ })).toHaveCount(0);
  await expect(page.getByText('Осталось', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('switch', { name: 'Автопродление', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Мои устройства/ })).toBeVisible();
  const options = page.getByRole('heading', { name: 'Дополнительные опции', exact: true });
  await expect(options).toBeVisible();
  await expect(page.getByRole('button', { name: 'Дополнительные опции', exact: true })).toHaveCount(
    0,
  );
  await expect(page.getByRole('button', { name: /^Докупить устройства/ })).toBeVisible();
  const expectAutopayBelowOptions = async () => {
    const [autopayBox, optionsBox] = await Promise.all([
      page.locator('[data-subscription-autopay]').boundingBox(),
      options.locator('..').boundingBox(),
    ]);
    if (!autopayBox || !optionsBox)
      throw new Error('Autopay and additional options must be visible');
    expect(autopayBox.y).toBeGreaterThanOrEqual(optionsBox.y + optionsBox.height);
  };
  await expectAutopayBelowOptions();
  await options.click();
  await expect(page.getByRole('button', { name: /^Докупить устройства/ })).toBeVisible();
  await expectAutopayBelowOptions();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(
    apiRequests.filter((request) => /^POST .*subscription\/(purchase|renew)/.test(request)),
  ).toEqual([]);
});

test('paid subscription menu opens a normal management page', async ({ page }) => {
  const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses,
  });
  await page.goto('/');
  const nav =
    (page.viewportSize()?.width ?? 1280) >= 1024
      ? page.locator('header:visible nav')
      : page.locator('nav:visible');
  const subscription = nav.getByRole('link', { name: 'Подписка', exact: true });
  await expect(subscription).toHaveAttribute('href', '/subscriptions/42');
  await subscription.click();
  await expect(page).toHaveURL('/subscriptions/42');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Подписка', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: /Продлить подписку/ })).toBeVisible();
  await expect(subscription).toHaveAttribute('aria-current', 'page');
  await page.reload();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Продлить подписку/ })).toBeVisible();
  expect(apiRequests).not.toContain('POST /api/cabinet/subscription/purchase');
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('management keeps device viewing and returns to the same page', async ({ page }) => {
  await prepareAuthenticatedPage(page, { language: 'ru', responses });
  await page.goto('/subscriptions/42');
  await page.getByRole('link', { name: /Мои устройства/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL('/subscriptions/42');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Подписка', exact: true })).toBeVisible();
});

test('adding slots from the device dialog reveals the existing options on the page @critical-flow', async ({
  page,
}) => {
  await prepareAuthenticatedPage(page, { language: 'ru', responses });
  await page.goto('/subscriptions/42');
  await page.getByRole('link', { name: /Мои устройства/ }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Докупить устройства', exact: true })
    .click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(
    page.getByRole('heading', { name: 'Дополнительные опции', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Дополнительные опции', exact: true })).toHaveCount(
    0,
  );
});

test('a failed subscription list is retryable and never means no subscriptions @critical-flow', async ({
  page,
}) => {
  await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses,
    responseStatuses: { '/api/cabinet/subscriptions': 503 },
  });
  await page.goto('/subscriptions');
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Купить подписку', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Повторить/ }).first()).toBeVisible();
});

test('old classic purchase URL routes a paid subscription to management without a purchase preview @critical-flow', async ({
  page,
}) => {
  const { apiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscription/purchase-options': classicPurchaseOptions,
    },
  });
  await page.goto('/subscription/purchase?subscriptionId=42');
  await expect(page).toHaveURL('/subscriptions/42', { timeout: 15_000 });
  expect(apiRequests).not.toContain('POST /api/cabinet/subscription/purchase-preview');
  expect(apiRequests).not.toContain('POST /api/cabinet/subscription/purchase');
});

test('multiple subscriptions open a real list and preserve list back navigation @critical-flow', async ({
  page,
}) => {
  await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscriptions': {
        multi_tariff_enabled: true,
        subscriptions: [
          { ...currentSubscription, tariff_name: 'Первый тариф' },
          { ...currentSubscription, id: 43, tariff_name: 'Второй тариф' },
        ],
      },
    },
  });
  await page.goto('/subscriptions');
  await expect(page.getByRole('heading', { name: 'Мои подписки' })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.getByRole('button', { name: /^Первый тариф/ }).click();
  await expect(page).toHaveURL('/subscriptions/42');
  await expect(page.getByRole('link', { name: 'Назад', exact: true })).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL('/subscriptions');
});

test('device viewing retains the Home source for management with multiple subscriptions @critical-flow', async ({
  page,
}) => {
  await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscriptions': {
        subscriptions: [currentSubscription, { ...currentSubscription, id: 43 }],
        multi_tariff_enabled: true,
      },
    },
  });
  await page.goto('/?sub=42');
  await page.getByRole('button', { name: /Управление подпиской/ }).click();
  await page.getByRole('link', { name: /Мои устройства/ }).click();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('link', { name: 'Назад', exact: true })).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL('/?sub=42');
});

test('device funding returns to the same subscription and waits for a fresh manual confirmation @critical-flow', async ({
  page,
}) => {
  const sub = { ...currentSubscription, device_limit: 1, end_date: '2027-01-24T00:00:00Z' };
  const { apiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/balance': { balance_kopeks: 0, balance_rubles: 0 },
      '/api/cabinet/subscription': { has_subscription: true, subscription: sub },
      '/api/cabinet/subscriptions': { multi_tariff_enabled: false, subscriptions: [sub] },
      '/api/cabinet/subscription/devices/price': {
        available: true,
        devices: 1,
        current_device_limit: 1,
        max_device_limit: 5,
        days_left: 97,
        total_price_kopeks: 16166,
        total_price_label: '161.66 ₽',
        price_per_device_kopeks: 16166,
        price_per_device_label: '161.66 ₽',
      },
    },
  });
  const returnTo = '/subscriptions/42?section=additional-options&action=devices';
  await page.goto(returnTo);
  await page.getByRole('button', { name: 'Пополнить', exact: true }).click();
  await expect(page).toHaveURL(
    `/balance/top-up?amount=162&returnTo=${encodeURIComponent(returnTo)}`,
  );
  expect(apiRequests).not.toContain('POST /api/cabinet/subscription/devices/save-cart');
  expect(apiRequests).not.toContain('POST /api/cabinet/subscription/devices/purchase');
  await page.route(/\/api\/cabinet\/balance(?:\?|$)/, (route) =>
    route.fulfill({ json: { balance_kopeks: 30000, balance_rubles: 300 } }),
  );
  let purchases = 0;
  await page.route(/\/api\/cabinet\/subscription\/devices\/purchase(?:\?|$)/, async (route) => {
    purchases++;
    expect(route.request().postDataJSON().devices).toBe(1);
    expect(new URL(route.request().url()).searchParams.get('subscription_id')).toBe('42');
    await route.fulfill({ json: { success: true, new_device_limit: 2, price_kopeks: 16166 } });
  });
  await page.goto(returnTo);
  const buy = page.getByRole('button', { name: 'Купить', exact: true });
  await expect(buy).toBeEnabled();
  expect(purchases).toBe(0);
  await buy.click();
  await expect.poll(() => purchases).toBe(1);
  await expect(page.getByRole('heading', { name: 'Подписка', exact: true })).toBeVisible();
  expect(apiRequests).not.toContain('POST /api/cabinet/subscription/purchase');
});

for (const variant of ['trial', 'expired'] as const) {
  test(`${variant} subscription keeps its management destination @critical-flow`, async ({
    page,
  }) => {
    const sub = {
      ...currentSubscription,
      status: variant,
      is_trial: variant === 'trial',
      is_active: variant === 'trial',
      is_expired: variant === 'expired',
    };
    await prepareAuthenticatedPage(page, {
      language: 'ru',
      responses: {
        ...responses,
        '/api/cabinet/subscription': { has_subscription: true, subscription: sub },
        '/api/cabinet/subscriptions': { subscriptions: [sub], multi_tariff_enabled: false },
      },
    });
    await page.goto('/');
    const nav =
      (page.viewportSize()?.width ?? 1280) >= 1024
        ? page.locator('header:visible nav')
        : page.locator('nav:visible');
    await expect(nav.getByRole('link', { name: 'Подписка', exact: true })).toHaveAttribute(
      'href',
      '/subscriptions/42',
    );
    await nav.getByRole('link', { name: 'Подписка', exact: true }).click();
    const overview = page.locator('[data-subscription-overview]');
    await expect(
      overview.getByText(variant === 'trial' ? 'Пробный' : 'Истекла', { exact: true }),
    ).toBeVisible();
    await expect(overview.locator('time')).toHaveAttribute('dateTime', sub.end_date);
  });
}

test('Telegram Back from a directly opened management page stays inside the cabinet @telegram-flow', async ({
  page,
}) => {
  await prepareAuthenticatedPage(page, { responses });
  await page.addInitScript(() => {
    Object.defineProperty(window, 'TelegramWebviewProxy', {
      configurable: true,
      value: { postEvent() {} },
    });
  });
  const launch = new URLSearchParams({
    tgWebAppData: new URLSearchParams({
      auth_date: '1787443200',
      hash: 'browser-test-hash',
      signature: 'browser-test-signature',
      user: JSON.stringify({ id: 1, first_name: 'Browser', language_code: 'en' }),
    }).toString(),
    tgWebAppPlatform: 'tdesktop',
    tgWebAppVersion: '8.0',
    tgWebAppThemeParams: JSON.stringify({ bg_color: '#111827', text_color: '#f9fafb' }),
  });
  await page.goto(`/subscriptions/42#${launch}`);
  await expect(page.getByRole('heading', { name: 'Subscription', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.evaluate(() => {
    const host = window as typeof window & {
      Telegram?: { WebView?: { receiveEvent: (event: string) => void } };
    };
    host.Telegram?.WebView?.receiveEvent('back_button_pressed');
  });
  await expect(page).toHaveURL('/?sub=42');
});
