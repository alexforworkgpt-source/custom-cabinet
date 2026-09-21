import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

function deferred() {
  let release = () => {};
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

test('shows independent loading values without false unavailable or zero balances', async ({
  page,
}) => {
  const balance = deferred();
  const referral = deferred();
  await prepareAuthenticatedPage(page, {
    featureFlags: { referralEnabled: true },
    responses: {
      '/api/cabinet/referral/terms': {
        is_enabled: true,
        commission_percent: 20,
        minimum_topup_kopeks: 0,
        minimum_topup_rubles: 0,
        first_topup_bonus_kopeks: 0,
        first_topup_bonus_rubles: 0,
        inviter_bonus_kopeks: 0,
        inviter_bonus_rubles: 0,
        max_commission_payments: 0,
      },
      '/api/cabinet/balance': { balance_kopeks: 4200, balance_rubles: 42 },
      '/api/cabinet/referral': {
        referral_code: '',
        referral_link: '',
        total_referrals: 7,
        active_referrals: 7,
        total_earnings_kopeks: 32000,
        total_earnings_rubles: 320,
        commission_percent: 0,
        available_balance_kopeks: 32000,
        available_balance_rubles: 320,
        withdrawn_kopeks: 0,
      },
    },
  });
  await page.route('**/api/cabinet/balance', async (route) => {
    await balance.promise;
    await route.fallback();
  });
  await page.route('**/api/cabinet/referral', async (route) => {
    await referral.promise;
    await route.fallback();
  });

  await page.goto('/');
  const balanceCard = page.getByRole('link', { name: /Balance/ }).first();
  const referralCard = page.getByRole('link', { name: /Referrals/ }).first();
  await expect(balanceCard).toBeVisible();
  await expect(referralCard).toBeVisible();
  await expect(balanceCard.getByRole('status', { name: /^Loading/ })).toBeVisible();
  await expect(referralCard.getByRole('status', { name: /^Loading/ })).toBeVisible();
  await expect(balanceCard).not.toContainText('Unavailable');
  await expect(referralCard).not.toContainText('0');

  balance.release();
  await expect(balanceCard).toContainText('42');
  await expect(referralCard).not.toContainText('0');
  referral.release();
  await expect(referralCard).toContainText('7');
  await expect(referralCard).toContainText('3.20');
});

const subscription = {
  id: 7,
  status: 'active',
  is_trial: false,
  is_active: true,
  is_expired: false,
  is_limited: false,
  end_date: '2026-10-15T00:00:00Z',
  days_left: 60,
  traffic_limit_gb: 100,
  traffic_used_gb: 10,
  traffic_used_percent: 10,
  device_limit: 3,
  connected_squads: [],
  servers: [],
  tariff_name: 'Selected plan',
  subscription_url: 'https://example.test/selected-link',
  hide_subscription_link: false,
};

test('reveals subscription details before devices and link without moving balance', async ({
  page,
}, testInfo) => {
  // The PRD's mobile geometry target is 390px; at 320px the action text wraps.
  if ((page.viewportSize()?.width ?? 0) < 375)
    await page.setViewportSize({ width: 390, height: 844 });
  if (testInfo.project.name === 'desktop-1280') {
    await page.setViewportSize({ width: 1440, height: 1000 });
  }
  const details = deferred();
  const devices = deferred();
  const link = deferred();
  await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/subscriptions': { subscriptions: [subscription], multi_tariff_enabled: true },
      '/api/cabinet/subscription': { has_subscription: true, subscription },
      '/api/cabinet/subscription/devices': { devices: [], total: 0, device_limit: 3 },
      '/api/cabinet/subscription/connection-link': {
        subscription_url: subscription.subscription_url,
        display_link: subscription.subscription_url,
        connect_mode: 'plain',
        hide_link: false,
      },
      '/api/cabinet/subscription/refresh-traffic': {
        traffic_used_gb: 10,
        traffic_used_percent: 10,
        is_unlimited: false,
      },
    },
  });
  await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, async (route) => {
    await details.promise;
    await route.fallback();
  });
  await page.route('**/api/cabinet/subscription/devices**', async (route) => {
    await devices.promise;
    await route.fallback();
  });
  await page.route('**/api/cabinet/subscription/connection-link**', async (route) => {
    await link.promise;
    await route.fallback();
  });

  await page.goto('/?sub=7');
  await expect(page.getByRole('heading', { name: 'Traffic usage' })).toBeVisible();
  await expect(page.getByText('Selected plan')).toHaveCount(0);
  const balanceCard = page.getByRole('link', { name: /Balance/ }).first();
  const beforeDetails = (await balanceCard.boundingBox())?.y;
  details.release();
  await expect(page.getByText('Selected plan')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Manage subscription' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy Link' })).toHaveCount(0);

  const before = (await balanceCard.boundingBox())?.y;
  devices.release();
  await expect(page.getByRole('button', { name: /Set Up VPN/ })).toBeVisible();
  const afterDevices = (await balanceCard.boundingBox())?.y;
  link.release();
  await expect(page.getByRole('button', { name: 'Copy Link' })).toBeVisible();
  const afterLink = (await balanceCard.boundingBox())?.y;
  if (
    beforeDetails === undefined ||
    before === undefined ||
    afterDevices === undefined ||
    afterLink === undefined
  ) {
    throw new Error('Balance must remain visible during subscription loading');
  }
  expect(Math.abs(before - beforeDetails)).toBeLessThanOrEqual(4);
  expect(Math.abs(afterDevices - before)).toBeLessThanOrEqual(4);
  expect(Math.abs(afterLink - afterDevices)).toBeLessThanOrEqual(4);
});

