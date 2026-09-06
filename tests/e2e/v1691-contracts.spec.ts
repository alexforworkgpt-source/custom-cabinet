import { expect, test, type Page, type Route } from '@playwright/test';
import { browserTestUser, prepareAuthenticatedPage } from './cabinetTestHarness';

const CONSENT_DOCUMENTS = ['public_offer', 'privacy_policy'];
const CONSENT_REQUIRED = {
  detail: {
    code: 'legal_consent_required',
    message: 'Consent to the legal documents is required to create an account',
    documents: CONSENT_DOCUMENTS,
    missing: CONSENT_DOCUMENTS,
    prechecked: false,
  },
};

const AUTH_RESPONSE = {
  access_token:
    'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxIiwiZXhwIjo0MTAyNDQ0ODAwfQ.v1691-browser',
  refresh_token: 'v1691-browser-refresh',
  user: {
    ...browserTestUser,
    telegram_id: 1,
    email: null,
    auth_type: 'telegram',
  },
};

const PUBLIC_RESPONSES: Record<string, unknown> = {
  '/api/cabinet/auth/me/is-admin': { is_admin: false },
  '/api/cabinet/auth/oauth/providers': { providers: [] },
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
  '/api/cabinet/info/legal-consent': { documents: [], prechecked: false },
  '/api/cabinet/info/languages': {
    languages: [{ code: 'en', name: 'English', flag: 'EN' }],
    default: 'en',
  },
};

async function prepareUnauthenticatedPage(
  page: Page,
  authPath: string,
  auth: (route: Route, body: Record<string, unknown>, requestNumber: number) => Promise<void>,
) {
  let requestNumber = 0;
  const bodies: Record<string, unknown>[] = [];

  await page.addInitScript(() => localStorage.setItem('cabinet_language', 'en'));
  await page.route('**/health/unified', (route) =>
    route.fulfill({ status: 200, json: { status: 'ok' } }),
  );
  await page.route('https://telegram.org/js/telegram-widget.js?23', (route) =>
    route.fulfill({
      contentType: 'application/javascript',
      body: "document.currentScript.parentElement.appendChild(document.createElement('iframe'));",
    }),
  );
  await page.route('**/api/cabinet/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (path === authPath && route.request().method() === 'POST') {
      requestNumber += 1;
      const body = route.request().postDataJSON() as Record<string, unknown>;
      bodies.push(body);
      await auth(route, body, requestNumber);
      return;
    }
    await route.fulfill({ status: 200, json: PUBLIC_RESPONSES[path] ?? {} });
  });

  return { bodies, requestCount: () => requestNumber };
}

async function acceptRequiredDocuments(page: Page) {
  await expect(page.getByRole('heading', { name: 'One more step' })).toBeVisible();
  await page.locator('#legal-consent-public_offer').check();
  await page.locator('#legal-consent-privacy_policy').check();
  await page.getByRole('button', { name: 'Continue' }).click();
}

function hasAcceptedDocuments(body: Record<string, unknown>): boolean {
  return (
    Array.isArray(body.accepted_legal_documents) &&
    body.accepted_legal_documents.join(',') === CONSENT_DOCUMENTS.join(',')
  );
}

test('Telegram callback shows legal consent and retries the same payload @critical-flow', async ({
  page,
}) => {
  const auth = await prepareUnauthenticatedPage(
    page,
    '/api/cabinet/auth/telegram/widget',
    async (route, body) => {
      await route.fulfill(
        hasAcceptedDocuments(body)
          ? { status: 200, json: AUTH_RESPONSE }
          : { status: 428, json: CONSENT_REQUIRED },
      );
    },
  );

  await page.goto('/auth/telegram/callback?id=1&first_name=A&auth_date=1700000000&hash=h');
  await acceptRequiredDocuments(page);
  await expect.poll(auth.requestCount).toBe(2);

  expect(auth.bodies[1]).toMatchObject({
    id: 1,
    first_name: 'A',
    auth_date: 1700000000,
    hash: 'h',
    accepted_legal_documents: CONSENT_DOCUMENTS,
  });
});

test('Telegram redirect shows legal consent and retries the same initData @telegram-flow', async ({
  page,
}) => {
  const auth = await prepareUnauthenticatedPage(
    page,
    '/api/cabinet/auth/telegram',
    async (route, body) => {
      await route.fulfill(
        hasAcceptedDocuments(body)
          ? { status: 200, json: AUTH_RESPONSE }
          : { status: 428, json: CONSENT_REQUIRED },
      );
    },
  );
  const launchParams = new URLSearchParams({
    tgWebAppData: new URLSearchParams({
      auth_date: '1787443200',
      hash: 'browser-test-hash',
      signature: 'browser-test-signature',
      user: JSON.stringify({ id: 1, first_name: 'Browser', language_code: 'en' }),
    }).toString(),
    tgWebAppPlatform: 'android',
    tgWebAppThemeParams: JSON.stringify({ bg_color: '#000000' }),
    tgWebAppVersion: '8.0',
  });

  await page.goto(`/tg?redirect=/subscription#${launchParams.toString()}`);
  await acceptRequiredDocuments(page);
  await expect.poll(auth.requestCount).toBe(2);

  expect(auth.bodies[1].init_data).toBe(auth.bodies[0].init_data);
  expect(auth.bodies[1].accepted_legal_documents).toEqual(CONSENT_DOCUMENTS);
});

