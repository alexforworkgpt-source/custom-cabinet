import { expect, test, type Page } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription } from './classicRenewalFixture';

import {
  clearEntrances,
  expectEntrance,
  expectStationary,
  recordEntrances,
  waitForRestingGeometry,
} from './entranceProbe';
function deferred() {
  let release = () => {};
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

async function prepareManagement(
  page: Page,
  theme: string,
  responseStatuses: Record<string, number> = {},
  language = 'ru',
) {
  const result = await prepareAuthenticatedPage(page, {
    language,
    responseStatuses,
    responses: {
      ...responses,
      '/api/cabinet/subscription': {
        has_subscription: true,
        subscription: {
          ...subscription,
          servers: [{ uuid: 'nl', name: 'Нидерланды', country_code: 'NL' }],
        },
      },
    },
  });
  await page.addInitScript((value) => localStorage.setItem('cabinet-theme', value), theme);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  return result;
}

function expectStable(before: { y: number } | null, after: { y: number } | null) {
  if (!before || !after) throw new Error('Both loading and ready controls must be present');
  expect(Math.abs(after.y - before.y)).toBeLessThanOrEqual(4);
}

for (const theme of ['light', 'dark']) {
  test(`purchase options loading does not move management controls ${theme}`, async ({ page }) => {
    const options = deferred();
    await prepareManagement(page, theme);
    await page.route('**/api/cabinet/subscription/purchase-options**', async (route) => {
      await options.promise;
      await route.fallback();
    });
    await page.goto('/subscriptions/42', { waitUntil: 'domcontentloaded' });
    const devices = page.getByRole('link', { name: /Мои устройства/ });
    await expect(page.locator('[data-subscription-management-loading]')).toBeVisible();
    await expect(page.locator('[data-subscription-overview]')).toHaveCount(0);
    await expect(devices).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await expect(page.getByRole('link', { name: /Продлить подписку/ })).toHaveCount(0);
    const before = await page.locator('[data-subscription-devices-placeholder]').boundingBox();
    options.release();
    await expect(page.getByRole('link', { name: /Продлить подписку/ })).toBeVisible();
    const after = await devices.boundingBox();
    expectStable(before, after);
    const surface = await page
      .getByRole('link', { name: /Продлить подписку/ })
      .locator('.hover-border-gradient')
      .boundingBox();
    if (!surface || !after)
      throw new Error('The painted renewal surface and devices must be visible');
    expect(Math.abs(after.y - (surface.y + surface.height) - 16)).toBeLessThanOrEqual(1);
  });

  test(`cold loading reserves the overview and controls through staggered responses ${theme}`, async ({
    page,
  }, info) => {
    const details = deferred();
    const options = deferred();
    const devices = deferred();
    const { apiRequests } = await prepareManagement(page, theme);
    await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, async (route) => {
      await details.promise;
      await route.fallback();
    });
    await page.route('**/api/cabinet/subscription/purchase-options**', async (route) => {
      await options.promise;
      await route.fallback();
    });
    await page.route('**/api/cabinet/subscription/devices**', async (route) => {
      await devices.promise;
      await route.fallback();
    });
    await page.goto('/subscriptions/42', { waitUntil: 'domcontentloaded' });
    const skeleton = page.locator('[data-subscription-overview-skeleton]');
    await expect(skeleton).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Подписка', exact: true })).toHaveCount(1);
    await expect(page.getByRole('link', { name: /Продлить подписку/ })).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const initial = await skeleton.boundingBox();
    const initialDevices = await page
      .locator('[data-subscription-devices-placeholder]')
      .boundingBox();
    const capture = ['mobile-320', 'desktop-1280'].includes(info.project.name);
    if (capture)
      await page.screenshot({ path: info.outputPath(`skeleton-${theme}.png`), fullPage: true });
    const detailsResponse = page.waitForResponse(
      (response) => new URL(response.url()).pathname === '/api/cabinet/subscription',
    );
    details.release();
    await detailsResponse;
    const overview = page.locator('[data-subscription-overview]');
    const devicesLink = page.getByRole('link', { name: /Мои устройства/ });
    await expect(page.locator('[data-subscription-management-loading]')).toBeVisible();
    await expect(overview).toHaveCount(0);
    options.release();
    await expect(overview).toBeVisible();
    await expect(devicesLink.getByRole('status')).toBeVisible();
    await expect(devicesLink).not.toContainText('Недоступно');
    expectStable(initial, await overview.boundingBox());
    expectStable(initialDevices, await devicesLink.boundingBox());
    const loadedOverview = await overview.boundingBox();
    expect(Math.abs((loadedOverview?.height ?? 0) - (initial?.height ?? 0))).toBeLessThanOrEqual(4);
    const beforeOptions = await devicesLink.boundingBox();
    await expect(page.getByRole('link', { name: /Продлить подписку/ })).toBeVisible();
    expectStable(beforeOptions, await devicesLink.boundingBox());
    devices.release();
    await expect(devicesLink).toContainText('Подключено устройств: 0');
    expectStable(beforeOptions, await devicesLink.boundingBox());
    await expect(page.locator('[data-subscription-management-loading]')).toHaveCount(0);
    if (capture)
      await page.screenshot({ path: info.outputPath(`ready-${theme}.png`), fullPage: true });
    expect(
      apiRequests.filter((request) => /^POST .*subscription\/(purchase|renew)/.test(request)),
    ).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });

  test(`cached return keeps subscription content while financial conditions refresh ${theme}`, async ({
    page,
  }) => {
    let hold = false;
    const details = deferred();
    const options = deferred();
    await prepareManagement(page, theme);
    await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, async (route) => {
      if (hold) await details.promise;
      await route.fallback();
    });
    await page.route('**/api/cabinet/subscription/purchase-options**', async (route) => {
      if (hold) await options.promise;
      await route.fallback();
    });
    await page.goto('/subscriptions/42');
    await expect(page.getByRole('link', { name: /Продлить подписку/ })).toBeVisible();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const devices = page.getByRole('link', { name: /Мои устройства/ });
    const before = await devices.boundingBox();
    await page.getByRole('link', { name: 'Профиль', exact: true }).first().click();
    await expect(page).toHaveURL('/profile');
    await expect(page.locator('[data-subscription-overview]')).toHaveCount(0);
    hold = true;
    await page.goBack();
    await expect(page.locator('[data-subscription-overview]')).toBeVisible();
    await expect(page.locator('[data-subscription-management-loading]')).toHaveCount(0);
    await expect(page.locator('[data-subscription-purchase-loading]')).toHaveCount(0);
    const renewal = page.getByRole('link', { name: /Продлить подписку/ });
    await expect(renewal).toBeVisible();
    await expect(renewal).toHaveAttribute('aria-disabled', 'true');
    await expect(renewal).not.toHaveAttribute('href');
    expectStable(before, await devices.boundingBox());
    await devices.focus();
    details.release();
    options.release();
    await expect(renewal).toHaveAttribute('href', '/subscriptions/42/renew');
    expectStable(before, await devices.boundingBox());
    await expect(devices).toBeFocused();
  });

  test(`subscription errors end the skeleton and recover through retry ${theme}`, async ({
    page,
  }) => {
    await prepareManagement(page, theme, { '/api/cabinet/subscription': 503 });
    await page.goto('/subscriptions/42');
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.locator('[data-subscription-management-loading]')).toHaveCount(0);
    await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, (route) =>
      route.fulfill({
        json: responses['/api/cabinet/subscription'],
      }),
    );
    await page.getByRole('button', { name: 'Повторить', exact: true }).click();
    await expect(page.locator('[data-subscription-overview]')).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
  });

  test(`purchase options errors retain the overview and allow retry ${theme}`, async ({ page }) => {
    await prepareManagement(page, theme, { '/api/cabinet/subscription/purchase-options': 503 });
    await page.goto('/subscriptions/42');
    await expect(page.locator('[data-subscription-overview]')).toBeVisible();
    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page.locator('[data-subscription-purchase-loading]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Продлить подписку/ })).toHaveCount(0);
    await page.route('**/api/cabinet/subscription/purchase-options**', (route) =>
      route.fulfill({
        json: responses['/api/cabinet/subscription/purchase-options'],
      }),
    );
    await page.getByRole('button', { name: 'Повторить', exact: true }).click();
    await expect(page.getByRole('link', { name: /Продлить подписку/ })).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
  });
}

