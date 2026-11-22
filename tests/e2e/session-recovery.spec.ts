import { expect, test } from '@playwright/test';
import { browserTestUser, prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription } from './classicRenewalFixture';

test('restores the protected profile after a transport failure interrupts session bootstrap', async ({
  page,
}) => {
  let offline = false;
  let healthAvailable = true;
  let successfulPublicResponses = 0;
  const refreshResponse = {
    access_token: '',
    refresh_token: 'browser-test-refresh-token',
    token_type: 'bearer',
    expires_in: 900,
  };
  await prepareAuthenticatedPage(page, {
    responses: { '/api/cabinet/auth/refresh': refreshResponse },
  });
  await page.routeWebSocket('**/api/cabinet/ws**', (socket) => socket.close());
  await page.route('**/api/cabinet/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (offline && path.startsWith('/api/cabinet/auth/')) await route.abort('connectionfailed');
    else await route.fallback();
  });
  page.on('response', (response) => {
    if (response.url().includes('/api/cabinet/branding') && response.status() === 200) {
      successfulPublicResponses += 1;
    }
  });
  await page.route('**/health/unified', async (route) => {
    if (!healthAvailable) await route.abort('connectionfailed');
    else await route.fallback();
  });
  await page.goto('/profile', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
  refreshResponse.access_token = await page.evaluate(
    () => sessionStorage.getItem('access_token') ?? '',
  );

  offline = true;
  healthAvailable = false;
  successfulPublicResponses = 0;
  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('#service-unavailable-title')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('refresh_token'))).toBe(
    'browser-test-refresh-token',
  );

  // A public response must not be mistaken for completed authentication.
  // Auth/health transport fails while the app's public queries already work.
  expect(successfulPublicResponses).toBeGreaterThan(0);
  offline = false;
  healthAvailable = true;

  await expect(page.locator('#service-unavailable-title')).toBeHidden({ timeout: 15000 });
  await expect(page).toHaveURL(/\/profile$/, { timeout: 15000 });
  await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
  await expect(page.getByText(browserTestUser.email ?? '', { exact: true })).toBeVisible();
});

test('discards the completed protected return before a later ordinary login', async ({ page }) => {
  let signedIn = false;
  const accessToken = `browser-test.${Buffer.from(
    JSON.stringify({ sub: '1', exp: 4102444800 }),
  ).toString('base64url')}.signature`;
  await prepareAuthenticatedPage(page);
  await page.routeWebSocket('**/api/cabinet/ws**', (socket) => socket.close());
  await page.route('**/api/cabinet/auth/me', (route) =>
    route.fulfill({
      status: signedIn ? 200 : 401,
      json: signedIn ? browserTestUser : { detail: 'Session is not active' },
    }),
  );
  await page.route('**/api/cabinet/auth/refresh', (route) =>
    route.fulfill({ status: 401, json: { detail: 'Refresh token revoked' } }),
  );
  await page.route('**/api/cabinet/auth/email/login', async (route) => {
    signedIn = true;
    await route.fulfill({
      json: {
        access_token: accessToken,
        refresh_token: 'browser-test-refresh-token',
        token_type: 'bearer',
        expires_in: 900,
        user: browserTestUser,
      },
    });
  });
  const login = async () => {
    await page
      .getByRole('textbox', { name: 'Email', exact: true })
      .fill('browser-test@example.test');
    await page
      .getByRole('textbox', { name: 'Password', exact: true })
      .fill('browser-test-password');
    await page.locator('form').getByRole('button', { name: 'Login', exact: true }).click();
  };

  await page.goto('/profile', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login$/);
  await login();
  await expect(page).toHaveURL(/\/profile$/);
  await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
  // A later direct Login entry must not reuse the completed profile return.
  // Logout from a protected route intentionally saves that route again.
  signedIn = false;
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page).toHaveURL(/\/login$/);
  await login();
  await expect(page).toHaveURL(/\/$/);
});

test('signing in to a different account leaves the previous subscription out of loading', async ({
  page,
}) => {
  const account = { ...browserTestUser, id: 2, email: 'new-account@example.test' };
  const old = { ...subscription, tariff_name: 'Former account plan' };
  let switched = false;
  let release = () => {};
  const list = new Promise<void>((resolve) => {
    release = resolve;
  });
  await prepareAuthenticatedPage(page, {
    responses: {
      ...responses,
      '/api/cabinet/auth/logout': {},
      '/api/cabinet/subscriptions': {
        subscriptions: [old, { ...old, id: 43 }],
        multi_tariff_enabled: true,
      },
      '/api/cabinet/subscription': { has_subscription: true, subscription: old },
    },
  });
  await page.routeWebSocket('**/api/cabinet/ws**', (socket) => socket.close());
  await page.route('**/api/cabinet/auth/me', (route) =>
    route.fulfill({ json: switched ? account : browserTestUser }),
  );
  await page.route('**/api/cabinet/auth/email/login', (route) => {
    switched = true;
    return route.fulfill({
      json: {
        access_token: `browser-test.${Buffer.from(
          JSON.stringify({ sub: '2', exp: 4102444800 }),
        ).toString('base64url')}.signature`,
        refresh_token: 'second-browser-test-refresh-token',
        token_type: 'bearer',
        expires_in: 900,
        user: account,
      },
    });
  });
  await page.route('**/api/cabinet/subscriptions', async (route) => {
    if (!switched) return route.fallback();
    await list;
    await route.fulfill({ json: { subscriptions: [], multi_tariff_enabled: true } });
  });

  await page.goto('/');
  await expect(page.getByText('Former account plan', { exact: true }).last()).toBeVisible();
  await page.getByRole('link', { name: 'Profile', exact: true }).first().click();
  await page.getByRole('main').getByRole('button', { name: 'Logout' }).click();
  await expect(page).toHaveURL('/login');
  await page.getByRole('textbox', { name: 'Email', exact: true }).fill(account.email);
  await page.getByRole('textbox', { name: 'Password', exact: true }).fill('browser-test-password');
  await page.locator('form').getByRole('button', { name: 'Login', exact: true }).click();
  await expect(page.getByRole('navigation')).not.toHaveCount(0);
  await page.getByRole('link', { name: 'Dashboard', exact: true }).first().click();
  await expect(page.getByRole('heading', { name: 'Your Subscription' })).toBeVisible();
  await expect(page.getByText('Former account plan', { exact: true })).toHaveCount(0);
  release();
  await expect(page.locator('main a[href="/subscription/purchase"]')).toBeVisible();
});