test('Telegram widget shows legal consent and retries its original payload @critical-flow', async ({
  page,
}) => {
  const auth = await prepareUnauthenticatedPage(
    page,
    '/api/cabinet/auth/telegram/widget',
    async (route, body) => {
      await route.fulfill(
        hasAcceptedDocuments(body)
          ? { status: 200, json: AUTH_RESPONSE }
          : { status: 428, json: CONSENT_REQUIRED },
      );
    },
  );

  await page.goto('/login');
  await page.waitForFunction(
    () =>
      typeof (window as unknown as Record<string, unknown>).__onTelegramWidgetAuth === 'function',
  );
  await page.evaluate(async () => {
    const callback = (window as unknown as Record<string, unknown>).__onTelegramWidgetAuth as (
      user: Record<string, unknown>,
    ) => Promise<void>;
    await callback({ id: 7, first_name: 'Widget', auth_date: 1700000001, hash: 'widget-hash' });
  });
  await acceptRequiredDocuments(page);
  await expect.poll(auth.requestCount).toBe(2);

  expect(auth.bodies[1]).toMatchObject({
    id: 7,
    first_name: 'Widget',
    auth_date: 1700000001,
    hash: 'widget-hash',
    accepted_legal_documents: CONSENT_DOCUMENTS,
  });
});

test('structured API detail is rendered as its message instead of crashing React @critical-flow', async ({
  page,
}) => {
  await prepareUnauthenticatedPage(page, '/api/cabinet/auth/telegram/widget', async (route) => {
    await route.fulfill({
      status: 500,
      json: { detail: { code: 'telegram_failed', message: 'Structured callback failure' } },
    });
  });

  await page.goto('/auth/telegram/callback?id=1&first_name=A&auth_date=1700000000&hash=h');

  await expect(page.getByRole('heading', { name: 'Login Failed' })).toBeVisible();
  await expect(page.getByText('Structured callback failure')).toBeVisible();
});

test('header loads the Telegram avatar from the Bot fallback endpoint @critical-flow', async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 900 });
  const avatarUrl =
    'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="32" height="32"%3E%3Crect width="32" height="32" fill="black"/%3E%3C/svg%3E';
  const user = { ...browserTestUser, telegram_id: 123 };
  const { apiRequests } = await prepareAuthenticatedPage(page, {
    user,
    responses: {
      '/api/cabinet/auth/me/avatar': { photo_url: avatarUrl },
      '/api/cabinet/auth/me/is-admin': { is_admin: true },
      '/api/cabinet/auth/me/permissions': {
        permissions: [],
        roles: ['avatar_browser_test'],
        role_level: 100,
      },
      '/api/cabinet/admin/tickets/notifications/unread-count': { unread_count: 0 },
    },
  });

  await page.goto('/admin');
  await page.getByRole('button', { name: 'Open menu' }).click();

  await expect(page.getByAltText('Avatar')).toHaveAttribute('src', avatarUrl);
  expect(apiRequests).toContain('GET /api/cabinet/auth/me/avatar');
});

test('first paint uses API branding and keeps favicon on the dedicated Bot endpoint @critical-flow', async ({
  page,
}) => {
  let releaseBranding: () => void = () => {};
  const brandingReleased = new Promise<void>((resolve) => {
    releaseBranding = resolve;
  });
  let faviconRequests = 0;

  await page.route('**/health/unified', (route) =>
    route.fulfill({ status: 200, json: { status: 'ok' } }),
  );
  await page.route('**/api/cabinet/**', (route) => route.fulfill({ status: 200, json: {} }));
  await page.route('**/api/cabinet/branding/favicon', async (route) => {
    faviconRequests += 1;
    await route.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from([]) });
  });
  await page.route('**/api/cabinet/branding', async (route) => {
    await brandingReleased;
    await route.fulfill({
      status: 200,
      json: {
        name: 'Early API Cabinet',
        logo_url: null,
        logo_letter: 'E',
        has_custom_logo: false,
      },
    });
  });

  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute(
    'href',
    '/api/cabinet/branding/favicon',
  );
  releaseBranding();

  await expect(page).toHaveTitle('Early API Cabinet');
  await expect.poll(() => faviconRequests).toBeGreaterThan(0);
});
