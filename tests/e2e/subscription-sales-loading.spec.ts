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
    ? page.locator('[data-renewal-info]')
    : mode === 'classic'
      ? page.getByRole('button', { name: /^30 дней/ })
      : page.getByText('Тариф для проверки', { exact: true });
}
const pathFor = (mode: string) =>
  mode === 'renewal' ? '/subscriptions/42/renew' : '/subscription/purchase';

for (const mode of ['renewal', 'classic', 'tariff']) {
  for (const theme of ['light', 'dark']) {
    test(`sales loading waits for group context before revealing ${mode} content ${theme}`, async ({
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
      await expect(content).not.toBeVisible();
      promo.release();
      await expect(page.getByText('Ваша группа: Базовый юзер', { exact: true })).toBeVisible();
      await expect(content).toBeVisible();
      expect(
        apiRequests.filter((request) =>
          /^POST .*subscription\/(purchase(?:-tariff)?|renew)(?:\?|$)/.test(request),
        ),
      ).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    });

    test(`cold ${mode} keeps its header and uses the known-mode skeleton ${theme}`, async ({
      page,
    }, info) => {
      const options = deferred();
      const promo = deferred();
      await prepareSales(page, mode, theme);
      await page.route('**/api/cabinet/subscription/purchase-options**', async (route) => {
        await options.promise;
        await route.fallback();
      });
      await page.route('**/api/cabinet/promo/group-discounts', async (route) => {
        await promo.promise;
        await route.fallback();
      });
      await page.goto(pathFor(mode), { waitUntil: 'domcontentloaded' });
      const title = page.getByRole('heading', { level: 1 });
      await expect(title).toBeVisible();
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      const header = await title.boundingBox();
      await expect(page.locator('main [aria-busy="true"]')).toBeVisible();
      options.release();
      const template = page.locator(
        mode === 'tariff' ? '[data-tariff-options-loading]' : '[data-period-options-loading]',
      );
      await expect(template).toBeVisible();
      await expect(page.locator('[data-sales-context-loading]')).toBeVisible();
      const before = await template.locator(':scope > div').first().boundingBox();
      const capture = ['mobile-320', 'desktop-1280'].includes(info.project.name);
      if (capture)
        await page.screenshot({
          path: info.outputPath(`${mode}-${theme}-skeleton.png`),
          fullPage: true,
        });
      promo.release();
      await expect(contentFor(page, mode)).toBeVisible();
      const currentHeader = await title.boundingBox();
      if (!header || !currentHeader) throw new Error('The page header must remain visible');
      expect(Math.abs(header.y - currentHeader.y)).toBeLessThanOrEqual(1);
      expect(Math.abs(header.height - currentHeader.height)).toBeLessThanOrEqual(1);
      const after =
        mode === 'tariff'
          ? await page
              .locator('[data-purchase-layout="tariffs"] .bento-card-hover')
              .first()
              .boundingBox()
          : await page.getByRole('button', { name: /^14 дней/ }).boundingBox();
      if (!before || !after) throw new Error('The first option must have a reserved position');
      expect(Math.abs(before.y - after.y)).toBeLessThanOrEqual(4);
      expect(Math.abs(before.height - after.height)).toBeLessThanOrEqual(4);
      if (capture)
        await page.screenshot({
          path: info.outputPath(`${mode}-${theme}-ready.png`),
          fullPage: true,
        });
    });

    test(`optional group errors do not hold ${mode} behind an endless skeleton ${theme}`, async ({
      page,
    }) => {
      await prepareSales(page, mode, theme, { '/api/cabinet/promo/group-discounts': 503 });
      await page.goto(pathFor(mode));
      await expect(contentFor(page, mode)).toBeVisible();
      await expect(page.locator('main [aria-busy="true"]')).toHaveCount(0);
      await expect(page.getByText('Ваша группа: Базовый юзер', { exact: true })).toHaveCount(0);
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
