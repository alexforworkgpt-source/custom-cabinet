import { expect, test, type Page } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses } from './classicRenewalFixture';
import { classicPurchaseOptions } from './classicPurchasePricingFixture';

function deferred() {
  let release = () => {};
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

async function prepareSales(
  page: Page,
  mode: string,
  theme: string,
  statuses: Record<string, number> = {},
) {
  const tariff = {
    id: 7,
    name: 'Базовый',
    description: 'Тариф для проверки',
    traffic_limit_label: '100 ГБ',
    device_limit: 3,
    servers: [],
    is_available: true,
    periods: classicPurchaseOptions.periods.map((period) => ({
      ...period,
      days: period.period_days,
    })),
  };
  const result = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responseStatuses: statuses,
    responses: {
      ...(mode === 'renewal'
        ? responses
        : {
            '/api/cabinet/subscription': { has_subscription: false, subscription: null },
            '/api/cabinet/subscriptions': { subscriptions: [], multi_tariff_enabled: false },
          }),
      '/api/cabinet/subscription/purchase-options':
        mode === 'tariff'
          ? { sales_mode: 'tariffs', tariffs: [tariff], balance_kopeks: 0 }
          : { ...classicPurchaseOptions, balance_kopeks: 0 },
      '/api/cabinet/subscription/renewal-options': classicPurchaseOptions.periods.map((period) => ({
        period_days: period.period_days,
        price_kopeks: period.price_kopeks,
        discount_percent: 0,
      })),
      '/api/cabinet/subscription/purchase-preview': {
        total_price_kopeks: 9900,
        total_price_label: '99 ₽',
        balance_kopeks: 0,
        missing_amount_kopeks: 9900,
        can_purchase: false,
        breakdown: [],
      },
      '/api/cabinet/promo/group-discounts': {
        group_name: 'Базовый юзер',
        device_discount_percent: 0,
        server_discount_percent: 0,
        traffic_discount_percent: 0,
        period_discounts: {},
      },
    },
  });
  await page.addInitScript((value) => localStorage.setItem('cabinet-theme', value), theme);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  return result;
}

function contentFor(page: Page, mode: string) {
  return mode === 'renewal'
    ? page.getByRole('button', { name: /^30 дней/ })
    : mode === 'classic'
      ? page.getByRole('button', { name: /^30 дней/ })
      : page.getByText('Тариф для проверки', { exact: true });
}
const pathFor = (mode: string) =>
  mode === 'renewal' ? '/subscriptions/42/renew' : '/subscription/purchase';

for (const mode of ['renewal', 'classic', 'tariff']) {
  for (const theme of ['light', 'dark']) {
    test(`sales shows choices while group context is slow for ${mode} content ${theme}`, async ({
      page,
    }) => {
      const promo = deferred();
      const { apiRequests } = await prepareSales(page, mode, theme);
      await page.route('**/api/cabinet/promo/group-discounts', async (route) => {
        await promo.promise;
        await route.fallback();
      });
      await page.goto(pathFor(mode));
      const title = page.getByRole('heading', { level: 1 });
      await expect(title).toBeVisible();
      const content = contentFor(page, mode);
      await expect(content).toBeVisible();
      await expect(page.getByText('Ваша группа: Базовый юзер', { exact: true })).toHaveCount(0);
      await expect(
        page.locator('[data-sales-context-loading], [data-renewal-conditions-loading]'),
      ).toHaveCount(0);
      promo.release();
      expect(
        apiRequests.filter((request) =>
          /^POST .*subscription\/(purchase(?:-tariff)?|renew)(?:\?|$)/.test(request),
        ),
      ).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    });

    test(`cold ${mode} keeps its header and omits retired banners while loading ${theme}`, async ({
      page,
    }, info) => {
      const options = deferred();
      await prepareSales(page, mode, theme);
      await page.route('**/api/cabinet/subscription/purchase-options**', async (route) => {
        await options.promise;
        await route.fallback();
      });
      await page.goto(pathFor(mode), { waitUntil: 'domcontentloaded' });
      const title = page.getByRole('heading', { level: 1 });
      await expect(title).toBeVisible();
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      const before = await title.boundingBox();
      await expect(page.locator('main [aria-busy="true"]').first()).toBeVisible();
      await expect(
        page.locator('[data-sales-context-loading], [data-renewal-conditions-loading]'),
      ).toHaveCount(0);
      const capture = ['mobile-320', 'desktop-1280'].includes(info.project.name);
      if (capture)
        await page.screenshot({
          path: info.outputPath(`${mode}-${theme}-skeleton.png`),
          fullPage: true,
        });
      options.release();
      await expect(contentFor(page, mode)).toBeVisible();
      const after = await title.boundingBox();
      if (!before || !after) throw new Error('The page header must remain visible');
      expect(Math.abs(before.y - after.y)).toBeLessThanOrEqual(1);
      expect(Math.abs(before.height - after.height)).toBeLessThanOrEqual(1);
      if (capture)
        await page.screenshot({
          path: info.outputPath(`${mode}-${theme}-ready.png`),
          fullPage: true,
        });
    });

    test(`critical options errors end ${mode} loading and allow retry ${theme}`, async ({
      page,
    }) => {
      await prepareSales(page, mode, theme, { '/api/cabinet/subscription/purchase-options': 503 });
      await page.goto(pathFor(mode));
      const retry = page.getByRole('button', { name: 'Повторить', exact: true });
      await expect(retry).toBeVisible();
      await expect(page.locator('main [aria-busy="true"]')).toHaveCount(0);
      await page.route('**/api/cabinet/subscription/purchase-options**', (route) =>
        route.fulfill({
          json:
            mode === 'tariff'
              ? { sales_mode: 'tariffs', tariffs: [], balance_kopeks: 0 }
              : classicPurchaseOptions,
        }),
      );
      await retry.click();
      if (mode !== 'tariff') {
        await expect(retry).toHaveCount(0);
        await expect(contentFor(page, mode)).toBeVisible();
      } else await expect(page.getByText('Доступных опций нет', { exact: true })).toBeVisible();
    });
  }
}