test('expired trial reserves only its own management sections while conditions load', async ({
  page,
}) => {
  const options = deferred();
  const trial = {
    ...subscription,
    status: 'expired',
    is_trial: true,
    is_active: false,
    is_expired: true,
    days_left: 0,
  };
  await prepareManagement(page, 'light');
  await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, (route) =>
    route.fulfill({ json: { has_subscription: true, subscription: trial } }),
  );
  await page.route('**/api/cabinet/subscription/purchase-options**', async (route) => {
    await options.promise;
    await route.fallback();
  });

  const details = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/cabinet/subscription',
  );
  await page.goto('/subscriptions/42', { waitUntil: 'domcontentloaded' });
  await details;
  const loading = page.locator('[data-subscription-management-loading]');
  await expect(loading).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Подписка', exact: true })).toBeVisible();
  await expect(loading.locator('[data-subscription-overview-skeleton]')).toBeVisible();
  await expect(loading.locator('[data-subscription-devices-placeholder]')).toBeVisible();
  await expect(loading.locator('[data-subscription-additional-options-skeleton]')).toHaveCount(0);
  await expect(loading.getByRole('status')).toHaveCount(1);
  await expect(loading.locator('a, button, input, [tabindex]')).toHaveCount(0);

  options.release();
  await expect(page.getByRole('link', { name: /Мои устройства/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Выберите тариф/ })).toBeVisible();
  await expect(loading).toHaveCount(0);
});

