import { expect, test, type Page, type Route } from '@playwright/test';

const apiResponses: Record<string, unknown> = {
  '/api/cabinet/branding': {
    name: 'Test Cabinet',
    logo_url: null,
    logo_letter: 'T',
    has_custom_logo: false,
  },
  '/api/cabinet/branding/analytics': {},
  '/api/cabinet/branding/animation-config': { enabled: false, type: 'none', settings: {} },
  '/api/cabinet/branding/colors': {},
  '/api/cabinet/branding/email-auth': { enabled: false, verification_enabled: false },
  '/api/cabinet/branding/footer-enabled': { enabled: false },
  '/api/cabinet/branding/fullscreen': { enabled: false },
  '/api/cabinet/branding/telegram-widget': {
    bot_username: 'test_bot',
    size: 'large',
    radius: 8,
    userpic: true,
    request_access: true,
    oidc_enabled: false,
    oidc_client_id: '',
  },
  '/api/cabinet/auth/oauth/providers': { providers: [] },
  '/api/cabinet/info/legal-consent': { documents: [], prechecked: false },
  '/api/cabinet/info/languages': {
    languages: [{ code: 'en', name: 'English', flag: 'EN' }],
    default: 'en',
  },
};

const deepLinkAuthResponse = {
  access_token:
    'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxIiwiZXhwIjo0MTAyNDQ0ODAwfQ.telegram-login',
  refresh_token: 'telegram-refresh-token',
  user: {
    id: 1,
    telegram_id: 1,
    username: 'telegram_login',
    first_name: 'Telegram Login',
    last_name: null,
    email: null,
    email_verified: false,
    balance_kopeks: 0,
    balance_rubles: 0,
    referral_code: null,
    language: 'en',
    created_at: '2026-01-01T00:00:00Z',
    auth_type: 'telegram',
  },
};

async function mockTelegramLogin(
  page: Page,
  poll: (route: Route) => Promise<void>,
  widgetScriptFails = false,
  expiresIn = 300,
) {
  let deepLinkRequestCount = 0;

  await page.addInitScript(() => {
    localStorage.setItem('cabinet_language', 'en');
  });
  await page.route('**/health/unified', (route) =>
    route.fulfill({ status: 200, json: { status: 'ok' } }),
  );
  await page.route('https://telegram.org/js/telegram-widget.js?23', (route) =>
    widgetScriptFails
      ? route.abort()
      : route.fulfill({
          contentType: 'application/javascript',
          body: `document.currentScript.parentElement.appendChild(document.createElement('iframe'));`,
        }),
  );
  await page.route('**/api/cabinet/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/api/cabinet/auth/deeplink/poll') {
      await poll(route);
      return;
    }
    if (path === '/api/cabinet/auth/deeplink/request') {
      deepLinkRequestCount += 1;
      await route.fulfill({
        status: 200,
        json: {
          token: `pending-token-${deepLinkRequestCount}`,
          bot_username: 'test_bot',
          expires_in: expiresIn,
        },
      });
      return;
    }
    await route.fulfill({ status: 200, json: apiResponses[path] ?? {} });
  });

  return {
    getDeepLinkRequestCount: () => deepLinkRequestCount,
  };
}

test('returning to the Telegram widget cancels an in-flight deep-link poll', async ({ page }) => {
  let markPollStarted: () => void = () => {};
  const pollStarted = new Promise<void>((resolve) => {
    markPollStarted = resolve;
  });
  let releasePoll: () => void = () => {};
  const pollReleased = new Promise<void>((resolve) => {
    releasePoll = resolve;
  });

  await mockTelegramLogin(page, async (route) => {
    markPollStarted();
    await pollReleased;
    await route.fulfill({ status: 200, json: deepLinkAuthResponse });
  });

  await page.goto('/login');
  const manualLogin = page.getByRole('button', { name: 'Login via bot' });
  await expect(manualLogin).toBeVisible();
  await manualLogin.click();
  await pollStarted;

  await expect(
    page.getByText('Confirm sign-in right in the bot — no phone number needed:'),
  ).toBeVisible();
  const backButton = page.getByRole('button', { name: 'Back to widget login' });
  const backButtonBox = await backButton.boundingBox();
  expect(backButtonBox?.width).toBeGreaterThanOrEqual(44);
  expect(backButtonBox?.height).toBeGreaterThanOrEqual(44);
  await backButton.click();
  releasePoll();

  await expect(manualLogin).toBeVisible();
  await page.waitForTimeout(2000);
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => sessionStorage.getItem('access_token'))).toBeNull();
});

test('expiring a Telegram deep link cancels an in-flight poll', async ({ page }) => {
  await page.clock.install();
  let markPollStarted: () => void = () => {};
  const pollStarted = new Promise<void>((resolve) => {
    markPollStarted = resolve;
  });
  let releasePoll: () => void = () => {};
  const pollReleased = new Promise<void>((resolve) => {
    releasePoll = resolve;
  });

  await mockTelegramLogin(
    page,
    async (route) => {
      markPollStarted();
      await pollReleased;
      await route.fulfill({ status: 200, json: deepLinkAuthResponse });
    },
    false,
    3,
  );

  await page.goto('/login');
  await page.getByRole('button', { name: 'Login via bot' }).click();
  await page.clock.fastForward(2500);
  await pollStarted;
  await page.clock.fastForward(600);
  await expect(page.getByText('Link expired. Please try again.')).toBeVisible();

  releasePoll();
  await new Promise((resolve) => setTimeout(resolve, 100));
  await expect(page).toHaveURL(/\/login$/);
  expect(await page.evaluate(() => sessionStorage.getItem('access_token'))).toBeNull();
});

test('manual Telegram login exposes terminal poll errors and can request a fresh token', async ({
  page,
}) => {
  const telegram = await mockTelegramLogin(page, (route) =>
    route.fulfill({ status: 500, json: { detail: 'Poll failed' } }),
  );

  await page.goto('/login');
  await page.getByRole('button', { name: 'Login via bot' }).click();

  await expect(page.getByText('Error', { exact: true })).toBeVisible();
  const retry = page.getByRole('button', { name: 'Try Again' });
  await expect(retry).toBeVisible();
  await retry.click();

  await expect.poll(telegram.getDeepLinkRequestCount).toBe(2);
});

test('manual Telegram login succeeds after bot confirmation', async ({ page }) => {
  await mockTelegramLogin(page, (route) =>
    route.fulfill({ status: 200, json: deepLinkAuthResponse }),
  );

  await page.goto('/login');
  await page.getByRole('button', { name: 'Login via bot' }).click();

  await expect(page).toHaveURL(/\/$/);
  expect(await page.evaluate(() => sessionStorage.getItem('access_token'))).toBe(
    deepLinkAuthResponse.access_token,
  );
});

test('Telegram widget script failure automatically falls back to deep-link login', async ({
  page,
}) => {
  const telegram = await mockTelegramLogin(
    page,
    (route) => route.fulfill({ status: 202, json: { status: 'pending' } }),
    true,
  );

  await page.goto('/login');

  await expect(
    page.getByText('Telegram login widget is unavailable. Use the bot to sign in:'),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Login via bot' })).toHaveAttribute(
    'href',
    'https://t.me/test_bot?start=webauth_pending-token-1',
  );
  await expect.poll(telegram.getDeepLinkRequestCount).toBe(1);
});
