import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

const subscription = {
  id: 1,
  status: 'active',
  is_trial: false,
  start_date: '2026-08-01T00:00:00Z',
  end_date: '2026-09-15T00:00:00Z',
  days_left: 30,
  hours_left: 0,
  minutes_left: 0,
  time_left_display: '30 days',
  traffic_limit_gb: 999.9,
  traffic_used_gb: 987.6,
  traffic_used_percent: 98.77,
  device_limit: 10,
  connected_squads: [],
  servers: [],
  autopay_enabled: false,
  autopay_days_before: 0,
  subscription_url: 'https://subscription.example.test/accent-check',
  hide_subscription_link: false,
  is_active: true,
  is_expired: false,
  is_limited: false,
  tariff_id: 10,
  tariff_name: 'Standard',
};

const activeSubscriptionResponses = {
  '/api/cabinet/subscription': { has_subscription: true, subscription },
  '/api/cabinet/subscriptions': {
    subscriptions: [subscription],
    multi_tariff_enabled: false,
  },
  '/api/cabinet/subscription/devices': {
    devices: [],
    total: 0,
    device_limit: subscription.device_limit,
  },
  '/api/cabinet/subscription/refresh-traffic': {
    success: true,
    cached: false,
    traffic_used_gb: subscription.traffic_used_gb,
    traffic_used_percent: subscription.traffic_used_percent,
    traffic_limit_gb: subscription.traffic_limit_gb,
    is_unlimited: false,
  },
};

