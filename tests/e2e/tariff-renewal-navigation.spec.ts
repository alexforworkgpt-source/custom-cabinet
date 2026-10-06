import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription } from './classicRenewalFixture';

for (const salesMode of ['classic', 'tariffs']) {
  for (const status of ['active', 'expired']) {
    test(`${status} tariff subscription opens its renewal in ${salesMode} mode @critical-flow`, async ({
      page,
    }) => {
      const current = {
        ...subscription,
        tariff_id: 7,
        tariff_name: 'Базовый',
        requires_tariff_selection: false,
        status,
        is_active: status === 'active',
        is_expired: status === 'expired',
      };
      const { apiRequests } = await prepareAuthenticatedPage(page, {
        language: 'ru',
        responses: {
          ...responses,
          '/api/cabinet/subscription': { has_subscription: true, subscription: current },
          '/api/cabinet/subscriptions': { subscriptions: [current], multi_tariff_enabled: false },
          '/api/cabinet/subscription/purchase-options': {
            ...responses['/api/cabinet/subscription/purchase-options'],
            sales_mode: salesMode,
            balance_kopeks: 150_000,
            tariffs: [],
          },
        },
      });
      const renewals: { period_days: number; subscription_id: string | null }[] = [];
      await page.route(/\/api\/cabinet\/subscription\/renew(?:\?|$)/, async (route) => {
        renewals.push({
          period_days: route.request().postDataJSON().period_days,
          subscription_id: new URL(route.request().url()).searchParams.get('subscription_id'),
        });
        await route.fulfill({
          json: {
            message: 'Subscription renewed successfully',
            new_end_date: '2027-01-28T00:00:00Z',
            amount_paid_kopeks: 120_000,
          },
        });
      });

      await page.goto('/subscriptions/42?overlay=subscription');
      const renew = page.getByRole('link', { name: /Продлить подписку/ });
      if (status === 'active') {
        await expect(renew).toContainText('Продление и смена тарифа');
        await expect(renew).not.toContainText('Подписка истекла');
      }
      await expect(renew).toHaveAttribute('href', '/subscriptions/42/renew');
      await renew.click();
      await expect(page).toHaveURL('/subscriptions/42/renew');
      await expect(
        page.getByRole('heading', { name: 'Продлить подписку', exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: /^90 дней/ }).click();
      expect(renewals).toEqual([]);
      await page
        .getByRole('button', {
          name: salesMode === 'classic' ? 'Оплатить' : 'Продлить подписку',
          exact: true,
        })
        .click();
      await expect(page).toHaveURL('/subscriptions/42');
      expect(renewals).toEqual([{ period_days: 90, subscription_id: '42' }]);
      expect(apiRequests.some((request) => /^POST .*\/purchase/.test(request))).toBe(false);
    });
  }
}
