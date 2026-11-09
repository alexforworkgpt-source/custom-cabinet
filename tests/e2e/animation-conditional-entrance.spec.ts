import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import {
  clearEntrances,
  expectEntrance,
  expectStationary,
  recordEntrances,
  expectNoEntranceErrors,
} from './entranceProbe';

test.afterEach(({ page }) => expectNoEntranceErrors(page));
import { responses, subscription } from './classicRenewalFixture';
import { classicPurchaseOptions } from './classicPurchasePricingFixture';

test('a late trial enters independently without moving or hiding the ready purchase link', async ({
  page,
}) => {
  await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/subscription/trial': {
        is_available: true,
        duration_days: 3,
        traffic_limit_gb: 10,
        device_limit: 1,
        requires_payment: false,
        price_kopeks: 0,
        price_rubles: 0,
      },
    },
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await recordEntrances(page, {
    trial: { css: 'main .relative.isolate.overflow-hidden' },
    purchase: { css: 'main a[href="/subscription/purchase"]' },
  });
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/cabinet/subscription/trial', async (route) => {
    await gate;
    await route.fallback();
  });
  try {
    await page.goto('/');
    await expect(page.locator('main a[href="/subscription/purchase"]').first()).toBeVisible();
    await page.waitForTimeout(700);
    await clearEntrances(page);
  } finally {
    release();
  }
  await expectEntrance(page, 'trial');
  await page.waitForTimeout(700);
  await expectStationary(page, ['purchase']);
});

test('an immediately ready trial has one entrance rather than stacking two lifts', async ({
  page,
}) => {
  await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/subscription/trial': {
        is_available: true,
        duration_days: 3,
        traffic_limit_gb: 10,
        device_limit: 1,
        requires_payment: false,
        price_kopeks: 0,
        price_rubles: 0,
      },
    },
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await recordEntrances(page, { trial: { css: 'main .relative.isolate.overflow-hidden' } });
  await page.goto('/');
  await expectEntrance(page, 'trial');
  expect(
    await page.evaluate(() => Math.max(...window.entranceFrames.trial.map((frame) => frame.y))),
  ).toBeLessThanOrEqual(8.05);
});

for (const mode of ['purchase', 'renewal'])
  test(`ready ${mode} context banners enter after delayed metadata`, async ({ page }) => {
    const fixture = await prepareAuthenticatedPage(page, {
      responses: {
        ...responses,
        '/api/cabinet/subscription':
          mode === 'purchase'
            ? { has_subscription: true, subscription: { ...subscription, is_trial: true } }
            : responses['/api/cabinet/subscription'],
        '/api/cabinet/subscriptions': {
          subscriptions: [{ ...subscription, is_trial: mode === 'purchase' }],
          multi_tariff_enabled: false,
        },
        '/api/cabinet/subscription/purchase-options': classicPurchaseOptions,
        '/api/cabinet/subscription/purchase-preview': {
          total_price_kopeks: 9900,
          total_price_label: '99 ₽',
          balance_kopeks: 0,
          missing_amount_kopeks: 9900,
          can_purchase: false,
          breakdown: [],
        },
        '/api/cabinet/promo/group-discounts': {
          group_name: 'Entrance group',
          device_discount_percent: 0,
          server_discount_percent: 0,
          traffic_discount_percent: 0,
          period_discounts: {},
        },
      },
    });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await recordEntrances(page, {
      group: { css: 'main a[href="/info"]' },
      upgrade: { css: 'main .space-y-4 > .border-warning-500\\/30' },
    });
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route('**/api/cabinet/promo/group-discounts', async (route) => {
      await gate;
      await route.fallback();
    });
    try {
      await page.goto(mode === 'purchase' ? '/subscription/purchase' : '/subscriptions/42/renew');
      await expect(page.locator('main h1')).toBeVisible();
      await page.waitForTimeout(700);
      await clearEntrances(page);
    } finally {
      release();
    }
    await expectEntrance(page, 'group');
    if (mode === 'purchase') await expectEntrance(page, 'upgrade');
    expect([...fixture.unexpectedApiRequests]).toEqual([]);
  });
