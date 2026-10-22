import { expect, test } from '@playwright/test';
import { activeDiscount, preparePromoPage } from './promoDiscountFixture';

test('an open discount expires on its own with one read-only refresh and no automatic clearing', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-10-21T12:00:00Z') });
  const fixture = await preparePromoPage(page, {
    '/api/cabinet/promo/active-discount': { ...activeDiscount, expires_at: '2026-10-21T12:01:00Z' },
  });
  await page.goto('/');
  await expect(page.locator('[data-promo-active-discount]')).toBeVisible();
  const reads = () =>
    fixture.requests.filter(
      ({ method, url }) => method === 'GET' && url.pathname.endsWith('/promo/active-discount'),
    ).length;
  const before = reads();
  await page.clock.fastForward(60_001);
  await expect(page.locator('[data-promo-unavailable-discount]')).toBeVisible();
  await expect(page.locator('[data-promo-active-discount]')).toHaveCount(0);
  await expect.poll(reads).toBe(before + 1);
  await page.clock.fastForward(5000);
  expect(reads()).toBe(before + 1);
  expect(
    fixture.requests.filter(({ method, url }) => method !== 'GET' && /promo/.test(url.pathname)),
  ).toEqual([]);
  fixture.expectNoPayment();
});

for (const effect of ['discount', 'test_access']) {
  test(`claim ${effect} refreshes the benefit and stays on Dashboard without payment`, async ({
    page,
  }) => {
    let claimed = false;
    const fixture = await preparePromoPage(page);
    await page.route('**/api/cabinet/promo/offers', (route) =>
      route.fulfill({
        json: claimed
          ? []
          : [
              {
                id: 1,
                notification_type: 'test',
                effect_type: effect,
                discount_percent: effect === 'discount' ? 20 : null,
                expires_at: activeDiscount.expires_at,
                is_active: true,
                is_claimed: false,
                claimed_at: null,
                extra_data: {},
              },
            ],
      }),
    );
    await page.route('**/api/cabinet/promo/active-discount', (route) =>
      route.fulfill({ json: { ...activeDiscount, is_active: claimed && effect === 'discount' } }),
    );
    await page.route('**/api/cabinet/promo/claim', (route) => {
      claimed = true;
      return route.fulfill({
        json: {
          success: true,
          message: 'Предложение активировано',
          discount_percent: effect === 'discount' ? 20 : null,
          expires_at: activeDiscount.expires_at,
        },
      });
    });
    await page.goto('/');
    await page.getByRole('button', { name: /Активировать$/ }).click();
    await expect(page.getByText('Предложение активировано', { exact: true })).toBeVisible();
    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-promo-active-discount]')).toHaveCount(
      effect === 'discount' ? 1 : 0,
    );
    expect(
      fixture.requests
        .filter(({ url }) => url.pathname.endsWith('/promo/claim'))
        .map(({ body }) => body),
    ).toEqual([{ offer_id: 1 }]);
    fixture.expectNoPayment();
  });
}

test('an open tariff catalogue stops displaying an expired account percentage', async ({
  page,
}) => {
  await page.clock.install({ time: new Date('2026-10-21T12:00:00Z') });
  const fixture = await preparePromoPage(page, {
    '/api/cabinet/subscription': { has_subscription: false, subscription: null },
    '/api/cabinet/subscriptions': { subscriptions: [], multi_tariff_enabled: false },
    '/api/cabinet/promo/active-discount': { ...activeDiscount, expires_at: '2026-10-21T12:01:00Z' },
    '/api/cabinet/subscription/purchase-options': {
      sales_mode: 'tariffs',
      balance_kopeks: 0,
      tariffs: [
        {
          id: 7,
          name: 'Тестовый тариф',
          traffic_limit_gb: 100,
          traffic_limit_label: '100 ГБ',
          device_limit: 3,
          servers: [],
          is_available: true,
          periods: [
            {
              days: 30,
              months: 1,
              label: '30 дней',
              price_kopeks: 50000,
              price_label: '500 ₽',
              price_per_month_kopeks: 50000,
              price_per_month_label: '500 ₽',
            },
          ],
        },
      ],
    },
  });
  await page.goto('/subscription/purchase');
  const catalogue = page.locator('[data-purchase-layout="tariffs"]');
  await expect(catalogue.getByText('-20%', { exact: true })).toBeVisible();
  await page.clock.fastForward(60_001);
  await expect(catalogue.getByText('-20%', { exact: true })).toHaveCount(0);
  fixture.expectNoPayment();
});

test('an offer that expired between display and activation cannot be claimed', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-21T12:00:00Z') });
  const fixture = await preparePromoPage(page, {
    '/api/cabinet/promo/active-discount': { ...activeDiscount, is_active: false },
    '/api/cabinet/promo/offers': [
      {
        id: 1,
        notification_type: 'test',
        effect_type: 'discount',
        discount_percent: 20,
        expires_at: '2026-10-21T12:01:00Z',
        is_active: true,
        is_claimed: false,
        claimed_at: null,
        extra_data: {},
      },
    ],
  });
  await page.goto('/');
  const activate = page.getByRole('button', { name: /Активировать$/ });
  // Freeze interval-driven removal before advancing wall time so the stale click reaches the guard.
  await page.clock.pauseAt(new Date('2026-10-21T12:00:30Z'));
  await expect(activate).toBeEnabled();
  await page.clock.setSystemTime(new Date('2026-10-21T12:02:00Z'));
  await activate.evaluate((button) => button.click());
  await expect(page.getByRole('alert')).toBeVisible();
  await page.clock.runFor(1000);
  await expect(activate).toHaveCount(0);
  expect(fixture.requests.filter(({ url }) => url.pathname.endsWith('/promo/claim'))).toEqual([]);
  fixture.expectNoPayment();
});

for (const source of ['promocode:TEST20', 'offer:1', 'admin']) {
  test(`explicit disable uses the existing endpoint for ${source}`, async ({ page }) => {
    let cleared = false;
    const fixture = await preparePromoPage(page);
    await page.route('**/api/cabinet/promo/active-discount', (route) => {
      if (route.request().method() === 'DELETE') cleared = true;
      return route.fulfill({ json: { ...activeDiscount, source, is_active: !cleared } });
    });
    await page.route('**/api/cabinet/promocode/deactivate-discount', (route) => {
      cleared = true;
      return route.fulfill({ json: { success: true } });
    });
    await page.goto('/');
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('20%');
      await dialog.accept();
    });
    await page
      .locator('[data-promo-active-discount]')
      .getByRole('button', { name: 'Отменить промокод', exact: true })
      .click();
    await expect(page.locator('[data-promo-active-discount]')).toHaveCount(0);
    const mutations = fixture.requests.filter(
      ({ method, url }) => method !== 'GET' && /promo/.test(url.pathname),
    );
    expect(mutations.map(({ method, url }) => `${method} ${url.pathname}`)).toEqual([
      source.startsWith('promocode:')
        ? 'POST /api/cabinet/promocode/deactivate-discount'
        : 'DELETE /api/cabinet/promo/active-discount',
    ]);
    fixture.expectNoPayment();
  });
}
