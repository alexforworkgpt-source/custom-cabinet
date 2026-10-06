import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { classicPricingDiscount, classicPurchaseOptions } from './classicPurchasePricingFixture';

for (const theme of ['light', 'dark'] as const) {
  for (const language of ['ru', 'en', 'fa']) {
    test(`Classic monthly pricing without outer panel in ${theme} ${language}`, async ({
      page,
    }, testInfo) => {
      const errors: string[] = [];
      page.on('pageerror', (error) => errors.push(error.message));
      const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
        language,
        responses: {
          '/api/cabinet/subscription/purchase-options': classicPurchaseOptions,
          '/api/cabinet/promo/active-discount': classicPricingDiscount,
          '/api/cabinet/subscription/purchase-preview': {
            total_price_kopeks: 8_415,
            total_price_label: '84.15 ₽',
            per_month_price_kopeks: 8_415,
            per_month_price_label: '84.15 ₽',
            breakdown: [],
            balance_kopeks: 125_000,
            balance_label: '1 250 ₽',
            missing_amount_kopeks: 0,
            can_purchase: true,
          },
        },
      });
      await page.addInitScript((theme) => localStorage.setItem('cabinet-theme', theme), theme);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/subscription/purchase', { waitUntil: 'domcontentloaded' });
      const wizard = page.locator('[data-purchase-layout="classic"]');
      const quarter = wizard.getByRole('button', { name: /90 дней/ });
      const month = wizard.getByRole('button', { name: /30 дней/ });
      const monthly = quarter.locator('div').filter({ hasText: /^[^/]+\/[^/]+$/ });
      await expect(monthly).toHaveCount(1);
      if (language === 'ru') {
        await expect(monthly).toHaveText('76 ₽/мес');
        await expect(
          page.getByRole('heading', { name: 'Оформить подписку', exact: true }),
        ).toBeVisible();
      }
      expect(
        parseFloat(await monthly.evaluate((element) => getComputedStyle(element).fontSize)),
      ).toBeGreaterThanOrEqual(12);
      const monthCaption = month.locator('div').filter({ hasText: /^[^/]+\/[^/]+$/ });
      await expect(monthCaption).toHaveCount(1);
      const shortPeriod = wizard.getByRole('button', { name: /14 дней/ });
      await expect(shortPeriod.locator('div').last()).not.toBeEmpty();
      await expect(shortPeriod.locator('div').filter({ hasText: /^[^/]+\/[^/]+$/ })).toHaveCount(0);
      if (language === 'ru') {
        await expect(monthCaption).toHaveText('84 ₽/мес');
        await expect(shortPeriod.getByText('за 14 дней', { exact: true })).toBeVisible();
      }
      const panel = wizard.locator('..');
      expect(await panel.evaluate((element) => getComputedStyle(element).borderTopWidth)).toBe(
        '0px',
      );
      expect(await panel.evaluate((element) => getComputedStyle(element).backgroundColor)).toBe(
        'rgba(0, 0, 0, 0)',
      );
      await quarter.focus();
      await page.keyboard.press('Enter');
      await expect(quarter).toHaveAttribute('aria-pressed', 'true');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(errors).toEqual([]);
      expect([...unexpectedApiRequests]).toEqual([]);
      expect(apiRequests.some((request) => /^POST .*\/(purchase|renew)$/.test(request))).toBe(
        false,
      );
      if (language === 'ru' && ['mobile-320', 'desktop-1280'].includes(testInfo.project.name)) {
        await page.screenshot({
          path: testInfo.outputPath(`classic-monthly-${theme}.png`),
          fullPage: true,
        });
      }
    });
  }
}