test('keeps white content on filled actions for the operator accent', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      ...activeSubscriptionResponses,
      '/api/cabinet/branding/colors': {
        accent: '#0EA5E9',
        darkBackground: '#000000',
        darkSurface: '#0a0a0a',
        darkText: '#fafafa',
        darkTextSecondary: '#a3a3a3',
        lightBackground: '#ffffff',
        lightSurface: '#fafafa',
        lightText: '#0a0a0a',
        lightTextSecondary: '#525252',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
      },
    },
  });

  await page.goto('/');

  const connectDevice = page.locator('[data-onboarding="connect-devices"]');
  const connectTitle = connectDevice.locator('.text-sm.font-semibold');
  const connectIcon = connectDevice.locator('svg').first();

  await expect(connectDevice).toBeVisible();
  await expect(connectTitle).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(connectIcon).toHaveCSS('color', 'rgb(255, 255, 255)');
  expect(
    await connectDevice.evaluate((element) => getComputedStyle(element).backgroundImage),
  ).toContain('rgb(14, 165, 233)');
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('shows the traffic refresh countdown before restoring the action', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      ...activeSubscriptionResponses,
      '/api/cabinet/subscription/refresh-traffic': {
        ...activeSubscriptionResponses['/api/cabinet/subscription/refresh-traffic'],
        rate_limited: true,
        retry_after_seconds: 3,
      },
    },
  });
  let refreshRequests = 0;
  page.on('request', (request) => {
    if (new URL(request.url()).pathname === '/api/cabinet/subscription/refresh-traffic') {
      refreshRequests += 1;
    }
  });
  await page.goto('/');
  const refreshButton = page.locator('[data-traffic-refresh]');

  await expect(refreshButton).toContainText(/^[123]s$/);
  await expect(refreshButton).toHaveText('Refresh', { timeout: 5000 });
  await expect(refreshButton).toBeEnabled();
  await refreshButton.click();
  await expect(refreshButton).toHaveText('3s');
  expect(refreshRequests).toBe(2);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('uses restrained accent states for key secondary actions', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    featureFlags: { giftEnabled: true },
    responses: {
      '/api/cabinet/branding/gift-enabled': { enabled: true },
      ...activeSubscriptionResponses,
      '/api/cabinet/gift/config': {
        is_enabled: true,
        tariffs: [
          {
            id: 10,
            name: 'Gift plan',
            description: 'Browser test plan',
            traffic_limit_gb: 100,
            device_limit: 3,
            periods: [
              {
                days: 30,
                price_kopeks: 30_000,
                price_label: '300 RUB',
                original_price_kopeks: null,
                discount_percent: null,
              },
            ],
          },
        ],
        payment_methods: [],
        balance_kopeks: 125_000,
        currency_symbol: 'RUB',
        promo_group_name: null,
        active_discount_percent: null,
        active_discount_expires_at: null,
      },
      '/api/cabinet/gift/pending': [],
      '/api/cabinet/gift/sent': [],
      '/api/cabinet/gift/received': [],
    },
  });

  for (const theme of ['dark', 'light']) {
    await page.goto('/');
    const connectDevice = page.locator('[data-onboarding="connect-devices"]');
    await expect(connectDevice).toBeVisible();
    await page.evaluate((nextTheme) => {
      localStorage.setItem('cabinet-theme', nextTheme);
      window.dispatchEvent(new CustomEvent('themeChanged', { detail: nextTheme }));
    }, theme);
    await expect(page.locator('html')).toHaveClass(new RegExp(theme));

    await expect(connectDevice).toHaveClass(/connect-device-gradient-button/);
    const connectPresentation = await connectDevice.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        animationName: style.animationName,
        backgroundImage: style.backgroundImage,
      };
    });
    expect(connectPresentation.animationName).toBe('border-rotate');
    expect(connectPresentation.backgroundImage).toContain('conic-gradient');
    const accentRgb = await page.evaluate(() => {
      const probe = document.createElement('span');
      probe.className = 'bg-accent-500';
      document.body.appendChild(probe);
      const color = getComputedStyle(probe).backgroundColor;
      probe.remove();
      return color;
    });
    expect(connectPresentation.backgroundImage).toContain(
      `linear-gradient(${accentRgb}, ${accentRgb})`,
    );

    const onAccentColor = await page.evaluate(() => {
      const probe = document.createElement('span');
      probe.className = 'text-on-accent';
      document.body.appendChild(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    });
    await expect(connectDevice.locator('.text-sm.font-semibold')).toHaveCSS('color', onAccentColor);

    const refreshButton = page.locator('[data-traffic-refresh]');
    const trafficPercentage = page.locator('[data-traffic-percentage]');
    const trafficCard = page.getByRole('region', { name: 'Traffic Usage' });
    expect(
      await trafficCard.evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    const [refreshBox, percentageBox] = await Promise.all([
      refreshButton.boundingBox(),
      trafficPercentage.boundingBox(),
    ]);
    if (!refreshBox || !percentageBox) {
      throw new Error('Traffic refresh and percentage must have measurable layout boxes');
    }
    expect(refreshBox.x + refreshBox.width).toBeLessThanOrEqual(percentageBox.x);
    expect(
      Math.abs(refreshBox.y + refreshBox.height / 2 - (percentageBox.y + percentageBox.height / 2)),
    ).toBeLessThanOrEqual(6);

    const manageSubscription = page.getByRole('button', { name: 'Manage subscription' });
    await expect(manageSubscription).toHaveCSS('border-top-width', '0px');
    await expect(manageSubscription).toHaveClass(/bg-accent-500\/\[0\.06\]/);
    await expect(manageSubscription.locator('svg')).toHaveCount(1);

    const copyLink = page.getByRole('button', { name: 'Copy link' });
    const copyIcon = copyLink.locator('svg');
    const supportsHover = await page.evaluate(() => matchMedia('(hover: hover)').matches);
    if (supportsHover) {
      const initialCopyIconColor = await copyIcon.evaluate(
        (element) => getComputedStyle(element).color,
      );
      await copyLink.hover();
      const accentTextColor = await page.evaluate(() => {
        const probe = document.createElement('span');
        probe.className = 'text-accent-400';
        document.body.appendChild(probe);
        const color = getComputedStyle(probe).color;
        probe.remove();
        return color;
      });
      await expect(copyIcon).toHaveCSS('color', accentTextColor);
      expect(accentTextColor).not.toBe(initialCopyIconColor);
    }

    await page.goto('/gift');
    const selectedPaymentMode = page.getByRole('button', { name: /From balance/ });
    await expect(selectedPaymentMode).toHaveAttribute('aria-pressed', 'true');
    await expect(selectedPaymentMode).toHaveClass(/border-accent-500\/30/);
    await expect(selectedPaymentMode).toHaveClass(/bg-accent-500\/10/);
    await expect(selectedPaymentMode).toHaveClass(/text-accent-400/);
  }

  expect([...unexpectedApiRequests]).toEqual([]);
});
