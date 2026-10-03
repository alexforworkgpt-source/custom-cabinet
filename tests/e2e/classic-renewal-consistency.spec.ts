import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription } from './classicRenewalFixture';

const periods = [14, 30, 60, 90, 180, 360].map((days, index) => ({
  period_days: days,
  price_kopeks: [5000, 9900, 18810, 26730, 50490, 89100][index],
  discount_percent: [0, 0, 5, 10, 15, 25][index],
  original_price_kopeks: [null, null, 19800, 29700, 59400, 118800][index],
}));

for (const language of ['ru', 'en', 'fa']) {
  for (const theme of ['light', 'dark', 'operator']) {
    test(`renewal design ${language} ${theme}`, async ({ page }, testInfo) => {
      await prepareAuthenticatedPage(page, {
        language,
        responses: {
          ...responses,
          '/api/cabinet/subscription': {
            has_subscription: true,
            subscription: {
              ...subscription,
              traffic_limit_gb: 0,
              device_limit: 1,
              servers: [
                { uuid: 'nl', name: '🇳🇱 Нидерланды' },
                { uuid: 'ee', name: '🇪🇪 Эстония' },
                { uuid: 'de', name: '🇩🇪 Германия' },
                { uuid: 'fi', name: '🇫🇮 Финляндия' },
                { uuid: 'us', name: '🇺🇸 США' },
              ],
            },
          },
          '/api/cabinet/promo/group-discounts': {
            group_name: 'Базовый юзер',
            server_discount_percent: 0,
            traffic_discount_percent: 0,
            device_discount_percent: 0,
            period_discounts: { '90': 10 },
          },
          '/api/cabinet/subscription/renewal-options': periods,
          ...(theme === 'operator'
            ? {
                '/api/cabinet/branding/colors': {
                  accent: '#9d174d',
                  success: '#15803d',
                  warning: '#b45309',
                  error: '#b91c1c',
                },
              }
            : {}),
        },
      });
      await page.addInitScript(
        (theme) => localStorage.setItem('cabinet-theme', theme === 'operator' ? 'light' : theme),
        theme,
      );
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/subscriptions/42/renew', { waitUntil: 'domcontentloaded' });
      const option = page.getByRole('button', { name: /^30 / });
      await expect(option).toBeVisible();
      await expect(page.getByText(/Базовый юзер/)).toBeVisible();
      await expect(page.locator('[data-renewal-info] svg')).toHaveCount(5);
      await expect(page.locator('[data-renewal-info]')).toContainText('Нидерланды');
      const outerPanel = page.locator('[data-renewal-panel]');
      await expect(outerPanel.locator('[data-renewal-clearance]')).toHaveCount(0);
      expect(
        await outerPanel.evaluate((element) => getComputedStyle(element).borderTopWidth),
      ).not.toBe('0px');
      await expect(option).toHaveClass(/bento-card-hover/);
      for (const days of [60, 90, 180, 360]) {
        const discounted = page.getByRole('button', { name: new RegExp(`^${days} `) });
        const titleBox = await discounted
          .locator(':scope > span')
          .first()
          .evaluate((element) => {
            const range = document.createRange();
            range.selectNodeContents(element);
            const { x, y, width, height } = range.getBoundingClientRect();
            return { x, y, width, height };
          });
        const badgeBox = await discounted.locator(':scope > span.absolute').boundingBox();
        expect(titleBox).not.toBeNull();
        expect(badgeBox).not.toBeNull();
        const overlap =
          titleBox &&
          badgeBox &&
          titleBox.x < badgeBox.x + badgeBox.width &&
          titleBox.x + titleBox.width > badgeBox.x &&
          titleBox.y < badgeBox.y + badgeBox.height &&
          titleBox.y + titleBox.height > badgeBox.y;
        expect(overlap, `${days}-day title must remain clear of its discount badge`).toBe(false);
      }
      if (language === 'ru') {
        await expect(
          page.getByRole('heading', { name: 'Продлить подписку', exact: true }),
        ).toBeVisible();
        const info = page.locator('[data-renewal-info]');
        await expect(info.locator('p', { hasText: 'Трафик:' })).not.toContainText('Устройства:');
        await expect(info.locator('p', { hasText: 'Устройства:' })).toContainText('Устройства: 1');
        await expect(page.getByRole('button', { name: /^90 / })).toContainText('267.30');
        await expect(page.locator('[data-renewal-info]')).toContainText('Безлимит');
      }
      await expect(option).toHaveAttribute('aria-pressed', 'false');
      const action = page.locator('[data-renewal-summary] button');
      await expect(action).toBeDisabled();
      await option.focus();
      expect(await option.evaluate((element) => getComputedStyle(element).boxShadow)).not.toBe(
        'none',
      );
      await page.keyboard.press('Space');
      await expect(option).toHaveAttribute('aria-pressed', 'true');
      await expect(action).toBeEnabled();
      for (const button of [option, action]) {
        const box = await button.boundingBox();
        expect(box?.height).toBeGreaterThanOrEqual(44);
        expect(box?.width).toBeGreaterThanOrEqual(44);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(
        await page
          .locator('[data-renewal-summary]')
          .evaluate((element) =>
            [...element.querySelectorAll('p, span, button')].every(
              (child) => parseFloat(getComputedStyle(child).fontSize) >= 12,
            ),
          ),
      ).toBe(true);
      await expect(outerPanel.locator('[data-renewal-summary]')).toHaveCount(1);
      await expect(page.locator('[data-renewal-clearance]')).toHaveCount(0);
      const summary = page.locator('[data-renewal-summary]');
      const panel = await summary.boundingBox();
      const last = await page.getByRole('button', { name: /^360 / }).boundingBox();
      const gap = (panel?.y ?? 0) - ((last?.y ?? 0) + (last?.height ?? 0));
      expect(gap).toBeGreaterThanOrEqual(0);
      expect(gap).toBeLessThanOrEqual(20);
      await action.scrollIntoViewIfNeeded();
      await expect(action).toBeInViewport();
      await page.screenshot({
        path: `.scratch/classic-purchase-renewal-consistency/${testInfo.project.name}-${language}-${theme}.png`,
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('button', { name: /^30 / })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
    });
  }
}

test('renewal keeps intent through top-up return using fresh values @critical-flow', async ({
  page,
}) => {
  const { apiRequests } = await prepareAuthenticatedPage(page, { language: 'ru', responses });
  await page.goto('/subscriptions/42/renew', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /^90 дней/ }).click();
  await page.getByRole('link', { name: 'Назад', exact: true }).click();
  await page.goBack({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: /^90 дней/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.route(/\/api\/cabinet\/subscription\/purchase-options(?:\?|$)/, (route) =>
    route.fulfill({
      json: { ...responses['/api/cabinet/subscription/purchase-options'], balance_kopeks: 130_000 },
    }),
  );
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: 'Оплатить', exact: true })).toBeEnabled();
  expect(
    apiRequests.filter((request) => /POST .*subscription\/(renew|purchase)/.test(request)),
  ).toEqual([]);
  await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, (route) =>
    route.fulfill({
      json: {
        has_subscription: true,
        subscription: { ...subscription, end_date: '2026-12-29T00:00:00Z' },
      },
    }),
  );
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.getByText(/Предыдущий выбор сброшен/)).toBeVisible();
  await expect(page.getByRole('button', { name: 'Выберите срок', exact: true })).toBeDisabled();
});

