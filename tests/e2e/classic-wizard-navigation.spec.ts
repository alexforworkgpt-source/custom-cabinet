import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { classicPurchaseOptions } from './classicPurchasePricingFixture';

test.beforeEach(async ({ page }) => {
  await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      '/api/cabinet/subscription/purchase-options': classicPurchaseOptions,
      '/api/cabinet/subscription/purchase-preview': {
        total_price_kopeks: 9_900,
        total_price_label: '99 ₽',
        per_month_price_kopeks: 9_900,
        per_month_price_label: '99 ₽',
        breakdown: [],
        balance_kopeks: 125_000,
        balance_label: '1 250 ₽',
        missing_amount_kopeks: 0,
        can_purchase: true,
      },
    },
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/subscription/purchase');
});

test('first classic step keeps the wizard open without Cancel @critical-flow', async ({ page }) => {
  const wizard = page.locator('[data-purchase-layout="classic"]');
  await expect(wizard.getByRole('button', { name: /30 дней/ })).toBeVisible();
  await expect(wizard.getByRole('button', { name: 'Отмена', exact: true })).toHaveCount(0);
  await expect(wizard.getByRole('button', { name: /^Далее/ })).toBeEnabled();
});

test('device step matches the first step footer gap and preserves selection @critical-flow', async ({
  page,
}) => {
  const wizard = page.locator('[data-purchase-layout="classic"]');
  const period = wizard.getByRole('button', { name: /90 дней/ });
  await period.click();
  const next = wizard.getByRole('button', { name: /^Далее/ });
  const periods = period.locator('..');
  const firstContentBox = await periods.boundingBox();
  const firstFooterBox = await next.locator('..').boundingBox();
  if (!firstContentBox || !firstFooterBox) throw new Error('Period step must have visible bounds');
  const firstGap = firstFooterBox.y - firstContentBox.y - firstContentBox.height;

  await next.click();
  const increase = wizard.getByRole('button', { name: '+', exact: true });
  await expect(increase).toBeVisible();
  await expect(wizard.getByText('К оплате', { exact: true })).toBeVisible();
  const deviceContent = increase.locator('../..');
  const summaryBox = await deviceContent.locator('> div').last().boundingBox();
  const deviceFooterBox = await next.locator('..').boundingBox();
  if (!summaryBox || !deviceFooterBox) throw new Error('Device step must have visible bounds');
  const deviceGap = deviceFooterBox.y - summaryBox.y - summaryBox.height;
  expect(deviceGap).toBeCloseTo(firstGap, 0);

  await wizard.getByRole('button', { name: 'Назад', exact: true }).click();
  await expect(period).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(/\/subscription\/purchase$/);
});
