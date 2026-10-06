import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription } from './classicRenewalFixture';

const unlimitedSubscription = {
  ...subscription,
  traffic_limit_gb: 0,
  traffic_used_gb: 123.4,
  tariff_id: 7,
  tariff_name: 'Базовый',
};

test('unlimited subscription shows term and usage without progress @critical-flow', async ({
  page,
}, testInfo) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscription': { has_subscription: true, subscription: unlimitedSubscription },
      '/api/cabinet/subscriptions': {
        subscriptions: [unlimitedSubscription],
        multi_tariff_enabled: false,
      },
      '/api/cabinet/subscription/refresh-traffic': {
        traffic_used_gb: 123.4,
        traffic_used_percent: 0,
        is_unlimited: true,
      },
    },
  });
  await page.addInitScript(() => localStorage.setItem('cabinet-theme', 'dark'));
  await page.goto('/');
  const summary = page.getByRole('region', { name: 'Подписка активна', exact: true });
  await expect(summary).toBeVisible();
  await expect(summary.getByText('Базовый', { exact: true })).toBeVisible();
  await expect(summary.getByText('Безлимит', { exact: true })).toBeVisible();
  await expect(summary.getByText('Осталось', { exact: true })).toBeVisible();
  await expect(summary.getByRole('progressbar')).toHaveCount(0);
  await expect(summary.getByText(/123,4\s+ГБ\s*\/\s*∞/)).toBeVisible();
  await expect(summary.getByRole('button', { name: 'Управление подпиской' })).toBeVisible();
  const badges = summary.locator('span.uppercase');
  await expect(badges).toHaveCount(2);
  for (const badge of await badges.all()) {
    expect(await badge.evaluate((element) => getComputedStyle(element).textTransform)).toBe(
      'uppercase',
    );
  }
  const header = badges.first().locator('..');
  const [badgeBox, refreshBox] = await Promise.all([
    header.boundingBox(),
    summary.locator('[data-traffic-refresh]').boundingBox(),
  ]);
  if (!badgeBox || !refreshBox) throw new Error('Subscription header must have visible bounds');
  expect(
    Math.abs(badgeBox.y + badgeBox.height / 2 - (refreshBox.y + refreshBox.height / 2)),
  ).toBeLessThan(1);
  const titleBox = await summary.getByRole('heading').boundingBox();
  expect(titleBox?.height).toBeLessThanOrEqual(1);
  await expect(summary.getByText('Сервис доступен для подключения', { exact: true })).toHaveCount(
    0,
  );
  await page.screenshot({ path: testInfo.outputPath('subscription-summary.png'), fullPage: true });
  expect([...unexpectedApiRequests]).toEqual([]);
});

for (const theme of ['dark', 'light']) {
  for (const language of ['ru', 'fa']) {
    test(`limited trial preserves usage and fits in ${theme}/${language}`, async ({ page }) => {
      const current = {
        ...unlimitedSubscription,
        is_trial: true,
        traffic_limit_gb: 100,
        traffic_used_gb: 25,
        traffic_used_percent: 25,
        days_left: 2,
        tariff_name: language === 'ru' ? 'Пробный' : 'اشتراک آزمایشی با نام بسیار طولانی',
      };
      const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
        language,
        responses: {
          ...responses,
          '/api/cabinet/subscription': { has_subscription: true, subscription: current },
          '/api/cabinet/subscriptions': { subscriptions: [current], multi_tariff_enabled: false },
          '/api/cabinet/subscription/refresh-traffic': {
            traffic_used_gb: 25,
            traffic_used_percent: 25,
            is_unlimited: false,
          },
        },
      });
      await page.addInitScript((value) => localStorage.setItem('cabinet-theme', value), theme);
      await page.goto('/');
      const summary = page.locator('section[aria-labelledby="subscription-summary-title"]');
      await expect(summary).toBeVisible();
      await expect(summary.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '25');
      await expect(summary.locator('[data-traffic-percentage]')).toContainText('25');
      await expect(summary.locator('span.uppercase')).toHaveCount(1);
      await expect(summary.getByText(current.tariff_name, { exact: true })).toHaveCount(
        language === 'ru' ? 1 : 0,
      );
      await expect(
        page.getByRole('heading', {
          name: language === 'ru' ? 'Пробная подписка' : 'اشتراک آزمایشی',
        }),
      ).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
        await page.evaluate(() => innerWidth),
      );
      expect(await summary.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
        true,
      );
      expect([...unexpectedApiRequests]).toEqual([]);
    });
  }
}

test('long paid tariff name stays inside the compact header @critical-flow', async ({ page }) => {
  const current = {
    ...unlimitedSubscription,
    tariff_name: 'Базовый тариф с очень длинным названием',
  };
  await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscription': { has_subscription: true, subscription: current },
      '/api/cabinet/subscriptions': { subscriptions: [current], multi_tariff_enabled: false },
    },
  });
  await page.goto('/');
  const summary = page.getByRole('region', { name: 'Подписка активна', exact: true });
  await expect(summary.getByText(current.tariff_name, { exact: true })).toBeVisible();
  expect(await summary.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
    true,
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('management, connection and link controls keep their order and transitions @critical-flow', async ({
  page,
}) => {
  await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscription': { has_subscription: true, subscription: unlimitedSubscription },
      '/api/cabinet/subscriptions': {
        subscriptions: [unlimitedSubscription],
        multi_tariff_enabled: false,
      },
      '/api/cabinet/subscription/refresh-traffic': {
        traffic_used_gb: 0,
        traffic_used_percent: 0,
        is_unlimited: true,
      },
      '/api/cabinet/subscription/connection-link': {
        subscription_url: unlimitedSubscription.subscription_url,
        display_link: unlimitedSubscription.subscription_url,
        hide_link: false,
        connect_mode: 'plain',
        instructions: { steps: [] },
      },
    },
  });
  await page.goto('/');
  const manage = page.getByRole('button', { name: 'Управление подпиской', exact: true });
  const connect = page.getByRole('button', { name: /Настроить VPN/ });
  const copy = page.getByRole('button', { name: 'Копировать ссылку', exact: true });
  const qr = page.getByRole('button', { name: 'Открыть QR-код', exact: true });
  await expect(manage).toHaveCount(1);
  await expect(connect).toBeVisible();
  await expect(copy).toBeVisible();
  await expect(qr).toBeVisible();
  const [manageBox, connectBox, copyBox] = await Promise.all([
    manage.boundingBox(),
    connect.boundingBox(),
    copy.boundingBox(),
  ]);
  expect(manageBox && connectBox && manageBox.y + manageBox.height <= connectBox.y).toBe(true);
  expect(connectBox && copyBox && connectBox.y + connectBox.height <= copyBox.y).toBe(true);
  await manage.click();
  await expect(page).toHaveURL('/subscriptions/42');
  await expect(page.getByRole('dialog')).toBeVisible();
});
