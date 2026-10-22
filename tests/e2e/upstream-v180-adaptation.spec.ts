import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses as renewalResponses, subscription } from './classicRenewalFixture';

test('legal documents reload their server language without losing the return link', async ({
  page,
}) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page);
  const languages: string[] = [];
  await page.route('**/api/cabinet/info/privacy-policy**', async (route) => {
    const language = new URL(route.request().url()).searchParams.get('language') ?? '';
    languages.push(language);
    await route.fulfill({
      json: { content: `<p>Document language: ${language}</p>`, updated_at: null },
    });
  });
  await page.goto('/privacy');
  await expect(page.getByText('Document language: en')).toBeVisible();
  await page.locator('[data-language-switcher] button').first().click();
  await page.getByRole('menuitemradio', { name: /Русский/ }).click();
  await expect(page.getByText('Document language: ru')).toBeVisible();
  await expect(page.getByText('Document language: en')).toHaveCount(0);
  expect(languages).toEqual(['en', 'ru']);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('audience preview uses the existing responsive overlay and restores keyboard focus', async ({
  page,
}, testInfo) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/auth/me/is-admin': { is_admin: true },
      '/api/cabinet/admin/tickets/notifications/unread-count': { unread_count: 0 },
      '/api/cabinet/auth/me/permissions': {
        permissions: ['broadcasts:read', 'broadcasts:create', 'users:read'],
        roles: [],
        role_level: 100,
      },
      '/api/cabinet/admin/broadcasts/filters': {
        filters: [],
        tariff_filters: [],
        custom_filters: [],
      },
      '/api/cabinet/admin/broadcasts/buttons': { buttons: [] },
      '/api/cabinet/admin/broadcasts/audience/users': {
        count: 1,
        offset: 0,
        limit: 20,
        users: [
          {
            id: 42,
            username: 'recipient',
            first_name: null,
            last_name: null,
            telegram_id: 9042,
            email: null,
          },
        ],
      },
      '/api/cabinet/admin/broadcasts/audience/preview': {
        count: 1,
        offset: 0,
        limit: 50,
        users: [
          {
            id: 42,
            username: 'recipient',
            first_name: null,
            last_name: null,
            telegram_id: 9042,
            email: null,
          },
        ],
      },
    },
  });
  await page.goto('/admin/broadcasts/create');
  await page.getByRole('combobox', { name: 'Field', exact: true }).selectOption('traffic_zero');
  const trigger = page.getByRole('button', { name: 'View list', exact: true });
  await expect(trigger).toBeVisible();
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('link', { name: /recipient/ })).toHaveAttribute(
    'href',
    '/admin/users/42',
  );
  await expect
    .poll(
      async () =>
        (await dialog.getByRole('link', { name: /recipient/ }).boundingBox())?.height ?? 0,
    )
    .toBeGreaterThanOrEqual(44);
  await expect(dialog.getByRole('button', { name: 'Next', exact: true })).toBeDisabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: testInfo.outputPath('audience-preview.png'), fullPage: true });
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await page.getByRole('combobox', { name: 'Field', exact: true }).selectOption('telegram_id');
  const lookup = page.getByRole('combobox', { name: 'Telegram ID', exact: true });
  await lookup.fill('9042');
  const result = page.getByRole('option', { name: /recipient.*9042/ });
  await expect(result).toBeVisible();
  expect((await result.boundingBox())?.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: testInfo.outputPath('audience-user-lookup.png'), fullPage: true });
  const selection = page.waitForRequest(
    (request) =>
      new URL(request.url()).pathname.endsWith('/audience/preview') &&
      request.postDataJSON()?.audience?.conditions[0]?.value === '42',
  );
  await lookup.press('Enter');
  await selection;
  await expect(lookup).toHaveValue(/9042/);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('Cashera QR preserves the payment and waits for an explicit external-link action', async ({
  page,
}, testInfo) => {
  const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      ...renewalResponses,
      '/api/cabinet/balance/payment-methods': [
        {
          id: 'cashera',
          name: 'Cashera',
          min_amount_kopeks: 10000,
          max_amount_kopeks: 100000,
          is_available: true,
          quick_amounts: [],
          open_url_direct: true,
        },
      ],
      '/api/cabinet/balance/topup': {
        payment_id: '42',
        payment_url: 'https://payments.example.test/42',
        qr_payload: 'https://qr.example.test/42',
        amount_kopeks: 30000,
        amount_rubles: 300,
        status: 'pending',
        expires_at: null,
      },
      '/api/cabinet/balance/pending-payments/cashera/42': {
        id: 42,
        is_paid: false,
        status: 'pending',
        amount_kopeks: 30000,
      },
    },
  });
  const popups: string[] = [];
  page.on('popup', (popup) => popups.push(popup.url()));
  await page.goto('/balance/top-up/cashera?amount=300&returnTo=%2Fsubscriptions%2F42');
  await page.getByRole('button', { name: 'Top Up', exact: true }).click();
  await expect(page.getByRole('img', { name: /QR/ })).toBeVisible();
  await expect(page.getByText('Payment link is ready')).toBeVisible();
  expect(popups).toEqual([]);
  expect(await page.evaluate(() => sessionStorage.getItem('topup_pending_payment'))).toContain(
    '42',
  );
  await page.getByRole('dialog').screenshot({ path: testInfo.outputPath('cashera-qr.png') });
  await expect(page.getByRole('img', { name: /QR/ })).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page).toHaveURL('/subscriptions/42');
  expect(
    apiRequests.filter((request) => request === 'POST /api/cabinet/balance/topup'),
  ).toHaveLength(1);
  expect(apiRequests.some((request) => /^POST .*\/purchase/.test(request))).toBe(false);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('Cashera management displays server RUB charges and cancels the same subscription ID', async ({
  page,
}, testInfo) => {
  const current = {
    ...subscription,
    tariff_id: 7,
    tariff_name: 'Basic',
    requires_tariff_selection: false,
  };
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      ...renewalResponses,
      '/api/cabinet/subscription': { has_subscription: true, subscription: current },
      '/api/cabinet/subscriptions': { subscriptions: [current], multi_tariff_enabled: false },
      '/api/cabinet/subscription/purchase-options': {
        ...renewalResponses['/api/cabinet/subscription/purchase-options'],
        cashera_recurrent_enabled: true,
      },
    },
  });
  let status = 'ACTIVE';
  const ids: (string | null)[] = [];
  await page.route(/\/api\/cabinet\/subscription\/cashera-recurrent(?:\?|$)/, async (route) => {
    ids.push(new URL(route.request().url()).searchParams.get('subscription_id'));
    await route.fulfill({
      json: {
        enabled: true,
        status,
        amount_kopeks: 12900,
        interval: 'month',
        next_charge_at: '2026-11-10T00:00:00Z',
        redirect_url: null,
      },
    });
  });
  let cancelledId: string | null = null;
  await page.route(
    /\/api\/cabinet\/subscription\/cashera-recurrent\/cancel(?:\?|$)/,
    async (route) => {
      cancelledId = new URL(route.request().url()).searchParams.get('subscription_id');
      status = 'NONE';
      await route.fulfill({ json: { status: 'cancelled' } });
    },
  );
  await page.goto('/subscriptions/42');
  await expect(
    page.getByRole('heading', { name: 'Additional options', exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/129.*₽/)).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('cashera-management.png'), fullPage: true });
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Turn off', exact: true }).click();
  await expect.poll(() => cancelledId).toBe('42');
  expect(ids.every((id) => id === '42')).toBe(true);
  expect([...unexpectedApiRequests]).toEqual([]);
});
