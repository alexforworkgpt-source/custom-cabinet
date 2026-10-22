import { expect, test, type Page } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription } from './classicRenewalFixture';

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
) {
  const result = await prepareAuthenticatedPage(page, {
    language: 'ru',
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
    await page.goto('/subscriptions/42');
    const devices = page.getByRole('link', { name: /Мои устройства/ });
    await expect(devices).toBeVisible();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    await expect(page.getByRole('link', { name: /Продлить подписку/ })).toHaveCount(0);
    const before = await devices.boundingBox();
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
    details.release();
    const overview = page.locator('[data-subscription-overview]');
    const devicesLink = page.getByRole('link', { name: /Мои устройства/ });
    await expect(overview).toBeVisible();
    await expect(devicesLink.getByRole('status')).toBeVisible();
    await expect(devicesLink).not.toContainText('Недоступно');
    expectStable(initial, await overview.boundingBox());
    expectStable(initialDevices, await devicesLink.boundingBox());
    const loadedOverview = await overview.boundingBox();
    expect(Math.abs((loadedOverview?.height ?? 0) - (initial?.height ?? 0))).toBeLessThanOrEqual(4);
    const beforeOptions = await devicesLink.boundingBox();
    options.release();
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
    await expect(page.locator('[data-subscription-purchase-loading]')).toBeVisible();
    await expect(page.getByRole('link', { name: /Продлить подписку/ })).toHaveCount(0);
    expectStable(before, await devices.boundingBox());
    details.release();
    options.release();
    await expect(page.getByRole('link', { name: /Продлить подписку/ })).toBeVisible();
    expectStable(before, await devices.boundingBox());
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
