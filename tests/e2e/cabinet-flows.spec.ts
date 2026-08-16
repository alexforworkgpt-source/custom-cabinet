import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

const activeSubscription = {
  id: 1,
  status: 'active',
  is_trial: false,
  start_date: '2026-08-01T00:00:00Z',
  end_date: '2026-09-15T00:00:00Z',
  days_left: 30,
  hours_left: 0,
  minutes_left: 0,
  time_left_display: '30 days',
  traffic_limit_gb: 100,
  traffic_used_gb: 25,
  traffic_used_percent: 25,
  device_limit: 3,
  connected_squads: [],
  servers: [],
  autopay_enabled: false,
  autopay_days_before: 0,
  subscription_url: 'https://subscription.example.test/browser-test',
  hide_subscription_link: false,
  is_active: true,
  is_expired: false,
  is_limited: false,
  tariff_id: 10,
  tariff_name: 'Standard',
};

const secondSubscription = {
  ...activeSubscription,
  id: 2,
  tariff_id: 20,
  tariff_name: 'Family',
};

const devicesResponse = {
  devices: [
    {
      hwid: 'device-12345678',
      platform: 'Windows',
      device_model: 'Test Laptop',
      created_at: '2026-08-01T00:00:00Z',
      local_name: 'Home laptop',
    },
  ],
  total: 1,
  device_limit: 3,
};

const trafficResponse = {
  success: true,
  cached: false,
  traffic_used_bytes: 25_000_000_000,
  traffic_used_gb: 25,
  traffic_limit_bytes: 100_000_000_000,
  traffic_limit_gb: 100,
  traffic_used_percent: 25,
  is_unlimited: false,
};

const connectionResponses = {
  '/api/cabinet/subscription/app-config': {
    platformNames: { windows: { en: 'Windows' }, android: { en: 'Android' } },
    hasSubscription: true,
    subscriptionUrl: activeSubscription.subscription_url,
    hideLink: false,
    baseSettings: { isShowTutorialButton: false, tutorialUrl: '' },
    uiConfig: { installationGuidesBlockType: 'cards' },
    platforms: {
      windows: {
        displayName: { en: 'Windows' },
        apps: [
          {
            name: 'Test App',
            featured: true,
            deepLink: 'testapp://import/{subscriptionUrl}',
            blocks: [
              {
                title: { en: 'Install Test App' },
                description: { en: 'Download and install Test App first.' },
                buttons: [
                  {
                    text: { en: 'Download Test App' },
                    type: 'external',
                    url: 'https://example.test/download',
                  },
                ],
              },
              {
                title: { en: 'Add subscription' },
                description: { en: 'Import the subscription into Test App.' },
                buttons: [
                  {
                    text: { en: 'Add to Test App' },
                    type: 'subscriptionLink',
                  },
                ],
              },
              {
                title: { en: 'Connection ready' },
                description: { en: 'Turn on the VPN in Test App.' },
              },
            ],
          },
          {
            name: 'Alternative App',
            deepLink: 'alternative://import/{subscriptionUrl}',
            blocks: [
              {
                title: { en: 'Install Alternative App' },
                description: { en: 'Install the alternative app.' },
                buttons: [
                  {
                    text: { en: 'Download Alternative App' },
                    type: 'external',
                    url: 'https://example.test/alternative',
                  },
                  {
                    text: { en: 'Quick import Alternative' },
                    type: 'subscriptionLink',
                  },
                ],
              },
              {
                title: { en: 'Add subscription' },
                description: { en: 'Import into Alternative App.' },
                buttons: [
                  {
                    text: { en: 'Add to Alternative App' },
                    type: 'subscriptionLink',
                  },
                  {
                    text: { en: 'Alternative mirror' },
                    type: 'external',
                    url: 'https://example.test/alternative-mirror',
                  },
                ],
              },
            ],
          },
        ],
      },
      android: {
        displayName: { en: 'Android' },
        apps: [
          {
            name: 'Mobile App',
            deepLink: 'mobileapp://import/{subscriptionUrl}',
            blocks: [],
          },
        ],
      },
    },
  },
  '/api/cabinet/subscription/connection-link': {
    subscription_url: activeSubscription.subscription_url,
    display_link: activeSubscription.subscription_url,
    happ_redirect_link: null,
    happ_scheme_link: null,
    connect_mode: 'plain',
    hide_link: false,
    instructions: { steps: [] },
  },
};