test('ends balance loading on error and shows the real value after retry', async ({ page }) => {
  await prepareAuthenticatedPage(page, {
    responses: { '/api/cabinet/balance': { balance_kopeks: 4200, balance_rubles: 42 } },
  });
  let attempts = 0;
  await page.route('**/api/cabinet/balance', async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await route.fulfill({ status: 500, json: { detail: 'Temporary error' } });
    } else {
      await route.fallback();
    }
  });
  await page.goto('/');
  await expect(page.getByText(/Balance could not be loaded/)).toBeVisible();
  const balanceCard = page.getByRole('link', { name: /Balance/ }).first();
  await expect(balanceCard).toContainText('Unavailable');
  await page.getByRole('button', { name: 'Retry' }).first().click();
  await expect(balanceCard).toContainText('42');
  expect(attempts).toBe(2);
});

test('ends subscription loading on error and restores the card after retry', async ({ page }) => {
  await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/subscriptions': { subscriptions: [subscription], multi_tariff_enabled: true },
      '/api/cabinet/subscription': { has_subscription: true, subscription },
      '/api/cabinet/subscription/devices': { devices: [], total: 0, device_limit: 3 },
      '/api/cabinet/subscription/connection-link': {
        subscription_url: subscription.subscription_url,
        display_link: subscription.subscription_url,
        connect_mode: 'plain',
        hide_link: false,
      },
      '/api/cabinet/subscription/refresh-traffic': {
        traffic_used_gb: 10,
        traffic_used_percent: 10,
        is_unlimited: false,
      },
    },
  });
  let attempts = 0;
  await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, async (route) => {
    attempts += 1;
    if (attempts === 1) {
      await route.fulfill({ status: 500, json: { detail: 'Temporary error' } });
    } else {
      await route.fallback();
    }
  });
  await page.goto('/?sub=7');
  const error = page
    .getByRole('alert')
    .filter({ hasText: 'Subscription data could not be loaded' });
  await expect(error).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Traffic usage' })).toHaveCount(0);
  await error.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByRole('heading', { name: 'Traffic usage' })).toBeVisible();
  expect(attempts).toBeGreaterThanOrEqual(2);
});

