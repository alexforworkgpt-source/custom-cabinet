import { expect, test } from '@playwright/test';
import { mainNavigation, prepareMobileNavigation } from './mobileNavigationFixture';
import { subscription } from './classicRenewalFixture';
import { classicPurchaseOptions } from './classicPurchasePricingFixture';

const tariff = {
  id: 7,
  name: 'Navigation tariff',
  description: 'Local catalogue',
  traffic_limit_gb: 100,
  traffic_limit_label: '100 GB',
  device_limit: 3,
  extra_devices_count: 0,
  servers: [],
  is_available: true,
  periods: [
    {
      days: 30,
      months: 1,
      label: '30 days',
      price_kopeks: 50000,
      price_label: '500 ₽',
      price_per_month_kopeks: 50000,
      price_per_month_label: '500 ₽',
    },
  ],
};

for (const count of [0, 1, 2])
  test(`catalogue navigation is independent of ${count} existing subscriptions and hides during checkout`, async ({
    page,
  }) => {
    const subscriptions = Array.from({ length: count }, (_, index) => ({
      ...subscription,
      id: 42 + index,
      tariff_id: 9 + index,
    }));
    const fixture = await prepareMobileNavigation(page, {
      '/api/cabinet/subscriptions': { subscriptions, multi_tariff_enabled: true },
      '/api/cabinet/subscription/purchase-options': {
        sales_mode: 'tariffs',
        tariffs: [tariff],
        balance_kopeks: 100000,
      },
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/subscription/purchase');
    await page.getByText('Local catalogue', { exact: true }).waitFor();
    const navigation = mainNavigation(page);
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole('link')).toHaveCount(4);
    if ((page.viewportSize()?.width ?? 1280) < 1024) {
      const destination =
        count === 0
          ? '/subscription/purchase'
          : count === 1
            ? '/subscriptions/42'
            : '/subscriptions';
      await expect(navigation.locator(`a[href="${destination}"]`)).toHaveAttribute(
        'aria-current',
        'page',
      );
    }
    await page.getByRole('button', { name: 'Purchase', exact: true }).click();
    await expect(page.getByRole('button', { name: /Back/ })).toBeVisible();
    if ((page.viewportSize()?.width ?? 1280) < 1024) await expect(navigation).toHaveCount(0);
    else await expect(navigation).toBeVisible();
    await page.getByRole('button', { name: /Back/ }).click();
    await expect(page.getByText('Local catalogue', { exact: true })).toBeVisible();
    await expect(navigation).toBeVisible();
    await navigation.getByRole('link', { name: 'Profile', exact: true }).click();
    await expect(page).toHaveURL('/profile');
    await page.goBack();
    await expect(page).toHaveURL('/subscription/purchase');
    await expect(navigation).toBeVisible();
    expect(
      fixture.apiRequests.filter((request) => /^POST .*\/(purchase|renew|switch)/.test(request)),
    ).toEqual([]);
    expect([...fixture.unexpectedApiRequests]).toEqual([]);
  });

test('the classic purchase wizard has no mobile panel from period selection through confirmation', async ({
  page,
}) => {
  const fixture = await prepareMobileNavigation(page, {
    '/api/cabinet/subscription/purchase-options': classicPurchaseOptions,
    '/api/cabinet/subscription/purchase-preview': {
      total_price_kopeks: 9900,
      total_price_label: '99 ₽',
      balance_kopeks: 125000,
      missing_amount_kopeks: 0,
      can_purchase: true,
      breakdown: [],
    },
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/subscription/purchase');
  await page.getByRole('button', { name: /30 дней/ }).waitFor();
  for (let step = 0; step < 3; step++) {
    if ((page.viewportSize()?.width ?? 1280) < 1024)
      await expect(mainNavigation(page)).toHaveCount(0);
    else await expect(mainNavigation(page)).toBeVisible();
    if (step < 2) await page.getByRole('button', { name: /^Next/ }).click();
  }
  expect(
    fixture.apiRequests.filter((request) => /^POST .*\/subscription\/purchase$/.test(request)),
  ).toEqual([]);
  expect([...fixture.unexpectedApiRequests]).toEqual([]);
});

test('a catalogue retains navigation while the subscription destination is pending or unavailable', async ({
  page,
}) => {
  const fixture = await prepareMobileNavigation(page, {
    '/api/cabinet/subscription/purchase-options': {
      sales_mode: 'tariffs',
      tariffs: [tariff],
      balance_kopeks: 100000,
    },
  });
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/cabinet/subscriptions', async (route) => {
    await gate;
    await route.fulfill({ status: 503, json: { detail: 'Local unavailable list' } });
  });
  try {
    await page.goto('/subscription/purchase');
    await page.getByText('Local catalogue', { exact: true }).waitFor();
    await expect(mainNavigation(page)).toBeVisible();
    await expect(
      mainNavigation(page).getByRole('button', { name: 'Loading...', exact: true }),
    ).toBeDisabled();
  } finally {
    release();
  }
  await expect(
    mainNavigation(page).getByRole('button', { name: 'Retry', exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Local catalogue', { exact: true })).toBeVisible();
  await mainNavigation(page).getByRole('link', { name: 'Profile', exact: true }).click();
  await expect(page).toHaveURL('/profile');
  expect([...fixture.unexpectedApiRequests]).toEqual([]);
});
