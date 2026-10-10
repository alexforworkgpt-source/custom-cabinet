import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses } from './classicRenewalFixture';

const paymentResponses = {
  ...responses,
  '/api/cabinet/balance/topup': {
    payment_id: '42',
    payment_url: 'https://payments.example.test/42',
    amount_kopeks: 100000,
    amount_rubles: 1000,
    status: 'pending',
    expires_at: null,
  },
  '/api/cabinet/balance/pending-payments/test-card/42': {
    id: 42,
    is_paid: false,
    status: 'pending',
    amount_kopeks: 100000,
  },
};

for (const [returnTo, destination] of [
  ['/subscriptions/42/renew', '/?sub=42'],
  ['/subscriptions/42?section=additional-options', '/?sub=42'],
  ['/subscription/purchase?subscriptionId=42', '/?sub=42'],
  ['/subscription/purchase', '/'],
  ['/subscriptions/99/renew', '/'],
]) {
  for (const exit of ['close', 'escape']) {
    test(`ready payment from ${returnTo} exits via ${exit} @critical-flow`, async ({ page }) => {
      const { apiRequests } = await prepareAuthenticatedPage(page, { responses: paymentResponses });
      await page.goto(
        `/balance/top-up/test-card?amount=1000&returnTo=${encodeURIComponent(returnTo)}`,
      );
      await page.getByRole('button', { name: 'Top Up', exact: true }).click();
      await expect(page.getByText('Payment link is ready')).toBeVisible();
      if (exit === 'escape') await page.keyboard.press('Escape');
      else await page.getByRole('button', { name: 'Close', exact: true }).click();
      await expect(page).toHaveURL(destination);
      await expect(page.getByRole('dialog')).toHaveCount(0);
      expect(
        await page.evaluate(() =>
          JSON.parse(sessionStorage.getItem('topup_pending_payment') || 'null'),
        ),
      ).toMatchObject({ returnTo, payment_id: '42' });
      expect(
        apiRequests.filter((request) => request === 'POST /api/cabinet/balance/topup'),
      ).toHaveLength(1);
      expect(apiRequests).not.toContain('POST /api/cabinet/subscription/purchase');
    });
  }
}

test('full renewal flow closes a ready payment and retains the renewal selection @critical-flow', async ({
  page,
}) => {
  const { apiRequests } = await prepareAuthenticatedPage(page, {
    responses: paymentResponses,
    language: 'ru',
  });
  await page.route(/\/api\/cabinet\/subscription\/renew(?:\?|$)/, (route) =>
    route.fulfill({
      status: 402,
      json: {
        detail: {
          code: 'insufficient_funds',
          cart_saved: true,
          cart_mode: 'extend',
          missing_amount: 100000,
        },
      },
    }),
  );
  await page.goto('/subscriptions/42/renew');
  await page.getByRole('button', { name: /^90 дней/ }).click();
  await page.getByRole('button', { name: 'Пополнить баланс', exact: true }).click();
  await page.getByRole('button', { name: /Тестовая карта/ }).click();
  await page.getByRole('button', { name: 'Пополнить', exact: true }).click();
  await expect(page.getByText('Ссылка на оплату готова')).toBeVisible();
  await page.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(page).toHaveURL('/?sub=42');
  await expect(page.getByRole('dialog')).toHaveCount(0);
  expect(
    apiRequests.filter((request) => request === 'POST /api/cabinet/balance/topup'),
  ).toHaveLength(1);
  await page.goto('/balance/top-up/result?status=success');
  await page.getByRole('button', { name: 'Назад', exact: true }).click();
  await expect(page).toHaveURL('/subscriptions/42/renew');
  await expect(page.getByRole('button', { name: /^90 дней/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

for (const openDirect of [false, true]) {
  test(`Telegram Back closes subscription payment (direct=${openDirect}) @telegram-flow`, async ({
    page,
  }) => {
    await prepareAuthenticatedPage(page, {
      responses: {
        ...paymentResponses,
        '/api/cabinet/balance/payment-methods': [
          { ...responses['/api/cabinet/balance/payment-methods'][0], open_url_direct: openDirect },
        ],
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
    await page.goto(
      `/balance/top-up/test-card?amount=1000&returnTo=%2Fsubscriptions%2F42%2Frenew#${launch}`,
    );
    await page.getByRole('button', { name: 'Top Up', exact: true }).click();
    await expect(page.getByText('Payment link is ready')).toBeVisible();
    await page.evaluate(() => {
      const host = window as typeof window & {
        Telegram?: { WebView?: { receiveEvent: (event: string) => void } };
      };
      host.Telegram?.WebView?.receiveEvent('back_button_pressed');
    });
    await expect(page).toHaveURL('/?sub=42');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    expect(
      await page.evaluate(() => sessionStorage.getItem('topup_pending_payment')),
    ).not.toBeNull();
  });
}