test('keeps late devices and link from a previous subscription out of the selected one', async ({
  page,
}) => {
  const aDevices = deferred();
  const aLink = deferred();
  const other = {
    ...subscription,
    id: 8,
    tariff_name: 'Other plan',
    subscription_url: 'https://example.test/other-link',
    traffic_used_percent: 22,
  };
  await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/subscriptions': {
        subscriptions: [subscription, other],
        multi_tariff_enabled: true,
      },
      '/api/cabinet/subscription': { has_subscription: true, subscription },
      '/api/cabinet/subscription/devices': { devices: [], total: 1, device_limit: 3 },
      '/api/cabinet/subscription/connection-link': {
        subscription_url: subscription.subscription_url,
        display_link: subscription.subscription_url,
        connect_mode: 'plain',
        hide_link: false,
      },
      '/api/cabinet/subscription/refresh-traffic': {
        traffic_used_gb: 10,
        traffic_used_percent: 10,
        is_unlimited: false,
      },
    },
  });
  await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, async (route) => {
    const id = new URL(route.request().url()).searchParams.get('subscription_id');
    if (id === '8') {
      await route.fulfill({ json: { has_subscription: true, subscription: other } });
    } else {
      await route.fallback();
    }
  });
  await page.route('**/api/cabinet/subscription/devices**', async (route) => {
    const id = new URL(route.request().url()).searchParams.get('subscription_id');
    if (id === '7') {
      await aDevices.promise;
      await route.fallback();
    } else {
      await route.fulfill({ json: { devices: [], total: 2, device_limit: 3 } });
    }
  });
  await page.route('**/api/cabinet/subscription/connection-link**', async (route) => {
    const id = new URL(route.request().url()).searchParams.get('subscription_id');
    if (id === '7') {
      await aLink.promise;
      await route.fallback();
    } else {
      await route.fulfill({
        json: {
          subscription_url: other.subscription_url,
          display_link: other.subscription_url,
          connect_mode: 'plain',
          hide_link: false,
        },
      });
    }
  });
  await page.route('**/api/cabinet/subscription/refresh-traffic**', async (route) => {
    const id = new URL(route.request().url()).searchParams.get('subscription_id');
    const used = id === '8' ? 22 : 77;
    await route.fulfill({
      json: {
        traffic_used_gb: used,
        traffic_used_percent: used,
        is_unlimited: false,
      },
    });
  });

  await page.goto('/?sub=7');
  await expect(page.getByText('Selected plan', { exact: true }).last()).toBeVisible();
  await expect(page.locator('[data-traffic-percentage]')).toContainText('77');
  await page.getByRole('combobox', { name: 'Subscriptions' }).selectOption('8');
  await expect(page).toHaveURL('/?sub=8');
  await expect(page.getByText('Other plan', { exact: true }).last()).toBeVisible();
  await expect(page.getByText(other.subscription_url, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Set Up VPN/ })).toContainText('2 / 3');
  await expect(page.locator('[data-traffic-percentage]')).toContainText('22');

  aDevices.release();
  aLink.release();
  await expect(page.getByText(subscription.subscription_url, { exact: true })).toHaveCount(0);
  await expect(page.getByText(other.subscription_url, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /Set Up VPN/ })).toContainText('2 / 3');
  await page.getByRole('combobox', { name: 'Subscriptions' }).selectOption('7');
  await expect(page.locator('[data-traffic-percentage]')).toContainText('77');
});

test('reserves the full-device action height on a narrow screen', async ({ page }) => {
  if ((page.viewportSize()?.width ?? 0) < 375)
    await page.setViewportSize({ width: 390, height: 844 });
  const devices = deferred();
  await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/subscriptions': { subscriptions: [subscription], multi_tariff_enabled: true },
      '/api/cabinet/subscription': { has_subscription: true, subscription },
      '/api/cabinet/subscription/devices': { devices: [], total: 3, device_limit: 3 },
      '/api/cabinet/subscription/connection-link': {
        subscription_url: subscription.subscription_url,
        display_link: subscription.subscription_url,
        connect_mode: 'plain',
        hide_link: false,
      },
      '/api/cabinet/subscription/refresh-traffic': {
        traffic_used_gb: 10,
        traffic_used_percent: 10,
        is_unlimited: false,
      },
    },
  });
  await page.route('**/api/cabinet/subscription/devices**', async (route) => {
    await devices.promise;
    await route.fallback();
  });
  await page.goto('/?sub=7');
  await expect(page.getByRole('button', { name: 'Copy Link' })).toBeVisible();
  const balanceCard = page.getByRole('link', { name: /Balance/ }).first();
  const before = (await balanceCard.boundingBox())?.y;
  devices.release();
  await expect(page.getByRole('button', { name: /My Devices/ })).toContainText('3 / 3');
  const after = (await balanceCard.boundingBox())?.y;
  if (before === undefined || after === undefined) throw new Error('Balance must remain visible');
  expect(Math.abs(after - before)).toBeLessThanOrEqual(4);
});

