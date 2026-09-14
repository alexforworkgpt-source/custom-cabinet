import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

const activeSubscription = {
  id: 1,
  status: 'active',
  is_trial: false,
  start_date: '2026-08-01T00:00:00Z',
  end_date: '2026-09-15T00:00:00Z',
  days_left: 5,
  hours_left: 0,
  minutes_left: 0,
  time_left_display: '5 days',
  traffic_limit_gb: 100,
  traffic_used_gb: 25,
  traffic_used_percent: 25,
  device_limit: 3,
  connected_squads: [],
  servers: [],
  autopay_enabled: false,
  autopay_days_before: 0,
  subscription_url: 'https://subscription.example.test/issue-06',
  hide_subscription_link: false,
  is_active: true,
  is_expired: false,
  is_limited: false,
  tariff_id: 10,
  tariff_name: 'Standard',
};

const devicesResponse = {
  devices: [],
  total: 0,
  device_limit: 3,
};

const purchaseOptions = {
  sales_mode: 'classic',
  periods: [],
  balance_kopeks: 100_000,
  balance_label: '1,000 RUB',
};

function mobileOnly(testInfo: TestInfo) {
  test.skip(
    !['mobile-320', 'mobile-375'].includes(testInfo.project.name),
    'Issue 06 verifies the requested 320px and 375px mobile widths',
  );
}

async function prepareSubscription(page: Page, subscription = activeSubscription) {
  return prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/subscription': { has_subscription: true, subscription },
      '/api/cabinet/subscriptions': {
        subscriptions: [subscription],
        multi_tariff_enabled: false,
      },
      '/api/cabinet/subscription/devices': devicesResponse,
      '/api/cabinet/subscription/refresh-traffic': {
        success: true,
        cached: false,
        traffic_used_bytes: 25_000_000_000,
        traffic_used_gb: subscription.traffic_used_gb,
        traffic_limit_bytes: 100_000_000_000,
        traffic_limit_gb: 100,
        traffic_used_percent: subscription.traffic_used_percent,
        is_unlimited: false,
      },
      '/api/cabinet/subscription/purchase-options': purchaseOptions,
      '/api/cabinet/subscription/platega-recurrent': { status: 'none' },
      '/api/cabinet/subscription/lava-recurrent': { status: 'none' },
      '/api/cabinet/subscription/devices/price': {
        available: false,
        reason_code: 'max_devices_reached',
        reason: 'INTERNAL_DEVICE_LIMIT_DETAIL',
        max_device_limit: 3,
      },
      '/api/cabinet/subscription/devices/reduction-info': {
        available: false,
        reason_code: 'brand_new_internal_code',
        reason: 'SQLSTATE_INTERNAL_DEVICE_DETAIL',
        current_device_limit: 3,
        min_device_limit: 1,
        can_reduce: 2,
        connected_devices_count: 0,
      },
    },
  });
}

async function expectNoHorizontalOverflow(page: Page) {
  expect(
    await page.evaluate(() => ({
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    })),
  ).toEqual(
    expect.objectContaining({
      documentWidth: await page.evaluate(() => window.innerWidth),
    }),
  );
}

async function expectDateBelowLabel(page: Page, labelText: string) {
  const label = page.getByText(labelText, { exact: true });
  const date = label.locator('xpath=following-sibling::*[1]');
  const labelBox = await label.boundingBox();
  const dateBox = await date.boundingBox();
  if (!labelBox || !dateBox) throw new Error(`Missing date geometry for ${labelText}`);
  expect(dateBox.y).toBeGreaterThanOrEqual(labelBox.y + labelBox.height - 1);
}

test('uses localized device reason codes and hides raw API details on mobile', async ({
  page,
}, testInfo) => {
  mobileOnly(testInfo);
  const { unexpectedApiRequests } = await prepareSubscription(page);

  await page.goto('/subscriptions/1?section=additional-options');
  const panel = page.locator('#subscription-additional-options-panel');
  await expect(panel).toBeVisible();

  await panel.getByRole('button', { name: 'Buy more devices' }).click();
  await expect(panel.getByText('Device limit reached (3)', { exact: true })).toBeVisible();
  await expect(panel).not.toContainText('INTERNAL_DEVICE_LIMIT_DETAIL');
  await panel.getByRole('button', { name: 'Close' }).click();

  await panel.getByRole('button', { name: 'Reduce devices' }).click();
  await expect(panel.getByText('Device reduction is not available', { exact: true })).toBeVisible();
  await expect(panel).not.toContainText('SQLSTATE_INTERNAL_DEVICE_DETAIL');
  await expectNoHorizontalOverflow(page);
  expect([...unexpectedApiRequests]).toEqual([]);
});

for (const scenario of [
  { name: 'active', subscription: activeSubscription, dateLabel: null },
  {
    name: 'limited',
    subscription: {
      ...activeSubscription,
      status: 'limited',
      is_limited: true,
      traffic_used_gb: 100,
      traffic_used_percent: 100,
    },
    dateLabel: 'Active until',
  },
  {
    name: 'expired',
    subscription: {
      ...activeSubscription,
      status: 'expired',
      end_date: '2026-09-01T00:00:00Z',
      days_left: 0,
      is_active: false,
      is_expired: true,
    },
    dateLabel: 'Expired',
  },
] as const) {
  test(`keeps the ${scenario.name} subscription date readable on mobile`, async ({
    page,
  }, testInfo) => {
    mobileOnly(testInfo);
    const { unexpectedApiRequests } = await prepareSubscription(page, scenario.subscription);

    await page.goto('/');
    if (scenario.dateLabel) {
      await expectDateBelowLabel(page, scenario.dateLabel);
    } else {
      const tariff = page.getByText('Standard', { exact: true });
      const date = page.getByText(/^until /);
      const tariffBox = await tariff.boundingBox();
      const dateBox = await date.boundingBox();
      if (!tariffBox || !dateBox) throw new Error('Missing active subscription date geometry');
      expect(dateBox.y).toBeGreaterThanOrEqual(tariffBox.y + tariffBox.height - 1);
    }

    await expect(page.getByRole('button', { name: 'Manage Subscription' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expect([...unexpectedApiRequests]).toEqual([]);
  });
}
