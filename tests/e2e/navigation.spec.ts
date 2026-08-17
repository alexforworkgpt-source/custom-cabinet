import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

test('shows the simplified desktop or mobile user navigation', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page);

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome, Browser Test!' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Choose tariff' })).toBeVisible();

  if ((page.viewportSize()?.width ?? 1280) < 1024) {
    await expect(page.locator('header:visible')).toHaveCount(0);

    const bottomNavigation = page.locator('nav:visible');
    await expect(bottomNavigation.getByRole('link')).toHaveCount(4);
    await expect(
      bottomNavigation.getByRole('link', { name: 'Dashboard', exact: true }),
    ).toBeVisible();
    const tariffsLink = bottomNavigation.getByRole('link', { name: 'Tariffs', exact: true });
    await expect(tariffsLink).toBeVisible();
    await expect(tariffsLink).toHaveAttribute('href', '/subscription/purchase');
    await expect(
      bottomNavigation.getByRole('link', { name: 'Support', exact: true }),
    ).toBeVisible();
    await expect(
      bottomNavigation.getByRole('link', { name: 'Profile', exact: true }),
    ).toBeVisible();
  } else {
    const desktopNavigation = page.locator('header:visible nav');
    await expect(desktopNavigation).toBeVisible();
    await expect(
      desktopNavigation.getByRole('link', { name: 'Dashboard', exact: true }),
    ).toBeVisible();
    const tariffsLink = desktopNavigation.getByRole('link', { name: 'Tariffs', exact: true });
    await expect(tariffsLink).toBeVisible();
    await expect(tariffsLink).toHaveAttribute('href', '/subscription/purchase');
    await expect(
      desktopNavigation.getByRole('link', { name: 'Support', exact: true }),
    ).toBeVisible();
    await expect(
      desktopNavigation.getByRole('link', { name: 'Profile', exact: true }),
    ).toBeVisible();
    await expect(desktopNavigation.getByRole('link', { name: /^Subscriptions?$/ })).toHaveCount(0);
    await expect(desktopNavigation.getByRole('link', { name: 'Balance', exact: true })).toHaveCount(
      0,
    );
    await expect(desktopNavigation.getByRole('link', { name: /Wheel/ })).toHaveCount(0);
  }

  expect([...unexpectedApiRequests]).toEqual([]);
});

test('/balance preserves details without starting a new top-up', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page);

  await page.goto('/balance');
  await expect(page).toHaveURL('/balance');
  const balanceDialog = page.getByRole('dialog');
  await expect(balanceDialog).toBeVisible();
  await expect(
    balanceDialog.getByRole('heading', { name: 'Balance', exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Select Payment Method' })).toHaveCount(0);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('keeps subscription compatibility routes on the unified Dashboard', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/subscription': {
        has_subscription: true,
        subscription: {
          id: 7,
          status: 'active',
          is_active: true,
          is_expired: false,
          is_limited: false,
          is_trial: false,
          tariff_name: 'Unified plan',
          end_date: '2026-10-15T00:00:00Z',
          days_left: 60,
          traffic_used_gb: 10,
          traffic_used_percent: 10,
          traffic_limit_gb: 100,
          device_limit: 3,
          subscription_url: 'https://example.test/subscription',
        },
      },
      '/api/cabinet/subscriptions': {
        subscriptions: [
          {
            id: 7,
            status: 'active',
            is_active: true,
            is_expired: false,
            is_limited: false,
            is_trial: false,
            tariff_name: 'Unified plan',
            end_date: '2026-10-15T00:00:00Z',
            days_left: 60,
            traffic_used_gb: 10,
            traffic_used_percent: 10,
            traffic_limit_gb: 100,
            device_limit: 3,
            subscription_url: 'https://example.test/subscription',
          },
        ],
        multi_tariff_enabled: false,
      },
      '/api/cabinet/subscription/devices': { devices: [], total: 0, device_limit: 3 },
      '/api/cabinet/subscription/refresh-traffic': {
        traffic_used_gb: 10,
        traffic_used_percent: 10,
        is_unlimited: false,
      },
      '/api/cabinet/subscription/connection-link': {
        subscription_url: 'https://example.test/subscription',
        display_link: 'https://example.test/subscription',
        connect_mode: 'plain',
        hide_link: false,
      },
      '/api/cabinet/subscription/purchase-options': {
        sales_mode: 'classic',
        periods: [],
        balance_kopeks: 100_000,
        balance_label: '1,000 RUB',
      },
      '/api/cabinet/subscription/platega-recurrent': { status: 'none' },
      '/api/cabinet/subscription/lava-recurrent': { status: 'none' },
    },
  });

  await page.goto('/subscriptions/7');
  const managementDialog = page.getByRole('dialog');
  await expect(managementDialog).toBeVisible();
  await expect(
    managementDialog.getByRole('heading', { name: 'Manage subscription' }),
  ).toBeVisible();
  await expect(managementDialog.getByRole('heading', { name: 'Additional Options' })).toBeVisible();
  await expect(managementDialog.getByRole('link', { name: /My Devices/ })).toBeVisible();
  expect(
    await managementDialog.evaluate((dialog) => {
      const dialogRect = dialog.getBoundingClientRect();
      return {
        horizontalOverflow:
          document.documentElement.scrollWidth > document.documentElement.clientWidth,
        dialogWithinViewport:
          dialogRect.left >= 0 && dialogRect.right <= document.documentElement.clientWidth,
      };
    }),
  ).toEqual({ horizontalOverflow: false, dialogWithinViewport: true });

  await page.keyboard.press('Escape');
  await expect(managementDialog).toBeHidden();
  await expect(page).toHaveURL('/?sub=7');
  await expect(page.getByRole('heading', { name: 'Traffic Usage' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Traffic Usage' })).toHaveCount(1);
  const compactPlanName = page.getByText('Unified plan', { exact: true }).last();
  await expect(compactPlanName).toBeVisible();
  await expect(compactPlanName.locator('..')).not.toHaveAttribute('href');
  await expect(page.getByRole('link', { name: 'Dashboard', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('canonicalizes an unknown subscription compatibility route', async ({ page }) => {
  await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/subscriptions': {
        subscriptions: [
          {
            id: 7,
            status: 'active',
            is_active: true,
            is_expired: false,
            is_limited: false,
            is_trial: false,
            tariff_name: 'Unified plan',
            end_date: '2026-10-15T00:00:00Z',
            days_left: 60,
            traffic_used_gb: 10,
            traffic_used_percent: 10,
            traffic_limit_gb: 100,
            device_limit: 3,
            subscription_url: 'https://example.test/subscription',
          },
        ],
        multi_tariff_enabled: false,
      },
    },
  });

  await page.goto('/subscriptions/999');
  await expect(page).toHaveURL('/?sub=7');
});

test('does not restore legacy user navigation on admin routes', async ({ page }) => {
  await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/auth/me/is-admin': { is_admin: true },
      '/api/cabinet/admin/apps/remnawave/status': { enabled: false, config_uuid: null },
      '/api/cabinet/admin/apps/remnawave/configs': [],
    },
  });

  await page.goto('/admin/apps');
  const isMobile = (page.viewportSize()?.width ?? 1280) < 1024;
  if (isMobile) {
    const bottomNavigation = page.locator('nav:visible').last();
    await expect(bottomNavigation.getByRole('link')).toHaveCount(4);
    await page.getByRole('button', { name: 'Open menu' }).click();
  }
  const navigation = isMobile
    ? page.locator('.mobile-menu-content nav')
    : page.locator('header nav');

  await expect(page.getByRole('link', { name: 'Balance', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: /^Subscriptions?$/ })).toHaveCount(0);
  await expect(navigation.getByRole('link', { name: 'Dashboard', exact: true })).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'Tariffs', exact: true })).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'Support', exact: true })).toBeVisible();
  await expect(navigation.getByRole('link', { name: 'Profile', exact: true })).toBeVisible();
});