const activeResponses = {
  '/api/cabinet/subscription': { has_subscription: true, subscription: activeSubscription },
  '/api/cabinet/subscriptions': {
    subscriptions: [activeSubscription],
    multi_tariff_enabled: false,
  },
  '/api/cabinet/subscription/devices': devicesResponse,
  '/api/cabinet/subscription/refresh-traffic': trafficResponse,
};

test.describe('unified dashboard states', () => {
  const scenarios = [
    {
      name: 'trial',
      responses: {
        '/api/cabinet/subscription/trial': {
          is_available: true,
          duration_days: 7,
          traffic_limit_gb: 10,
          device_limit: 1,
          requires_payment: false,
          price_kopeks: 0,
          price_rubles: 0,
          reason_unavailable: null,
        },
      },
      heading: 'Free Trial Available',
    },
    {
      name: 'active single subscription',
      responses: activeResponses,
      heading: 'Traffic Usage',
    },
    {
      name: 'active trial subscription',
      responses: {
        ...activeResponses,
        '/api/cabinet/subscription': {
          has_subscription: true,
          subscription: { ...activeSubscription, is_trial: true, tariff_name: 'Trial' },
        },
      },
      heading: 'Traffic Usage',
      visibleText: 'Trial',
    },
    {
      name: 'limited subscription',
      responses: {
        ...activeResponses,
        '/api/cabinet/subscription': {
          has_subscription: true,
          subscription: {
            ...activeSubscription,
            status: 'limited',
            is_limited: true,
            traffic_used_gb: 100,
            traffic_used_percent: 100,
          },
        },
      },
      heading: 'Traffic Limit Reached',
    },
    {
      name: 'expired subscription',
      responses: {
        ...activeResponses,
        '/api/cabinet/subscription': {
          has_subscription: true,
          subscription: {
            ...activeSubscription,
            status: 'expired',
            is_active: false,
            is_expired: true,
            days_left: 0,
          },
        },
      },
      heading: 'Subscription Expired',
    },
  ];

  for (const scenario of scenarios) {
    test(`shows ${scenario.name} @desktop-flow`, async ({ page }) => {
      const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
        responses: scenario.responses,
      });

      await page.goto('/');
      await expect(page.getByRole('heading', { name: scenario.heading })).toBeVisible();
      if (scenario.visibleText) {
        await expect(page.getByText(scenario.visibleText, { exact: true }).first()).toBeVisible();
      }
      await expect(page.locator('body')).not.toContainText('Locations');
      expect([...unexpectedApiRequests]).toEqual([]);
    });
  }

  test('selects between multiple subscriptions without a separate page @desktop-flow', async ({
    page,
  }) => {
    const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
      responses: {
        ...activeResponses,
        '/api/cabinet/subscriptions': {
          subscriptions: [activeSubscription, secondSubscription],
          multi_tariff_enabled: true,
        },
      },
    });

    await page.goto('/');
    const subscriptionSelector = page.getByLabel('Subscriptions');
    await expect(subscriptionSelector).toHaveCount(1);
    await subscriptionSelector.selectOption('2');
    await expect(page).toHaveURL('/?sub=2');
    await expect(page.getByRole('heading', { name: 'Traffic Usage' })).toBeVisible();
    expect([...unexpectedApiRequests]).toEqual([]);
  });
});