test('cached expired classic management reserves both action cards', async ({ page }) => {
  let hold = false;
  const options = deferred();
  const expired = { ...subscription, status: 'expired', is_active: false, is_expired: true };
  await prepareManagement(page, 'dark');
  await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, (route) =>
    route.fulfill({ json: { has_subscription: true, subscription: expired } }),
  );
  await page.route('**/api/cabinet/subscription/purchase-options**', async (route) => {
    if (hold) await options.promise;
    await route.fallback();
  });
  await page.goto('/subscriptions/42');
  const configure = page.getByRole('link', { name: 'Изменить подписку', exact: true });
  const devices = page.getByRole('link', { name: /Мои устройства/ });
  await expect(configure).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const before = await devices.boundingBox();
  await page.getByRole('link', { name: 'Профиль', exact: true }).first().click();
  await expect(page).toHaveURL('/profile');
  hold = true;
  await page.goBack();
  await expect(page.locator('[data-subscription-purchase-loading]')).toHaveCount(0);
  await expect(configure).toBeVisible();
  await expect(configure).toHaveAttribute('aria-disabled', 'true');
  await expect(configure).not.toHaveAttribute('href');
  expectStable(before, await devices.boundingBox());

  options.release();
  await expect(configure).toHaveAttribute(
    'href',
    '/subscription/purchase?subscriptionId=42&mode=configure',
  );
  expectStable(before, await devices.boundingBox());
});

test('known unlimited subscription reserves only the action and payment sections it can show', async ({
  page,
}) => {
  const options = deferred();
  const unlimited = { ...subscription, traffic_limit_gb: 0, device_limit: 0 };
  await prepareManagement(page, 'light');
  await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, (route) =>
    route.fulfill({ json: { has_subscription: true, subscription: unlimited } }),
  );
  await page.route('**/api/cabinet/subscription/purchase-options**', async (route) => {
    await options.promise;
    await route.fallback();
  });
  const details = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/cabinet/subscription',
  );
  await page.goto('/subscriptions/42', { waitUntil: 'domcontentloaded' });
  await details;
  const addons = page.locator('[data-subscription-additional-options-skeleton]');
  await expect(addons).toBeVisible();
  await expect(addons.locator('[data-subscription-addon-placeholder]')).toHaveCount(1);
  const autopay = page.locator('[data-subscription-autopay-placeholder]');
  await expect(autopay).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const before = await autopay.boundingBox();
  options.release();
  await expect(page.locator('[data-subscription-autopay]')).toBeVisible();
  expectStable(before, await page.locator('[data-subscription-autopay]').boundingBox());
});

test('a purchase options failure can be retried before the details arrive', async ({ page }) => {
  const details = deferred();
  let fail = true;
  await prepareManagement(page, 'light');
  await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, async (route) => {
    await details.promise;
    await route.fallback();
  });
  await page.route('**/api/cabinet/subscription/purchase-options**', (route) =>
    fail ? route.fulfill({ status: 503, json: { detail: 'Temporary failure' } }) : route.fallback(),
  );
  await page.goto('/subscriptions/42', { waitUntil: 'domcontentloaded' });
  const alert = page.getByRole('alert');
  await expect(alert).toBeVisible();
  await expect(page.locator('[data-subscription-management-loading]')).toHaveCount(0);
  fail = false;
  await alert.getByRole('button', { name: 'Повторить' }).click();
  await expect(page.locator('[data-subscription-management-loading]')).toBeVisible();
  details.release();
  await expect(page.getByRole('link', { name: /Продлить подписку/ })).toBeVisible();
});

