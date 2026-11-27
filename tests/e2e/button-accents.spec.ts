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

test('keeps the Dashboard and Support actions white on a bright operator accent', async ({
  page,
}) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      ...activeSubscriptionResponses,
      '/api/cabinet/info/support-config': {
        tickets_enabled: true,
        support_type: 'tickets',
        support_url: null,
        support_username: null,
      },
      '/api/cabinet/tickets': { items: [], total: 0, page: 1, per_page: 20 },
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
  const manage = page.getByRole('button', { name: 'Manage subscription' });
  await expect(manage).toHaveCSS('background-color', 'rgb(10, 116, 163)');
  await expect(manage).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(connectTitle).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(connectIcon).toHaveCSS('color', 'rgb(255, 255, 255)');
  expect(
    await connectDevice.evaluate((element) => getComputedStyle(element).backgroundImage),
  ).toContain('rgb(10, 116, 163)');
  expect([...unexpectedApiRequests]).toEqual([]);

  await page.goto('/support');
  const newTicket = page.getByRole('button', { name: 'New Ticket', exact: true });
  await expect(newTicket).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(newTicket).toHaveCSS('background-color', 'rgb(10, 116, 163)');
  await expect(newTicket.getByText('New Ticket', { exact: true })).toHaveCSS(
    'color',
    'rgb(255, 255, 255)',
  );
});

test('loads traffic automatically even when the refresh response is rate limited', async ({
  page,
}) => {
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
  const traffic = page.getByRole('progressbar', { name: /Traffic/ });
  await expect(traffic).toHaveAttribute('aria-valuenow', '99');
  await expect(page.getByRole('button', { name: 'Refresh' })).toHaveCount(0);
  expect(refreshRequests).toBe(1);
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

  await page.addInitScript(() => {
    if (window.name === 'dark' || window.name === 'light') {
      localStorage.setItem('cabinet-theme', window.name);
    }
  });
  for (const theme of ['dark', 'light']) {
    await page.evaluate((nextTheme) => {
      window.name = nextTheme;
    }, theme);
    await page.goto('/');
    const connectDevice = page.locator('[data-onboarding="connect-devices"]');
    await expect(connectDevice).toBeVisible();
    const root = page.locator('html');
    await expect(root).toHaveClass(new RegExp(theme));

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
      probe.style.color = 'rgb(var(--color-on-accent-readable))';
      document.body.appendChild(probe);
      const color = getComputedStyle(probe).color;
      probe.remove();
      return color;
    });
    await expect(connectDevice.locator('.text-sm.font-semibold')).toHaveCSS('color', onAccentColor);

    const trafficPercentage = page.locator('[data-traffic-percentage]');
    const trafficCard = page.getByRole('region', { name: 'Subscription active', exact: true });
    await expect(trafficPercentage).toHaveText('99%');
    expect(
      await trafficCard.evaluate((element) => element.scrollWidth <= element.clientWidth),
    ).toBe(true);
    const [percentageBox, cardBox] = await Promise.all([
      trafficPercentage.boundingBox(),
      trafficCard.boundingBox(),
    ]);
    if (!percentageBox || !cardBox) throw new Error('Traffic percentage must be visible');
    expect(percentageBox.x).toBeGreaterThanOrEqual(cardBox.x);
    expect(percentageBox.x + percentageBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width);

    const manageSubscription = page.getByRole('button', { name: 'Manage subscription' });
    await expect(manageSubscription).toHaveCSS('border-top-width', '1px');
    await expect(manageSubscription).toHaveCSS('background-color', accentRgb);
    await expect(manageSubscription).toHaveCSS('color', onAccentColor);
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

for (const trial of [false, true]) {
  test(`expired ${trial ? 'trial' : 'paid subscription'} uses the active Dashboard button animation`, async ({
    page,
  }) => {
    const expired = {
      ...subscription,
      status: 'expired',
      is_trial: trial,
      is_expired: true,
      is_active: false,
      days_left: 0,
      subscription_url: null,
    };
    await prepareAuthenticatedPage(page, {
      language: 'ru',
      responses: {
        ...activeSubscriptionResponses,
        '/api/cabinet/subscription': { has_subscription: true, subscription: expired },
        '/api/cabinet/subscriptions': { subscriptions: [expired], multi_tariff_enabled: false },
      },
    });
    await page.goto('/');
    const banner = page.getByRole('region', {
      name: trial ? 'Пробный период истёк' : 'Подписка истекла',
      exact: true,
    });
    const action = banner.getByRole('button', {
      name: trial ? 'Управление подпиской' : 'Продлить',
      exact: true,
    });
    await expect(action).toBeVisible();
    // The spring writes transform each frame. A CSS transition on transform delays those updates.
    await expect(action).toHaveCSS('transition-property', 'box-shadow');
  });
}