test('opens traffic top-up from the unified Dashboard @desktop-flow', async ({ page }) => {
  const limitedSubscription = {
    ...activeSubscription,
    status: 'limited',
    is_limited: true,
    traffic_used_gb: 100,
    traffic_used_percent: 100,
  };
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      ...activeResponses,
      '/api/cabinet/subscription': {
        has_subscription: true,
        subscription: limitedSubscription,
      },
      '/api/cabinet/subscription/purchase-options': {
        sales_mode: 'tariffs',
        tariffs: [],
        current_tariff_id: 10,
        balance_kopeks: 100_000,
        balance_label: '1,000 RUB',
      },
      '/api/cabinet/subscription/traffic-packages': [
        { gb: 50, price_kopeks: 10_000, price_rubles: 100, is_unlimited: false },
      ],
    },
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Buy Traffic' }).click();
  await expect(page.getByRole('heading', { name: 'Buy more traffic' })).toBeVisible();
  await expect(page.getByRole('button', { name: /50 GB/ })).toBeVisible();
  await page.getByRole('button', { name: 'Close' }).click();
  await expect(page.getByRole('button', { name: 'Buy Traffic' })).toBeFocused();
  await expect(page).toHaveURL('/');
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('manages Devices in an overlay and returns to the same dashboard context @critical-flow', async ({
  page,
}) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: activeResponses,
  });

  await page.goto('/?sub=1');
  const devicesButton = page.getByRole('button', { name: /My Devices/ });
  await devicesButton.focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/?sub=1&overlay=devices');

  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'My Devices' })).toBeVisible();
  expect(
    await page.evaluate(() =>
      document.querySelector('[role="dialog"]')?.contains(document.activeElement),
    ),
  ).toBe(true);
  await expect(dialog.getByText('1 / 3')).toBeVisible();
  await expect(dialog.getByText('Home laptop')).toBeVisible();
  const renameButton = dialog.getByRole('button', { name: 'Rename' });
  await renameButton.click();
  await dialog.getByRole('textbox', { name: 'Rename' }).fill('Temporary name');
  await dialog.getByRole('button', { name: 'Cancel' }).click();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL('/?sub=1');
  await expect(page.getByRole('heading', { name: 'Traffic Usage' })).toBeVisible();
  await expect(devicesButton).toBeFocused();
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('runs the Connection wizard with Back, reload fallback, and legacy entry @critical-flow', async ({
  page,
}, testInfo) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: { ...activeResponses, ...connectionResponses },
  });

  await page.goto('/connection?sub=1');
  const dialog = page.getByRole('dialog');
  const detectedPlatform = testInfo.project.name === 'mobile-320' ? 'Android' : 'Windows';
  const otherPlatform = detectedPlatform === 'Android' ? 'Windows' : 'Android';
  await expect(dialog.getByRole('heading', { name: `Set up ${detectedPlatform}` })).toBeVisible();
  await expect(dialog.getByRole('button', { name: otherPlatform, exact: true })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Choose another device' }).click();
  await expect(dialog.getByRole('button', { name: otherPlatform, exact: true })).toBeVisible();
  if (detectedPlatform === 'Android') {
    await dialog.getByRole('button', { name: 'Windows', exact: true }).click();
    await expect(dialog.getByRole('heading', { name: 'Set up Windows' })).toBeVisible();
  }
  await dialog.getByRole('button', { name: 'Continue with Windows' }).click();
  await expect(page).toHaveURL(/step=application/);
  await expect(dialog.getByRole('heading', { name: 'Install Test App', level: 2 })).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Install Test App', level: 2 })).toBeFocused();
  await expect(dialog.getByRole('link', { name: 'Download Test App' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Add to Test App' })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'App is installed' }).click();
  await expect(page).toHaveURL(/step=add/);
  await expect(dialog.getByRole('heading', { name: 'Add subscription', level: 2 })).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Add subscription', level: 2 })).toBeFocused();
  await expect(dialog.getByRole('button', { name: 'Add to Test App' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Subscription added' }).click();
  await expect(page).toHaveURL(/step=success/);
  await expect(
    dialog.getByRole('heading', { name: 'Subscription added successfully' }),
  ).toBeVisible();
  await expect(dialog.getByRole('heading', { name: 'Connection ready' })).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'Subscription added successfully' }),
  ).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Back' }).click();
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'Add subscription', level: 2 }),
  ).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Back' }).click();
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'Install Test App', level: 2 }),
  ).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Back' }).click();
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'Set up Windows' }),
  ).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Continue with Windows' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'App is installed' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Subscription added' }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Finish' }).click();
  await expect(page).toHaveURL('/?sub=1');
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('preserves an alternative app when moving back through Connection @critical-flow', async ({
  page,
}) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: { ...activeResponses, ...connectionResponses },
  });

  await page.goto('/connection?sub=1&step=application&platform=windows');
  const dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: 'Choose another app' }).click();
  await dialog.getByRole('button', { name: 'Alternative App' }).click();
  await expect(
    dialog.getByRole('heading', { name: 'Install Alternative App', level: 2 }),
  ).toBeVisible();
  await expect(
    dialog.getByRole('heading', { name: 'Install Alternative App', level: 2 }),
  ).toBeFocused();
  await expect(dialog.getByRole('link', { name: 'Alternative mirror' })).toBeVisible();
  await dialog.getByRole('button', { name: 'App is installed' }).click();
  await expect(dialog.getByRole('button', { name: 'Add to Alternative App' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Quick import Alternative' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Back' }).click();
  await expect(
    dialog.getByRole('heading', { name: 'Install Alternative App', level: 2 }),
  ).toBeVisible();

  await page.goto('/connection?sub=1&step=success&platform=windows&app=Unknown');
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'Set up Windows' }),
  ).toBeVisible();
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('keeps the Telegram Connection Back model inside the overlay @telegram-flow', async ({
  page,
}) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: { ...activeResponses, ...connectionResponses },
  });
  const launchParams = new URLSearchParams({
    sub: '1',
    tgWebAppVersion: '8.0',
    tgWebAppPlatform: 'android',
    tgWebAppThemeParams: JSON.stringify({ bg_color: '#000000' }),
  });

  await page.goto(`/connection?${launchParams.toString()}`);
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Set up Android' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Back' })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Continue with Android' }).click();
  await expect(dialog.getByRole('button', { name: 'Back' })).toBeVisible();
  await dialog.getByRole('button', { name: 'Back' }).click();
  await expect(dialog.getByRole('heading', { name: 'Set up Android' })).toBeVisible();
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('runs top-up method, amount, validation, cancellation, handoff, and result return @critical-flow', async ({
  page,
}) => {
  const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/balance/payment-methods': [
        {
          id: 'test-card',
          name: 'Test Card',
          description: 'Browser-test provider',
          min_amount_kopeks: 10_000,
          max_amount_kopeks: 100_000,
          is_available: true,
          quick_amounts: [10_000, 30_000, 50_000],
          open_url_direct: false,
        },
      ],
      '/api/cabinet/balance/topup': {
        payment_id: '42',
        payment_url: 'https://payments.example.test/42',
        amount_kopeks: 30_000,
        amount_rubles: 300,
        status: 'pending',
        expires_at: null,
      },
    },
  });

  await page.goto('/');
  await page.getByText('Balance', { exact: true }).click();
  let dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Select payment method' })).toBeVisible();
  await dialog.getByRole('button', { name: /Test Card/ }).click();
  await expect(page).toHaveURL('/balance/top-up/test-card');
  await page.goto('/');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(
    apiRequests.filter((request) => request === 'POST /api/cabinet/balance/topup'),
  ).toHaveLength(0);

  await page.getByText('Balance', { exact: true }).click();
  dialog = page.getByRole('dialog');
  await dialog.getByRole('button', { name: /Test Card/ }).click();
  const amountInput = dialog.getByLabel('Enter amount');
  await amountInput.fill('0.5');
  await dialog.getByRole('button', { name: 'Top Up' }).click();
  await expect(dialog.getByRole('alert')).toBeVisible();
  await amountInput.fill('3');
  await dialog.getByRole('button', { name: 'Top Up' }).dblclick();
  await expect(dialog.getByText('Payment link is ready')).toBeVisible();
  expect(
    apiRequests.filter((request) => request === 'POST /api/cabinet/balance/topup'),
  ).toHaveLength(1);

  await page.goto('/balance/top-up/result?status=success');
  await expect(page.getByRole('heading', { name: 'Balance Topped Up!' })).toBeVisible();
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('groups secondary functions in Profile and gates admin/features by capability @desktop-flow', async ({
  page,
}) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    featureFlags: {
      wheelEnabled: true,
      hasContests: true,
      hasPolls: true,
      giftEnabled: true,
    },
    responses: {
      '/api/cabinet/auth/me/is-admin': { is_admin: true },
      '/api/cabinet/branding/gift-enabled': { enabled: true },
      '/api/cabinet/contests/count': { count: 1 },
      '/api/cabinet/polls/count': { count: 1 },
      '/api/cabinet/wheel/config': { is_enabled: true },
    },
  });

  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Profile' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Preferences' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Information', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'More features' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Connected Accounts' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notification Settings' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Admin', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Fortune Wheel', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Contests', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Polls', exact: true })).toBeVisible();
  const themeButton = page.getByRole('button', { name: /Theme/ });
  await themeButton.click();
  await expect(themeButton).toContainText('Dark Theme');

  await page.getByRole('button', { name: 'Change language' }).click();
  await page.getByRole('button', { name: 'Русский' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await page.getByRole('button', { name: 'Change language' }).click();
  await page.getByRole('button', { name: 'English' }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  const logoutButton = page.getByRole('button', { name: 'Logout' });
  await expect(logoutButton).toBeVisible();
  expect([...unexpectedApiRequests]).toEqual([]);
  await logoutButton.click();
  await expect(page).toHaveURL('/login');
});

test('shows critical data errors instead of zero values @desktop-flow', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: activeResponses,
    responseStatuses: {
      '/api/cabinet/balance': 500,
      '/api/cabinet/subscription/devices': 500,
    },
  });

  await page.goto('/');
  await expect(page.getByText('Balance could not be loaded.')).toBeVisible();
  await expect(page.getByText('Device usage could not be loaded.')).toBeVisible();
  await expect(page.getByText('Unavailable', { exact: true }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /My Devices/ })).not.toContainText('0 / 3');
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('renews an expired subscription once through the observable flow @desktop-flow', async ({
  page,
}) => {
  const expiredSubscription = {
    ...activeSubscription,
    status: 'expired',
    is_active: false,
    is_expired: true,
    days_left: 0,
  };
  const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      ...activeResponses,
      '/api/cabinet/balance': { balance_kopeks: 100_000, balance_rubles: 1000 },
      '/api/cabinet/subscription': {
        has_subscription: true,
        subscription: expiredSubscription,
      },
      '/api/cabinet/subscription/renew': {
        message: 'Renewed in browser test',
        new_end_date: '2026-10-15T00:00:00Z',
        amount_paid_kopeks: 30_000,
      },
    },
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Quick Renew' }).click();
  await expect
    .poll(
      () =>
        apiRequests.filter((request) => request === 'POST /api/cabinet/subscription/renew').length,
    )
    .toBe(1);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('updates a deep-linked Support ticket without remounting the page @desktop-flow', async ({
  page,
}) => {
  const ticket = (id: number, title: string) => ({
    id,
    title,
    status: 'open',
    priority: 'normal',
    created_at: '2026-08-16T00:00:00Z',
    updated_at: '2026-08-16T00:00:00Z',
    closed_at: null,
    is_reply_blocked: false,
    messages: [],
  });
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/info/support-config': {
        tickets_enabled: true,
        support_type: 'tickets',
        support_url: null,
        support_username: null,
      },
      '/api/cabinet/tickets': { items: [], total: 0, page: 1, per_page: 20, pages: 0 },
      '/api/cabinet/tickets/1': ticket(1, 'First browser ticket'),
      '/api/cabinet/tickets/2': ticket(2, 'Second browser ticket'),
    },
  });

  await page.goto('/support?ticket=1');
  await expect(page.getByRole('heading', { name: 'First browser ticket' })).toBeVisible();
  await page.evaluate(() => {
    history.pushState({}, '', '/support?ticket=2');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.getByRole('heading', { name: 'Second browser ticket' })).toBeVisible();
  expect([...unexpectedApiRequests]).toEqual([]);
});