const layoutCases = [
  {
    name: 'active trial',
    data: { status: 'trial', is_trial: true },
    addons: 0,
    autopay: false,
    daily: false,
    language: 'en',
  },
  {
    name: 'expiring paid',
    data: {
      days_left: 1,
      traffic_limit_gb: 0,
      traffic_accounting_mode: 'managed',
      traffic_remaining_gb: 75,
      base_traffic_remaining_gb: 50,
      next_traffic_refresh_at: '2026-12-01T10:00:00Z',
    },
    addons: 3,
    autopay: true,
    daily: false,
    language: 'fa',
  },
  {
    name: 'traffic limited',
    data: { status: 'limited', is_active: false, is_limited: true, traffic_used_percent: 100 },
    addons: 4,
    autopay: true,
    daily: false,
    language: 'zh',
  },
  {
    name: 'disabled periodic',
    data: { status: 'disabled', is_active: false },
    addons: 0,
    autopay: true,
    daily: false,
    language: 'ru',
  },
  {
    name: 'active daily',
    data: { is_daily: true, next_daily_charge_at: '2026-12-01T12:00:00Z' },
    addons: 4,
    autopay: false,
    daily: true,
    language: 'en',
  },
  {
    name: 'paused daily',
    data: { status: 'disabled', is_daily: true, is_active: false, is_daily_paused: true },
    addons: 0,
    autopay: false,
    daily: true,
    language: 'ru',
  },
  {
    name: 'expired daily',
    data: { status: 'expired', is_daily: true, is_active: false, is_expired: true },
    addons: 0,
    autopay: false,
    daily: true,
    language: 'ru',
  },
];

for (const { name, data, addons, autopay, daily, language } of layoutCases) {
  test(`known ${name} management reserves the available sections in ${language}`, async ({
    page,
  }) => {
    const options = deferred();
    const current = { ...subscription, ...data };
    await prepareManagement(page, 'dark', {}, language);
    await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, (route) =>
      route.fulfill({ json: { has_subscription: true, subscription: current } }),
    );
    await page.route('**/api/cabinet/subscription/purchase-options**', async (route) => {
      await options.promise;
      await route.fallback();
    });
    const details = page.waitForResponse(
      (response) => new URL(response.url()).pathname === '/api/cabinet/subscription',
    );
    await page.goto('/subscriptions/42', { waitUntil: 'domcontentloaded' });
    await details;
    const loading = page.locator('[data-subscription-management-loading]');
    await expect(loading.locator('[data-subscription-overview-skeleton]')).toBeVisible();
    await expect(loading.locator('[data-subscription-additional-options-skeleton]')).toHaveCount(
      addons ? 1 : 0,
    );
    await expect(loading.locator('[data-subscription-addon-placeholder]')).toHaveCount(addons);
    await expect(loading.locator('[data-subscription-autopay-placeholder]')).toHaveCount(
      autopay ? 1 : 0,
    );
    await expect(loading.locator('[data-subscription-daily-placeholder]')).toHaveCount(
      daily ? 1 : 0,
    );
    await expect(loading.locator('a, button, input, [tabindex]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const before = await loading.locator('[data-subscription-overview-skeleton]').boundingBox();
    if (language === 'fa') await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');

    options.release();
    const overview = page.locator('[data-subscription-overview]');
    await expect(overview).toBeVisible();
    await expect(loading).toHaveCount(0);
    const after = await overview.boundingBox();
    if (!before || !after) throw new Error('Overview must occupy space before and after loading');
    expect(Math.abs(before.height - after.height)).toBeLessThanOrEqual(4);
  });
}

test('known traffic package keeps its space and the enabled recurring panel loads separately', async ({
  page,
}) => {
  const terms = deferred();
  const recurring = deferred();
  const current = {
    ...subscription,
    traffic_accounting_mode: 'managed',
    traffic_remaining_gb: 80,
    traffic_purchases: [
      {
        id: 1,
        traffic_gb: 20,
        remaining_gb: 15,
        expires_at: '2026-12-15T00:00:00Z',
        created_at: '2026-10-15T00:00:00Z',
        days_remaining: 25,
        progress_percent: 33,
      },
    ],
  };
  const { apiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscription': { has_subscription: true, subscription: current },
      '/api/cabinet/subscription/purchase-options': {
        ...responses['/api/cabinet/subscription/purchase-options'],
        platega_recurrent_enabled: true,
      },
      '/api/cabinet/subscription/platega-recurrent': { status: 'none' },
    },
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/cabinet/subscription/purchase-options**', async (route) => {
    await terms.promise;
    await route.fallback();
  });
  await page.route('**/api/cabinet/subscription/platega-recurrent**', async (route) => {
    await recurring.promise;
    await route.fallback();
  });
  await page.goto('/subscriptions/42', { waitUntil: 'domcontentloaded' });
  const autopayPlaceholder = page.locator('[data-subscription-autopay-placeholder]');
  await expect(autopayPlaceholder).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const before = await autopayPlaceholder.boundingBox();
  terms.release();
  const autopay = page.locator('[data-subscription-autopay]');
  await expect(autopay).toBeVisible();
  await expect(page.getByText('Докупленный трафик', { exact: true })).toBeVisible();
  expectStable(before, await autopay.boundingBox());
  const panel = page.getByText('Автоплатёж по СБП', { exact: true });
  await expect(panel).toHaveCount(0);
  recurring.release();
  await expect(panel).toBeVisible();
  expect(apiRequests).not.toContain('GET /api/cabinet/subscription/lava-recurrent');
  expect(
    apiRequests.filter((request) => request.startsWith('POST /api/cabinet/subscription/')),
  ).toEqual([]);
});