test('uses black and white base themes with the persistent grid', async ({ page }) => {
  await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/branding/animation-config': {
        enabled: true,
        type: 'aurora',
        settings: {},
        opacity: 1,
        blur: 0,
        reducedOnMobile: false,
      },
    },
  });
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('cabinet-theme', 'dark'));
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);

  const darkTheme = await page.evaluate(() => ({
    background: getComputedStyle(document.body).backgroundColor,
    grid: getComputedStyle(document.body, '::before').backgroundImage,
    gridSize: getComputedStyle(document.body, '::before').backgroundSize,
    gridFilter: getComputedStyle(document.body, '::before').filter,
    gridAnimation: getComputedStyle(document.body, '::before').animationName,
    animatedBackgrounds: document.querySelectorAll('body > .pointer-events-none.fixed.inset-0')
      .length,
  }));
  expect(darkTheme.background).toBe('rgb(0, 0, 0)');
  expect(darkTheme.grid).toContain('linear-gradient');
  expect(darkTheme.gridSize).toBe('48px 48px, 48px 48px');
  expect(darkTheme.gridFilter).toBe('blur(0.5px)');
  expect(darkTheme.gridAnimation).toBe('none');
  expect(darkTheme.animatedBackgrounds).toBe(0);

  await page.evaluate(() => localStorage.setItem('cabinet-theme', 'light'));
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/light/);

  const lightTheme = await page.evaluate(() => ({
    background: getComputedStyle(document.body).backgroundColor,
    grid: getComputedStyle(document.body, '::before').backgroundImage,
    gridSize: getComputedStyle(document.body, '::before').backgroundSize,
    gridFilter: getComputedStyle(document.body, '::before').filter,
    gridAnimation: getComputedStyle(document.body, '::before').animationName,
    animatedBackgrounds: document.querySelectorAll('body > .pointer-events-none.fixed.inset-0')
      .length,
  }));
  expect(lightTheme.background).toBe('rgb(255, 255, 255)');
  expect(lightTheme.grid).toContain('linear-gradient');
  expect(lightTheme.gridSize).toBe('48px 48px, 48px 48px');
  expect(lightTheme.gridFilter).toBe('blur(0.5px)');
  expect(lightTheme.gridAnimation).toBe('none');
  expect(lightTheme.animatedBackgrounds).toBe(0);
});
