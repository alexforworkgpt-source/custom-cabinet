import { expect, test, type Dialog, type Page } from '@playwright/test';
import type { UserDetailResponse, UserSubscriptionInfo } from '../../src/api/adminUsers';
import { browserTestUser, prepareAuthenticatedPage } from './cabinetTestHarness';

const adminUserId = 84_210;

const adminIdentity = {
  ...browserTestUser,
  id: 91_001,
  username: 'browser_admin',
  first_name: 'Browser Admin',
  email: 'browser-admin@example.test',
};

function makeSubscription(overrides: Partial<UserSubscriptionInfo> = {}): UserSubscriptionInfo {
  return {
    id: 70_001,
    status: 'trial',
    is_trial: true,
    start_date: '2026-08-01T00:00:00Z',
    end_date: '2026-08-08T00:00:00Z',
    traffic_limit_gb: 10,
    traffic_used_gb: 0,
    device_limit: 1,
    tariff_id: 701,
    tariff_name: 'Local Browser Trial',
    autopay_enabled: false,
    sbp_recurring_status: null,
    sbp_recurring_id: null,
    is_active: true,
    days_remaining: 7,
    purchased_traffic_gb: 0,
    traffic_purchases: [],
    ...overrides,
  };
}

function makeAdminUser(subscription: UserSubscriptionInfo): UserDetailResponse {
  return {
    id: adminUserId,
    telegram_id: 9_000_084_210,
    username: 'browser_test_target',
    first_name: 'Browser',
    last_name: 'Target',
    full_name: 'Browser Test Target',
    status: 'active',
    language: 'en',
    balance_kopeks: 0,
    balance_rubles: 0,
    email: 'browser-target@example.test',
    email_verified: true,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: null,
    last_activity: null,
    cabinet_last_login: null,
    subscription,
    subscriptions: [subscription],
    promo_group: null,
    referral: {
      referral_code: 'BROWSER_TARGET',
      referrals_count: 0,
      total_earnings_kopeks: 0,
      commission_percent: null,
      referred_by_id: null,
      referred_by_username: null,
    },
    total_spent_kopeks: 0,
    purchase_count: 0,
    used_promocodes: 0,
    has_had_paid_subscription: !subscription.is_trial,
    lifetime_used_traffic_bytes: 0,
    campaign_name: null,
    campaign_id: null,
    restriction_topup: false,
    restriction_subscription: false,
    restriction_reason: null,
    promo_offer_discount_percent: 0,
    promo_offer_discount_source: null,
    promo_offer_discount_expires_at: null,
    recent_transactions: [],
    remnawave_id: null,
  };
}

function adminUserResponses(subscription: UserSubscriptionInfo): Record<string, unknown> {
  return {
    [`/api/cabinet/admin/users/${adminUserId}`]: makeAdminUser(subscription),
    [`/api/cabinet/admin/users/${adminUserId}/referrals`]: {
      users: [],
      total: 0,
      offset: 0,
      limit: 50,
    },
    [`/api/cabinet/admin/users/${adminUserId}/panel-info`]: {
      found: false,
      trojan_password: null,
      vless_uuid: null,
      ss_password: null,
      subscription_url: null,
      happ_link: null,
      used_traffic_bytes: 0,
      lifetime_used_traffic_bytes: 0,
      traffic_limit_bytes: 0,
      first_connected_at: null,
      online_at: null,
      last_connected_node_uuid: null,
      last_connected_node_name: null,
    },
    [`/api/cabinet/admin/users/${adminUserId}/available-tariffs`]: {
      user_id: adminUserId,
      promo_group_id: null,
      promo_group_name: null,
      tariffs: [],
      total: 0,
      current_tariff_id: subscription.tariff_id,
      current_tariff_name: subscription.tariff_name,
    },
    [`/api/cabinet/admin/users/${adminUserId}/node-usage`]: {
      items: [],
      categories: [],
      period_days: 30,
    },
    [`/api/cabinet/admin/users/${adminUserId}/devices`]: {
      devices: [],
      total: 0,
      device_limit: subscription.device_limit,
    },
  };
}