test('renewal landscape preserves room for the last option', async ({ page }) => {
  await page.setViewportSize({ width: 812, height: 375 });
  await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: { ...responses, '/api/cabinet/subscription/renewal-options': periods },
  });
  await page.goto('/subscriptions/42/renew', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /^30 дней/ }).click();
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  const last = await page.getByRole('button', { name: /^360 / }).boundingBox();
  const panel = await page.locator('[data-renewal-summary]').boundingBox();
  expect((last?.y ?? 0) + (last?.height ?? 0)).toBeLessThanOrEqual(panel?.y ?? 0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('Telegram renewal keeps manual intent and native Back @telegram-flow', async ({ page }) => {
  const { apiRequests } = await prepareAuthenticatedPage(page, { language: 'ru', responses });
  const launch = new URLSearchParams({
    tgWebAppVersion: '8.0',
    tgWebAppPlatform: 'android',
    tgWebAppThemeParams: JSON.stringify({ bg_color: '#000000' }),
  });
  await page.goto(`/subscriptions/42?${launch}`, { waitUntil: 'domcontentloaded' });
  await page
    .getByRole('link', { name: /Продлить подписку.*Продление с текущими параметрами/ })
    .click();
  await page.getByRole('button', { name: /^30 дней/ }).click();
  await expect(page.getByRole('link', { name: 'Назад', exact: true })).toHaveCount(0);
  await page.evaluate(() => {
    const host = window as typeof window & {
      Telegram?: { WebView?: { receiveEvent: (event: string) => void } };
    };
    host.Telegram?.WebView?.receiveEvent('back_button_pressed');
  });
  await expect(page).toHaveURL(`/subscriptions/42?${launch}`);
  await page.goForward({ waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('button', { name: /^30 дней/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(
    apiRequests.filter((request) => /POST .*subscription\/(renew|purchase)/.test(request)),
  ).toEqual([]);
});
