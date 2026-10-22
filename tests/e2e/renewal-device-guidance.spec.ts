import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription } from './classicRenewalFixture';

const cases = [
  {
    name: 'active',
    expired: false,
    maximum: 5,
    hint: 'Докупка устройств оформляется отдельно в «Дополнительных опциях».',
  },
  {
    name: 'expired',
    expired: true,
    maximum: 5,
    hint: 'Чтобы добавить устройства, сначала продлите подписку, затем откройте «Дополнительные опции».',
  },
  {
    name: 'at maximum',
    expired: true,
    maximum: 3,
    hint: 'Достигнут максимальный лимит устройств.',
  },
];

for (const theme of ['light', 'dark']) {
  for (const scenario of cases) {
    test(`renewal device guidance ${scenario.name} ${theme} @critical-flow`, async ({ page }) => {
      const { apiRequests } = await prepareAuthenticatedPage(page, {
        language: 'ru',
        responses: {
          ...responses,
          '/api/cabinet/subscription': {
            has_subscription: true,
            subscription: {
              ...subscription,
              status: scenario.expired ? 'expired' : 'active',
              is_expired: scenario.expired,
              is_active: !scenario.expired,
              end_date: scenario.expired ? '2026-10-19T00:00:00Z' : '2026-10-30T00:00:00Z',
            },
          },
          '/api/cabinet/subscription/purchase-options': {
            ...responses['/api/cabinet/subscription/purchase-options'],
            devices: {
              min: 1,
              max: scenario.maximum,
              default: 3,
              current: 3,
              price_per_device_kopeks: 5000,
              price_per_device_label: '50 ₽',
            },
          },
        },
      });
      await page.addInitScript((nextTheme) => {
        localStorage.setItem('cabinet-theme', nextTheme);
        Date.now = () => Date.parse('2026-10-20T00:00:00Z');
      }, theme);
      await page.goto('/subscriptions/42/renew');
      const info = page.locator('[data-renewal-info]');
      const guidance = info.getByRole('note');
      await expect(guidance).toBeVisible();
      await expect(guidance).toHaveText(scenario.hint);
      await expect(guidance.locator('svg')).toHaveCount(1);
      await expect(info.getByText('Продление с текущими параметрами', { exact: true })).toHaveCount(
        0,
      );
      await page.getByRole('button', { name: /^30 дней/ }).click();
      await expect(page.locator('[data-renewal-summary]').getByRole('note')).toBeVisible();
      expect(
        apiRequests.filter((request) => /^POST .*subscription\/(renew|purchase)/.test(request)),
      ).toEqual([]);
      expect(apiRequests.filter((request) => /subscription\/devices\/price/.test(request))).toEqual(
        [],
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    });
  }
}