test('keeps the Russian device action stable while ten of fifteen slots load', async ({ page }) => {
  if ((page.viewportSize()?.width ?? 0) < 375)
    await page.setViewportSize({ width: 390, height: 844 });
  const devices = deferred();
  const link = deferred();
  const russianSubscription = {
    ...subscription,
    status: 'trial',
    is_trial: true,
    device_limit: 15,
    tariff_name: 'Пробный',
  };
  await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      '/api/cabinet/subscriptions': {
        subscriptions: [russianSubscription],
        multi_tariff_enabled: true,
      },
      '/api/cabinet/subscription': { has_subscription: true, subscription: russianSubscription },
      '/api/cabinet/subscription/devices': { devices: [], total: 10, device_limit: 15 },
      '/api/cabinet/subscription/connection-link': {
        subscription_url: subscription.subscription_url,
        display_link: subscription.subscription_url,
        connect_mode: 'plain',
        hide_link: false,
      },
      '/api/cabinet/subscription/refresh-traffic': {
        traffic_used_gb: 10,
        traffic_used_percent: 10,
        is_unlimited: false,
      },
    },
  });
  await page.route('**/api/cabinet/subscription/devices**', async (route) => {
    await devices.promise;
    await route.fallback();
  });
  await page.route('**/api/cabinet/subscription/connection-link**', async (route) => {
    await link.promise;
    await route.fallback();
  });
  await page.goto('/?sub=7');
  await expect(page.getByText('Пробный', { exact: true }).last()).toBeVisible();
  const balanceCard = page.getByRole('link', { name: /Баланс/ }).first();
  const before = (await balanceCard.boundingBox())?.y;
  devices.release();
  const action = page.getByRole('button', { name: /Настроить VPN/ });
  await expect(action).toContainText('10 / 15');
  const after = (await balanceCard.boundingBox())?.y;
  link.release();
  await expect(page.getByRole('button', { name: 'Копировать ссылку' })).toBeVisible();
  const afterLink = (await balanceCard.boundingBox())?.y;
  if (before === undefined || after === undefined || afterLink === undefined) {
    throw new Error('Balance must remain visible');
  }
  expect(Math.abs(after - before)).toBeLessThanOrEqual(4);
  expect(Math.abs(afterLink - after)).toBeLessThanOrEqual(4);
});

test('holds carousel space while empty offers resolve without moving the wheel', async ({
  page,
}) => {
  const offers = deferred();
  const providers = deferred();
  await prepareAuthenticatedPage(page, {
    featureFlags: { wheelEnabled: true },
    responses: { '/api/cabinet/wheel/config': { is_enabled: true } },
  });
  await page.route('**/api/cabinet/promo/offers', async (route) => {
    await offers.promise;
    await route.fallback();
  });
  await page.route('**/api/cabinet/auth/account/linked-providers', async (route) => {
    await providers.promise;
    await route.fallback();
  });
  await page.goto('/');
  const wheel = page.getByRole('link', { name: /Try your luck/ });
  await expect(wheel).toBeVisible();
  await expect(page.getByRole('region', { name: 'Recommended actions' })).toHaveCount(0);
  const beforeOffers = (await wheel.boundingBox())?.y;
  const offersResponse = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/cabinet/promo/offers',
  );
  offers.release();
  await offersResponse;
  const afterOffers = (await wheel.boundingBox())?.y;
  providers.release();
  await expect(page.getByRole('region', { name: 'Recommended actions' })).toBeVisible();
  const afterCarousel = (await wheel.boundingBox())?.y;
  if (beforeOffers === undefined || afterOffers === undefined || afterCarousel === undefined) {
    throw new Error('Wheel must remain visible during promo loading');
  }
  expect(Math.abs(afterOffers - beforeOffers)).toBeLessThanOrEqual(4);
  expect(Math.abs(afterCarousel - afterOffers)).toBeLessThanOrEqual(4);
});