for (const [responseName, detail] of [
  ['missing', null],
  ['mismatched', { ...subscription, id: 43 }],
] as const) {
  test(`a ${responseName} detail does not use a different subscription during loading`, async ({
    page,
  }) => {
    const details = deferred();
    const terms = deferred();
    const result = await prepareManagement(page, 'dark');
    await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, async (route) => {
      await details.promise;
      await route.fulfill({
        json: { has_subscription: detail !== null, subscription: detail },
      });
    });
    await page.route('**/api/cabinet/subscription/purchase-options**', async (route) => {
      await terms.promise;
      await route.fallback();
    });
    await page.goto('/subscriptions/42', { waitUntil: 'domcontentloaded' });
    const loading = page.locator('[data-subscription-management-loading]');
    await expect(loading).toBeVisible();
    await expect(loading.locator('[data-subscription-additional-options-skeleton]')).toHaveCount(0);
    details.release();
    await expect(page.getByRole('heading', { name: 'Подписка не найдена' })).toBeVisible();
    await expect(loading).toHaveCount(0);
    terms.release();
    expect(
      result.apiRequests.filter((request) => request.startsWith('POST /api/cabinet/subscription/')),
    ).toEqual([]);
  });
}

for (const reducedMotion of ['no-preference', 'reduce'] as const) {
  test(`expired trial cards enter after loading and respect ${reducedMotion}`, async ({ page }) => {
    const conditions = deferred();
    await prepareManagement(page, 'light');
    await page.emulateMedia({ reducedMotion });
    await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, (route) =>
      route.fulfill({
        json: {
          has_subscription: true,
          subscription: {
            ...subscription,
            status: 'expired',
            is_trial: true,
            is_active: false,
            is_expired: true,
            days_left: 0,
          },
        },
      }),
    );
    await page.route('**/api/cabinet/subscription/purchase-options**', async (route) => {
      await conditions.promise;
      await route.fallback();
    });
    await recordEntrances(page, {
      title: { css: 'main h1' },
      overview: { css: '[data-subscription-overview]' },
      action: { css: 'main a[href="/subscription/purchase?subscriptionId=42"]' },
      devices: { css: 'main a[href="/subscriptions/42?overlay=devices"]' },
    });
    await page.goto('/subscriptions/42', { waitUntil: 'domcontentloaded' });
    const heading = page.getByRole('heading', { name: 'Подписка', exact: true });
    await expect(heading).toBeVisible();
    await expect(page.locator('[data-subscription-management-loading]')).toBeVisible();
    await clearEntrances(page);
    conditions.release();

    const cards = ['overview', 'action', 'devices'];
    if (reducedMotion === 'no-preference') {
      for (const name of cards) await expectEntrance(page, name);
      await waitForRestingGeometry(page.getByRole('link', { name: /Мои устройства/ }));
      const startFartherThanOneCard = await page.evaluate(() =>
        Object.values(window.entranceFrames).some((frames) => frames.some(({ y }) => y > 8.05)),
      );
      expect(startFartherThanOneCard).toBe(false);
    } else {
      await expect
        .poll(() => page.evaluate(() => window.entranceFrames.devices?.length ?? 0))
        .toBeGreaterThan(5);
      await expectStationary(page, cards);
    }
    await expectStationary(page, ['title']);
  });
}
