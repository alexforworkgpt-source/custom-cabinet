import { expect, test, type Page } from '@playwright/test';
import { baseApiResponses, prepareAuthenticatedPage } from './cabinetTestHarness';

const guestApiResponses: Record<string, unknown> = {
  ...baseApiResponses,
  '/api/cabinet/auth/oauth/providers': { providers: [] },
  '/api/cabinet/branding/footer-enabled': { enabled: false },
  '/api/cabinet/branding/telegram-widget': {
    bot_username: 'test_bot',
    size: 'large',
    radius: 8,
    userpic: true,
    request_access: true,
    oidc_enabled: false,
    oidc_client_id: '',
  },
  '/api/cabinet/info/legal-consent': { documents: [], prechecked: false },
};

async function delayEnglishDictionary(page: Page) {
  let markRequested: () => void = () => {};
  const requested = new Promise<void>((resolve) => {
    markRequested = resolve;
  });
  let releaseRequest: () => void = () => {};
  const released = new Promise<void>((resolve) => {
    releaseRequest = resolve;
  });

  await page.route('**/src/locales/en.json*', async (route) => {
    markRequested();
    await released;
    await route.continue();
  });

  return { requested, release: releaseRequest };
}

async function prepareGuestPage(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('cabinet_language', 'en');
  });
  await page.route('**/health/unified', (route) =>
    route.fulfill({ status: 200, json: { status: 'ok' } }),
  );
  await page.route('https://telegram.org/js/telegram-widget.js?23', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: `document.currentScript.parentElement.appendChild(document.createElement('iframe'));`,
    }),
  );
  await page.route('**/api/cabinet/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    await route.fulfill({ status: 200, json: guestApiResponses[path] ?? {} });
  });
}

test('waits for a delayed locale before rendering Login @critical-flow', async ({ page }) => {
  const dictionary = await delayEnglishDictionary(page);
  await prepareGuestPage(page);

  const navigation = page.goto('/login');
  await dictionary.requested;
  try {
    await expect(page.locator('#root')).toBeEmpty();
  } finally {
    dictionary.release();
  }
  await navigation;

  await expect(
    page.locator('form').getByRole('button', { name: 'Login', exact: true }),
  ).toBeVisible();
  await expect(page.locator('body')).not.toContainText('auth.login');
});

test('waits for a delayed locale before rendering Dashboard @critical-flow', async ({ page }) => {
  const dictionary = await delayEnglishDictionary(page);
  await prepareAuthenticatedPage(page, { language: 'en' });

  const navigation = page.goto('/');
  await dictionary.requested;
  try {
    await expect(page.locator('#root')).toBeEmpty();
  } finally {
    dictionary.release();
  }
  await navigation;

  await expect(page.getByRole('region', { name: 'Recommended actions' })).toBeVisible();
  await expect(page.locator('body')).not.toContainText('dashboardPromo.');
});
