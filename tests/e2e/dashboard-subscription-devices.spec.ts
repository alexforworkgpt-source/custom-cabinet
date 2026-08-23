import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

const subscription = {
  id: 7,
  status: 'active',
  is_trial: false,
  start_date: '2026-08-01T00:00:00Z',
  end_date: '2026-10-15T00:00:00Z',
  days_left: 60,
  hours_left: 0,
  minutes_left: 0,
  time_left_display: '60 days',
  traffic_limit_gb: 100,
  traffic_used_gb: 10,
  traffic_used_percent: 10,
  device_limit: 3,
  connected_squads: [],
  servers: [],
  autopay_enabled: false,
  autopay_days_before: 0,
  subscription_url: 'https://example.test/subscription',
  hide_subscription_link: false,
  is_active: true,
  is_expired: false,
  is_limited: false,
  tariff_id: 10,
  tariff_name: 'Selected plan',
};

const commonResponses = {
  '/api/cabinet/subscription': { has_subscription: true, subscription },
  '/api/cabinet/subscriptions': {
    subscriptions: [subscription, { ...subscription, id: 8, tariff_name: 'Other plan' }],
    multi_tariff_enabled: true,
  },
  '/api/cabinet/subscription/refresh-traffic': {
    traffic_used_gb: 10,
    traffic_used_percent: 10,
    is_unlimited: false,
  },
  '/api/cabinet/subscription/connection-link': {
    subscription_url: subscription.subscription_url,
    display_link: subscription.subscription_url,
    connect_mode: 'plain',
    hide_link: false,
  },
};

for (const scenario of [
  { name: 'a free device slot', connectedDevices: 0, deviceAction: 'Connect Device' },
  { name: 'a full device limit', connectedDevices: 3, deviceAction: 'My Devices' },
]) {
  test(`keeps Buy Traffic and shows ${scenario.deviceAction} for limited subscription with ${scenario.name}`, async ({
    page,
  }) => {
    const limitedSubscription = {
      ...subscription,
      status: 'limited',
      is_limited: true,
      traffic_used_gb: 100,
      traffic_used_percent: 100,
    };
    const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
      responses: {
        ...commonResponses,
        '/api/cabinet/subscription': {
          has_subscription: true,
          subscription: limitedSubscription,
        },
        '/api/cabinet/subscriptions': {
          subscriptions: [limitedSubscription],
          multi_tariff_enabled: true,
        },
        '/api/cabinet/subscription/devices': {
          devices: [],
          total: scenario.connectedDevices,
          device_limit: subscription.device_limit,
        },
      },
    });

    await page.goto('/?sub=7');

    await expect(page.getByRole('button', { name: 'Buy Traffic' })).toBeVisible();
    const deviceAction = page.getByRole('button', {
      name: new RegExp(scenario.deviceAction),
    });
    await expect(deviceAction).toBeVisible();
    await expect(deviceAction).toContainText(
      `${scenario.connectedDevices} / ${subscription.device_limit}`,
    );
    expect([...unexpectedApiRequests]).toEqual([]);
  });
}

test('opens Connection for a free slot and restores focus to the selected subscription action', async ({
  page,
}) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      ...commonResponses,
      '/api/cabinet/subscription/devices': { devices: [], total: 0, device_limit: 3 },
      '/api/cabinet/subscription/app-config': {
        platformNames: { windows: { en: 'Windows' } },
        hasSubscription: true,
        subscriptionUrl: subscription.subscription_url,
        hideLink: false,
        baseSettings: { isShowTutorialButton: false, tutorialUrl: '' },
        uiConfig: { installationGuidesBlockType: 'cards' },
        platforms: {
          windows: {
            displayName: { en: 'Windows' },
            apps: [{ name: 'Test App', featured: true, blocks: [] }],
          },
        },
      },
    },
  });

  await page.goto('/?sub=7');
  const connect = page.getByRole('button', { name: /Connect Device/ });
  await connect.click();

  await expect(page).toHaveURL('/connection?sub=7');
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'Connect VPN' }),
  ).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page).toHaveURL('/?sub=7');
  await expect(connect).toBeFocused();
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('opens device management for a full limit and keeps delete, add-slots, Back, and focus', async ({
  page,
}) => {
  let currentDevices = Array.from({ length: 3 }, (_, index) => ({
    hwid: `device-${index}`,
    platform: 'Windows',
    device_model: `Laptop ${index + 1}`,
    created_at: '2026-08-01T00:00:00Z',
  }));
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      ...commonResponses,
      '/api/cabinet/subscription/devices': {
        devices: currentDevices,
        total: 3,
        device_limit: 3,
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
  await page.route('**/api/cabinet/subscription/devices**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const devicesPath = '/api/cabinet/subscription/devices';

    if (request.method() === 'GET' && url.pathname === devicesPath) {
      await route.fulfill({
        status: 200,
        json: { devices: currentDevices, total: currentDevices.length, device_limit: 3 },
      });
      return;
    }

    if (request.method() === 'DELETE' && url.pathname === `${devicesPath}/device-0`) {
      currentDevices = currentDevices.filter((device) => device.hwid !== 'device-0');
      await route.fulfill({
        status: 200,
        json: { success: true, message: 'Device deleted', deleted_hwid: 'device-0' },
      });
      return;
    }

    await route.fallback();
  });

  await page.goto('/?sub=7');
  const manageDevices = page.getByRole('button', { name: /My Devices/ });
  await expect(page.locator('button button')).toHaveCount(0);
  await manageDevices.click();

  await expect(page).toHaveURL('/?sub=7&overlay=devices');
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'My Devices' })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Delete device' })).toHaveCount(3);
  await expect(dialog.getByRole('button', { name: 'Buy more devices' })).toBeVisible();

  await page.goBack();
  await expect(page).toHaveURL('/?sub=7');
  await expect(manageDevices).toBeFocused();

  await manageDevices.click();
  await dialog.getByRole('button', { name: 'Buy more devices' }).click();
  await expect(page).toHaveURL('/subscriptions/7');
  const managementDialog = page.getByRole('dialog');
  await expect(
    managementDialog.getByRole('heading', { name: 'Manage subscription' }),
  ).toBeVisible();
  await expect(managementDialog.getByRole('button', { name: 'Additional Options' })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(page).toHaveURL('/?sub=7');
  await expect(manageDevices).toBeFocused();

  await manageDevices.click();
  await expect(page).toHaveURL('/?sub=7&overlay=devices');
  await expect(dialog.getByRole('button', { name: 'Delete device' })).toHaveCount(3);

  const confirmation = new Promise<string>((resolve) => {
    page.once('dialog', async (confirmationDialog) => {
      const message = confirmationDialog.message();
      await confirmationDialog.accept();
      resolve(message);
    });
  });
  const deleteResponsePromise = page.waitForResponse((response) => {
    const request = response.request();
    return (
      request.method() === 'DELETE' &&
      new URL(request.url()).pathname === '/api/cabinet/subscription/devices/device-0'
    );
  });

  await dialog.getByRole('button', { name: 'Delete device' }).first().click();
  await expect(confirmation).resolves.toBe('Delete this device?');
  const deleteResponse = await deleteResponsePromise;
  expect(deleteResponse.ok()).toBe(true);
  expect(new URL(deleteResponse.url()).searchParams.get('subscription_id')).toBe('7');
  await expect(dialog.getByText('Laptop 1', { exact: true })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'Delete device' })).toHaveCount(2);
  await expect(dialog.getByText('2 / 3')).toBeVisible();
  expect([...unexpectedApiRequests]).toEqual([]);
});