async function prepareAdminPage(
  page: Page,
  permissions: string[],
  responses: Record<string, unknown>,
) {
  return prepareAuthenticatedPage(page, {
    user: adminIdentity,
    responses: {
      '/api/cabinet/auth/me/is-admin': { is_admin: true },
      '/api/cabinet/auth/me/permissions': {
        permissions,
        roles: ['browser_test_admin'],
        role_level: 100,
      },
      '/api/cabinet/admin/tickets/notifications/unread-count': { unread_count: 0 },
      ...responses,
    },
  });
}

async function openSubscriptionTab(page: Page, subscription: UserSubscriptionInfo) {
  await page.goto(`/admin/users/${adminUserId}`);
  await expect(page.getByText('Browser Test Target', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Subscription', exact: true }).click();
  await expect(
    page.getByText(subscription.tariff_name ?? `#${subscription.id}`).first(),
  ).toBeVisible();
}

async function confirmOrdinarySubscriptionDelete(page: Page) {
  const deleteButton = page.getByRole('button', { name: 'Delete subscription', exact: true });
  const deleteButtonBox = await deleteButton.boundingBox();
  expect(deleteButtonBox?.width).toBeGreaterThanOrEqual(44);
  expect(deleteButtonBox?.height).toBeGreaterThanOrEqual(44);
  await deleteButton.click();
  const inlineConfirmation = page.getByRole('button', { name: 'Are you sure?', exact: true });
  await expect(inlineConfirmation).toBeVisible();
  await inlineConfirmation.click();
}

test('resets admin user pagination when sorting by subscription end date @desktop-flow', async ({
  page,
}) => {
  const listRequests: URL[] = [];
  const { unexpectedApiRequests } = await prepareAdminPage(page, ['users:read'], {
    '/api/cabinet/admin/users/stats': {
      total_users: 45,
      active_users: 45,
      blocked_users: 0,
      new_today: 0,
      users_with_active_subscription: 0,
    },
  });
  await page.route('**/api/cabinet/admin/users**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() !== 'GET' || url.pathname !== '/api/cabinet/admin/users') {
      await route.fallback();
      return;
    }

    listRequests.push(url);
    await route.fulfill({
      status: 200,
      json: {
        users: [],
        total: 45,
        offset: Number(url.searchParams.get('offset') ?? 0),
        limit: 20,
      },
    });
  });

  await page.goto('/admin/users');
  await expect(page.getByText('1 / 3', { exact: true })).toBeVisible();
  await page.getByText('1 / 3', { exact: true }).locator('..').getByRole('button').last().click();
  await expect(page.getByText('2 / 3', { exact: true })).toBeVisible();

  const sortSelect = page.locator('select').filter({
    has: page.locator('option[value="subscription_end_date"]'),
  });
  await sortSelect.selectOption('subscription_end_date');

  await expect(page.getByText('1 / 3', { exact: true })).toBeVisible();
  await expect
    .poll(() => listRequests[listRequests.length - 1]?.searchParams.get('sort_by'))
    .toBe('subscription_end_date');
  const sortedRequest = listRequests[listRequests.length - 1];
  expect(sortedRequest.searchParams.get('offset')).toBe('0');
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('deletes a trial subscription without force @desktop-flow', async ({ page }) => {
  const subscription = makeSubscription();
  const deleteRequests: URL[] = [];
  const { unexpectedApiRequests } = await prepareAdminPage(
    page,
    ['users:read', 'users:subscription'],
    adminUserResponses(subscription),
  );
  await page.route(
    `**/api/cabinet/admin/users/${adminUserId}/subscriptions/${subscription.id}**`,
    async (route) => {
      if (route.request().method() !== 'DELETE') {
        await route.fallback();
        return;
      }
      deleteRequests.push(new URL(route.request().url()));
      await route.fulfill({ status: 200, json: { status: 'deleted' } });
    },
  );

  await openSubscriptionTab(page, subscription);
  await confirmOrdinarySubscriptionDelete(page);

  await expect.poll(() => deleteRequests.length).toBe(1);
  expect(deleteRequests[0].searchParams.has('force')).toBe(false);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('forces paid subscription deletion only after a separate destructive confirmation @desktop-flow', async ({
  page,
}) => {
  const subscription = makeSubscription({
    id: 70_002,
    status: 'active',
    is_trial: false,
    tariff_id: 702,
    tariff_name: 'Local Paid Annual',
    end_date: '2027-08-01T00:00:00Z',
    days_remaining: 365,
    device_limit: 3,
  });
  const deleteRequests: URL[] = [];
  const flowEvents: string[] = [];
  let destructiveWarning = '';
  const { unexpectedApiRequests } = await prepareAdminPage(
    page,
    ['users:read', 'users:subscription'],
    adminUserResponses(subscription),
  );
  await page.route(
    `**/api/cabinet/admin/users/${adminUserId}/subscriptions/${subscription.id}**`,
    async (route) => {
      if (route.request().method() !== 'DELETE') {
        await route.fallback();
        return;
      }

      const url = new URL(route.request().url());
      deleteRequests.push(url);
      flowEvents.push('forced-delete');
      await route.fulfill({ status: 200, json: { status: 'deleted' } });
    },
  );

  await openSubscriptionTab(page, subscription);
  const destructiveDialog = new Promise<Dialog>((resolve) => {
    page.once('dialog', (dialog) => {
      destructiveWarning = dialog.message();
      flowEvents.push('destructive-shown');
      resolve(dialog);
    });
  });
  const clickDelete = page
    .getByRole('button', { name: 'Delete subscription', exact: true })
    .click();
  const confirmation = await destructiveDialog;
  expect(deleteRequests).toHaveLength(0);
  flowEvents.push('destructive-confirmed');
  await confirmation.accept();
  await clickDelete;

  await expect.poll(() => deleteRequests.length).toBe(1);
  expect(deleteRequests[0].searchParams.get('force')).toBe('true');
  expect(destructiveWarning).toContain('Local Paid Annual');
  expect(destructiveWarning).toContain('permanently deleted');
  expect(destructiveWarning).toContain('automatic payments');
  expect(flowEvents).toEqual(['destructive-shown', 'destructive-confirmed', 'forced-delete']);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('hides subscription deletion without the subscription permission @desktop-flow', async ({
  page,
}) => {
  const subscription = makeSubscription();
  const { unexpectedApiRequests } = await prepareAdminPage(
    page,
    ['users:read'],
    adminUserResponses(subscription),
  );

  await openSubscriptionTab(page, subscription);

  await expect(page.getByRole('button', { name: 'Delete subscription', exact: true })).toHaveCount(
    0,
  );
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('shows subscription deletion errors for conflict and missing records @desktop-flow', async ({
  page,
}) => {
  const subscription = makeSubscription();
  const statuses = [409, 404];
  const { unexpectedApiRequests } = await prepareAdminPage(
    page,
    ['users:read', 'users:subscription'],
    adminUserResponses(subscription),
  );
  await page.route(
    `**/api/cabinet/admin/users/${adminUserId}/subscriptions/${subscription.id}**`,
    async (route) => {
      if (route.request().method() !== 'DELETE') {
        await route.fallback();
        return;
      }

      const status = statuses.shift();
      if (status === 409) {
        await route.fulfill({
          status,
          json: { detail: 'Active subscription requires force deletion' },
        });
        return;
      }
      await route.fulfill({ status: status ?? 500, json: {} });
    },
  );

  await openSubscriptionTab(page, subscription);
  await confirmOrdinarySubscriptionDelete(page);
  await expect(page.getByText('Active subscription requires force deletion')).toBeVisible();

  await confirmOrdinarySubscriptionDelete(page);
  await expect(
    page.getByText('The subscription was not found or has already been deleted'),
  ).toBeVisible();
  expect(statuses).toEqual([]);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('connects traffic-only validation and sends the traffic payload @desktop-flow', async ({
  page,
}) => {
  let createPayload: Record<string, unknown> | undefined;
  const { unexpectedApiRequests } = await prepareAdminPage(page, ['promocodes:read'], {
    '/api/cabinet/admin/promo-groups': { items: [], total: 0, limit: 100, offset: 0 },
    '/api/cabinet/admin/promocodes': { items: [], total: 0, limit: 100, offset: 0 },
  });
  await page.route('**/api/cabinet/admin/promocodes', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.fallback();
      return;
    }

    createPayload = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 201,
      json: {
        id: 80_001,
        ...createPayload,
        balance_bonus_rubles: 0,
        current_uses: 0,
        uses_left: 1,
        is_valid: true,
        valid_from: '2026-08-23T00:00:00Z',
        tariff_id: null,
        tariff_name: null,
        created_by: adminIdentity.id,
        created_at: '2026-08-23T00:00:00Z',
        updated_at: '2026-08-23T00:00:00Z',
      },
    });
  });

  await page.goto('/admin/promocodes/create');
  await expect(page.getByRole('heading', { name: 'New promo code' })).toBeVisible();
  await page.getByRole('switch', { name: 'Balance bonus' }).click();
  await page.getByRole('switch', { name: 'Traffic' }).click();
  await page.locator('#pc-code').fill('traffic_only_25');

  const trafficInput = page.locator('#pc-traffic-gb');
  const saveButton = page.getByRole('button', { name: 'Save', exact: true });
  await expect(trafficInput).toHaveAttribute('aria-invalid', 'true');
  await expect(trafficInput).toHaveAttribute('aria-describedby', 'pc-traffic-gb-error');
  await expect(page.locator('#pc-traffic-gb-error')).toHaveText(
    'Traffic amount must be greater than 0',
  );
  await expect(saveButton).toBeDisabled();

  await trafficInput.fill('25');
  await expect(trafficInput).toHaveAttribute('aria-invalid', 'false');
  await expect(trafficInput).not.toHaveAttribute('aria-describedby', /.+/);
  await expect(page.locator('#pc-traffic-gb-error')).toHaveCount(0);
  await expect(saveButton).toBeEnabled();
  await saveButton.click();

  await expect(page).toHaveURL('/admin/promocodes');
  expect(createPayload).toMatchObject({
    code: 'TRAFFIC_ONLY_25',
    type: 'balance_and_days',
    traffic_gb: 25,
    balance_bonus_kopeks: 0,
    subscription_days: 0,
    promo_group_id: null,
  });
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('loads and updates traffic in an existing promocode @desktop-flow', async ({ page }) => {
  const promocodeId = 80_002;
  let updatePayload: Record<string, unknown> | undefined;
  const existingPromocode = {
    id: promocodeId,
    code: 'MIXED_TRAFFIC_20',
    type: 'balance_and_days',
    balance_bonus_kopeks: 10_000,
    balance_bonus_rubles: 100,
    subscription_days: 7,
    traffic_gb: 20,
    max_uses: 50,
    current_uses: 2,
    uses_left: 48,
    is_active: true,
    is_valid: true,
    first_purchase_only: false,
    valid_from: '2026-08-01T00:00:00Z',
    valid_until: null,
    promo_group_id: null,
    tariff_id: null,
    tariff_name: null,
    created_by: adminIdentity.id,
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-01T00:00:00Z',
    total_uses: 2,
    today_uses: 0,
    recent_uses: [],
  };
  const { unexpectedApiRequests } = await prepareAdminPage(page, ['promocodes:read'], {
    '/api/cabinet/admin/promo-groups': { items: [], total: 0, limit: 100, offset: 0 },
    '/api/cabinet/admin/promocodes': { items: [], total: 0, limit: 100, offset: 0 },
    [`/api/cabinet/admin/promocodes/${promocodeId}`]: existingPromocode,
  });
  await page.route(`**/api/cabinet/admin/promocodes/${promocodeId}`, async (route) => {
    if (route.request().method() !== 'PATCH') {
      await route.fallback();
      return;
    }

    updatePayload = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({ status: 200, json: { ...existingPromocode, ...updatePayload } });
  });

  await page.goto(`/admin/promocodes/${promocodeId}/edit`);
  await expect(page.getByRole('heading', { name: 'Edit promo code' })).toBeVisible();
  await expect(page.locator('#pc-code')).toHaveValue('MIXED_TRAFFIC_20');
  await expect(page.getByRole('switch', { name: 'Traffic' })).toBeChecked();
  await expect(page.locator('#pc-traffic-gb')).toHaveValue('20');

  await page.locator('#pc-traffic-gb').fill('35');
  await page.getByRole('button', { name: 'Save', exact: true }).click();

  await expect(page).toHaveURL('/admin/promocodes');
  expect(updatePayload).toMatchObject({
    code: 'MIXED_TRAFFIC_20',
    type: 'balance_and_days',
    traffic_gb: 35,
    balance_bonus_kopeks: 10_000,
    subscription_days: 7,
  });
  expect([...unexpectedApiRequests]).toEqual([]);
});
