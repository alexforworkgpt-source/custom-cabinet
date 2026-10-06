import { expect, test } from '@playwright/test';
import type { GiftConfig, GiftPurchaseStatusValue } from '../../src/api/gift';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

const config: GiftConfig = {
  is_enabled: true,
  tariffs: [],
  payment_methods: [],
  balance_kopeks: 0,
  currency_symbol: '₽',
  promo_group_name: null,
  active_discount_percent: null,
  active_discount_expires_at: null,
};

function responses(status: GiftPurchaseStatusValue = 'pending') {
  return {
    '/api/cabinet/branding/telegram-widget': { enabled: false, bot_username: null },
    '/api/cabinet/gift/config': config,
    '/api/cabinet/gift/purchase/local-token': {
      status,
      is_gift: true,
      is_code_only: false,
      is_claimable: false,
      purchase_token: 'local-token',
      recipient_contact_value: 'recipient@example.test',
      gift_message: null,
      tariff_name: 'Local tariff',
      period_days: 30,
      warning: null,
    },
  };
}

for (const status of ['delivered', 'failed', 'pending_activation'] as const) {
  test(`can leave a ${status} gift result using its page exit`, async ({ page }) => {
    const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
      responses: responses(status),
    });
    await page.goto('/gift/result?token=local-token');
    await expect(page.getByRole('main').getByRole('heading', { level: 1 })).toBeVisible();
    const back = page.getByRole('main').getByRole('link', { name: 'Back', exact: true });
    await expect(back).toHaveAttribute('href', '/gift');
    await back.click();
    await expect(page).toHaveURL('/gift');
    expect(apiRequests.filter((request) => /^(POST|PATCH|DELETE) .*\/gift/.test(request))).toEqual(
      [],
    );
    expect([...unexpectedApiRequests]).toEqual([]);
  });
}

test('can leave a timed-out gift result and stops polling after exit', async ({ page }) => {
  await page.clock.install();
  const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: responses(),
  });
  await page.goto('/gift/result?token=local-token');
  await expect(page.getByRole('heading', { name: 'Processing...', exact: true })).toBeVisible();
  await page.clock.fastForward(610_000);
  await expect(
    page.getByRole('heading', { name: 'Processing is taking longer than usual', exact: true }),
  ).toBeVisible();
  await page.getByRole('main').getByRole('link', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL('/gift');
  const requestsBefore = apiRequests.filter((request) => request.includes('/gift/purchase/'));
  await page.clock.fastForward(10_000);
  expect(apiRequests.filter((request) => request.includes('/gift/purchase/'))).toEqual(
    requestsBefore,
  );
  expect([...unexpectedApiRequests]).toEqual([]);
});