test('does not apply a late traffic error from A to the refresh action on B', async ({ page }) => {
  const lateTraffic = deferred();
  let startedA = () => {};
  const requestA = new Promise<void>((resolve) => {
    startedA = resolve;
  });
  const other = { ...subscription, id: 8, tariff_name: 'Other plan' };
  await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/subscriptions': {
        subscriptions: [subscription, other],
        multi_tariff_enabled: true,
      },
      '/api/cabinet/subscription': { has_subscription: true, subscription },
      '/api/cabinet/subscription/devices': { devices: [], total: 0, device_limit: 3 },
      '/api/cabinet/subscription/connection-link': {
        subscription_url: subscription.subscription_url,
        display_link: subscription.subscription_url,
        connect_mode: 'plain',
        hide_link: false,
      },
    },
  });
  await page.addInitScript(() => {
    localStorage.setItem('traffic_refresh_ts_8', String(Date.now() - 20_000));
  });
  await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, async (route) => {
    if (new URL(route.request().url()).searchParams.get('subscription_id') === '8') {
      await route.fulfill({ json: { has_subscription: true, subscription: other } });
    } else {
      await route.fallback();
    }
  });
  await page.route('**/api/cabinet/subscription/refresh-traffic**', async (route) => {
    startedA();
    await lateTraffic.promise;
    await route.fulfill({ status: 429, json: { detail: 'Rate limited' } });
  });
  await page.goto('/?sub=7');
  await requestA;
  await page.getByRole('combobox', { name: 'Subscriptions' }).selectOption('8');
  await expect(page.getByText('Other plan', { exact: true }).last()).toBeVisible();
  const refresh = page.locator('[data-traffic-refresh]');
  await expect(refresh).toContainText(/^(10|[1-9])s$/);
  const before = Number((await refresh.textContent())?.replace('s', ''));
  const errorResponse = page.waitForResponse(
    (response) => new URL(response.url()).pathname === '/api/cabinet/subscription/refresh-traffic',
  );
  lateTraffic.release();
  await errorResponse;
  await page.waitForTimeout(300);
  const after = Number((await refresh.textContent())?.replace('s', ''));
  expect(after).toBeLessThanOrEqual(before);
});

for (const theme of ['dark', 'light'] as const) {
  test(`keeps loading accessible and contained in the ${theme} theme`, async ({
    page,
  }, testInfo) => {
    const subscriptions = deferred();
    const balance = deferred();
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    await prepareAuthenticatedPage(page);
    await page.addInitScript(
      (selectedTheme) => localStorage.setItem('cabinet-theme', selectedTheme),
      theme,
    );
    await page.route('**/api/cabinet/subscriptions', async (route) => {
      await subscriptions.promise;
      await route.fallback();
    });
    await page.route('**/api/cabinet/balance', async (route) => {
      await balance.promise;
      await route.fallback();
    });
    await page.goto('/');
    const loading = page.getByRole('status', { name: 'Loading' });
    await expect(loading.first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
      false,
    );
    expect(await loading.first().locator('a,button,input,[tabindex]').count()).toBe(0);
    const animation = await loading.first().evaluate((element) => {
      const skeleton = element.querySelector('span.animate-pulse');
      if (!skeleton) throw new Error('Loading state must contain a placeholder');
      const style = getComputedStyle(skeleton);
      return { duration: style.animationDuration, iterations: style.animationIterationCount };
    });
    expect(parseFloat(animation.duration)).toBeLessThanOrEqual(0.001);
    expect(animation.iterations).toBe('1');
    await page.screenshot({ path: testInfo.outputPath(`dashboard-loading-${theme}.png`) });
    subscriptions.release();
    balance.release();
    await expect(page.getByRole('link', { name: /Balance/ }).first()).toContainText('0');
  });
}
