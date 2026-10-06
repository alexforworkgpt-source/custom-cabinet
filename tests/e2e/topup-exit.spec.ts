import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

const method = {
  id: 'test-card',
  name: 'Test Card',
  min_amount_kopeks: 10_000,
  max_amount_kopeks: 100_000,
  is_available: true,
  quick_amounts: [30_000],
  open_url_direct: false,
};

test('before creating a payment, closing returns to method selection @critical-flow', async ({
  page,
}) => {
  await prepareAuthenticatedPage(page, {
    responses: { '/api/cabinet/balance/payment-methods': [method] },
  });
  await page.goto('/balance/top-up?amount=300');
  await page.getByRole('button', { name: /Test Card/ }).click();
  await expect(page.getByRole('button', { name: 'Top Up', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page).toHaveURL('/balance/top-up?amount=300');
});

for (const openDirect of [false, true]) {
  test(`Telegram Back exits a created payment (direct=${openDirect}) @telegram-flow`, async ({
    page,
  }) => {
    await prepareAuthenticatedPage(page, {
      responses: {
        '/api/cabinet/balance/payment-methods': [{ ...method, open_url_direct: openDirect }],
        '/api/cabinet/balance/topup': {
          payment_id: '42',
          payment_url: 'https://payments.example.test/42',
          amount_kopeks: 30_000,
          amount_rubles: 300,
          status: 'pending',
          expires_at: null,
        },
        '/api/cabinet/balance/pending-payments/test-card/42': {
          id: 42,
          is_paid: false,
          status: 'pending',
          amount_kopeks: 30_000,
        },
      },
    });
    await page.addInitScript(() => {
      Object.defineProperty(window, 'TelegramWebviewProxy', {
        configurable: true,
        value: { postEvent() {} },
      });
    });
    const launch = new URLSearchParams({
      tgWebAppData: new URLSearchParams({
        auth_date: '1787443200',
        hash: 'browser-test-hash',
        signature: 'browser-test-signature',
        user: JSON.stringify({ id: 1, first_name: 'Browser', language_code: 'en' }),
      }).toString(),
      tgWebAppPlatform: 'tdesktop',
      tgWebAppVersion: '8.0',
      tgWebAppThemeParams: JSON.stringify({ bg_color: '#111827', text_color: '#f9fafb' }),
    });
    const returnTo = openDirect ? '/balance' : '/profile';
    await page.goto(
      `/balance/top-up/test-card?amount=300&returnTo=${encodeURIComponent(returnTo)}#${launch}`,
    );
    await page.getByRole('button', { name: 'Top Up', exact: true }).click();
    await expect(page.getByText('Payment link is ready')).toBeVisible();
    await page.evaluate(() => {
      const host = window as typeof window & {
        Telegram?: { WebView?: { receiveEvent: (event: string) => void } };
      };
      host.Telegram?.WebView?.receiveEvent('back_button_pressed');
    });
    await expect(page).toHaveURL(openDirect ? '/' : '/profile');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(
      await page.evaluate(() => sessionStorage.getItem('topup_pending_payment')),
    ).not.toBeNull();
  });
}

test('status failure does not block closing or claim that payment succeeded @critical-flow', async ({
  page,
}) => {
  await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/balance/payment-methods': [method],
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
  let checks = 0;
  await page.route('**/api/cabinet/balance/pending-payments/test-card/42', async (route) => {
    checks += 1;
    await route.fulfill({ status: 503, json: { detail: 'Temporarily unavailable' } });
  });
  await page.goto('/balance/top-up/test-card?amount=300&returnTo=https%3A%2F%2Fexample.test');
  await page.getByRole('button', { name: 'Top Up', exact: true }).click();
  await expect(page.getByText('Payment link is ready')).toBeVisible();
  await expect.poll(() => checks).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page).toHaveURL('/');
  expect(await page.evaluate(() => sessionStorage.getItem('topup_pending_payment'))).not.toBeNull();
  await expect(page.getByText('Balance topped up!', { exact: true })).toHaveCount(0);
});

test('closing a ready payment from Balance closes all overlays and preserves the pending payment @critical-flow', async ({
  page,
}) => {
  const { apiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/balance/payment-methods': [method],
      '/api/cabinet/balance/topup': {
        payment_id: '42',
        payment_url: 'https://payments.example.test/42',
        amount_kopeks: 30_000,
        amount_rubles: 300,
        status: 'pending',
        expires_at: null,
      },
      '/api/cabinet/balance/pending-payments/test-card/42': {
        id: 42,
        is_paid: false,
        status: 'pending',
        amount_kopeks: 30_000,
      },
    },
  });
  await page.goto('/');
  await page.getByText('Balance', { exact: true }).click();
  await page.getByRole('link', { name: 'Top Up Balance' }).click();
  await page.getByRole('button', { name: /Test Card/ }).click();
  await page.getByRole('button', { name: '3 $', exact: true }).click();
  await page.getByRole('button', { name: 'Top Up', exact: true }).click();
  await expect(page.getByText('Payment link is ready')).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(
    await page.evaluate(() =>
      JSON.parse(sessionStorage.getItem('topup_pending_payment') || 'null'),
    ),
  ).toMatchObject({ payment_id: '42', amount_kopeks: 30_000 });
  expect(
    apiRequests.filter((request) => request === 'POST /api/cabinet/balance/topup'),
  ).toHaveLength(1);
});

test('provider result keeps the original return page after confirmation @critical-flow', async ({
  page,
}) => {
  await prepareAuthenticatedPage(page);
  await page.goto('/profile');
  await page.evaluate(() => {
    sessionStorage.setItem(
      'topup_pending_payment',
      JSON.stringify({
        payment_id: '42',
        method_id: 'test-card',
        method_name: 'Test Card',
        amount_kopeks: 30_000,
        created_at: Date.now(),
        returnTo: '/profile',
      }),
    );
  });
  await page.goto('/balance/top-up/result?status=success');
  await expect(page.getByRole('heading', { name: 'Balance Topped Up!' })).toBeVisible();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL('/profile');
});

test('confirmation updates Balance and returns to the original page without another payment @critical-flow', async ({
  page,
}) => {
  const { apiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/balance/payment-methods': [method],
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
  let paid = false;
  let checks = 0;
  await page.route('**/api/cabinet/balance/pending-payments/test-card/42', async (route) => {
    checks += 1;
    await route.fulfill({
      json: { id: 42, amount_kopeks: 30_000, is_paid: paid, status: paid ? 'paid' : 'pending' },
    });
  });
  await page.goto('/balance/top-up/test-card?amount=300&returnTo=%2Fprofile');
  await page.getByRole('button', { name: 'Top Up', exact: true }).click();
  await expect(page.getByText('Payment link is ready')).toBeVisible();
  await expect.poll(() => checks).toBeGreaterThan(0);
  await expect(page).toHaveURL(/\/balance\/top-up\/test-card/);
  paid = true;
  await expect(page).toHaveURL('/profile');
  expect(await page.evaluate(() => sessionStorage.getItem('topup_pending_payment'))).toBeNull();
  expect(
    apiRequests.filter((request) => request === 'POST /api/cabinet/balance/topup'),
  ).toHaveLength(1);
});