test('renewal goes from a neutral period placeholder to a known empty choice', async ({ page }) => {
  const options = deferred();
  await prepareSales(page, 'renewal', 'light');
  await page.route('**/api/cabinet/subscription/renewal-options**', async (route) => {
    await options.promise;
    await route.fulfill({ json: [] });
  });
  await page.goto(pathFor('renewal'), { waitUntil: 'domcontentloaded' });
  const periods = page.locator('[data-period-options-loading]');
  await expect(periods.locator(':scope > div')).toHaveCount(1);
  options.release();
  await expect(periods).toHaveCount(0);
});

test('classic loading uses the configured period count while the subscription list is pending', async ({
  page,
}) => {
  const list = deferred();
  await prepareSales(page, 'classic', 'light');
  await page.route('**/api/cabinet/subscription/purchase-options', (route) =>
    route.fulfill({
      json: { ...classicPurchaseOptions, periods: classicPurchaseOptions.periods.slice(0, 2) },
    }),
  );
  await page.route('**/api/cabinet/subscriptions', async (route) => {
    await list.promise;
    await route.fallback();
  });

  await page.goto(pathFor('classic'), { waitUntil: 'domcontentloaded' });
  const loading = page.locator('main [role="status"][aria-busy="true"]').first();
  await expect(loading.locator('[data-period-options-loading] > div')).toHaveCount(2);
  await expect(loading.locator('[data-classic-step-indicator] > span')).toHaveCount(3);
  await expect(loading.locator('a, button, input, [tabindex]')).toHaveCount(0);

  list.release();
  await expect(page.getByText('Шаг 1 из 3', { exact: true })).toBeVisible();
});

test('catalogue displays no invented tariff cards when the result is unknown or empty', async ({
  page,
}) => {
  const options = deferred();
  await prepareSales(page, 'tariff', 'dark');
  await page.route('**/api/cabinet/subscription/purchase-options**', async (route) => {
    await options.promise;
    await route.fulfill({ json: { sales_mode: 'tariffs', tariffs: [], balance_kopeks: 0 } });
  });
  await page.goto(pathFor('tariff'), { waitUntil: 'domcontentloaded' });
  await expect(page.locator('main [role="status"][aria-busy="true"]').first()).toBeVisible();
  const tariffCards = page.locator('[data-tariff-options-loading] > div');
  await expect(tariffCards).toHaveCount(0);
  options.release();
  await expect(page.getByText('Доступных опций нет', { exact: true })).toBeVisible();
});

test('classic device step stays open and ends price loading when the quote fails', async ({
  page,
}) => {
  const preview = deferred();
  await prepareSales(page, 'classic', 'light');
  await page.route('**/api/cabinet/subscription/purchase-preview', async (route) => {
    await preview.promise;
    await route.fulfill({ status: 503, json: { detail: 'Temporary quote failure' } });
  });
  await page.goto(pathFor('classic'), { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /^30 дней/ }).click();
  await page.getByRole('button', { name: /^Далее/ }).click();
  const layout = page.locator('[data-purchase-layout="classic"]');
  await expect(page.getByText('Шаг 2 из 3', { exact: true })).toBeVisible();
  await expect(layout.locator('[role="status"][aria-busy="true"]')).toBeVisible();
  preview.release();
  await expect(layout.getByRole('alert')).toBeVisible();
  await expect(layout.locator('[role="status"][aria-busy="true"]')).toHaveCount(0);
  await expect(page.getByText('Шаг 2 из 3', { exact: true })).toBeVisible();
});
