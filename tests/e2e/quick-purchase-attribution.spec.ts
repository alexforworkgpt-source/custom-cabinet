import { expect, test, type Request } from '@playwright/test';

const LANDING_SLUG = 'browser-attribution';
const CONTACT = 'buyer+attribution@example.test';
const CAMPAIGN_SLUG = 'browser_campaign';
const SUBID = 'source-42';

const themeColors = {
  accent: '#3b82f6',
  darkBackground: '#000000',
  darkSurface: '#0a0a0a',
  darkText: '#fafafa',
  darkTextSecondary: '#a3a3a3',
  lightBackground: '#ffffff',
  lightSurface: '#fafafa',
  lightText: '#0a0a0a',
  lightTextSecondary: '#525252',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

const landingConfig = {
  slug: LANDING_SLUG,
  title: 'Browser attribution purchase',
  subtitle: null,
  features: [],
  footer_text: null,
  tariffs: [
    {
      id: 101,
      name: 'Browser tariff',
      description: null,
      traffic_limit_gb: 100,
      device_limit: 3,
      tier_level: 1,
      periods: [
        {
          days: 30,
          label: '30 days',
          price_kopeks: 20_000,
          price_label: '200 RUB',
          original_price_kopeks: null,
          original_price_label: null,
          discount_percent: null,
        },
      ],
    },
  ],
  payment_methods: [
    {
      method_id: 'browser_mock',
      display_name: 'Mock payment',
      description: 'No real provider is contacted',
      icon_url: null,
      sort_order: 1,
      min_amount_kopeks: null,
      max_amount_kopeks: null,
      currency: 'RUB',
      sub_options: null,
    },
  ],
  gift_enabled: false,
  custom_css: null,
  meta_title: null,
  meta_description: null,
  discount: null,
  background_config: null,
  analytics_view_enabled: false,
  analytics_view_goal: '',
  analytics_click_enabled: false,
  analytics_click_goal: '',
  sticky_pay_button: false,
};

const apiResponses: Record<string, unknown> = {
  '/api/cabinet/branding': {
    name: 'Browser Test Cabinet',
    logo_url: null,
    logo_letter: 'B',
    has_custom_logo: false,
  },
  '/api/cabinet/branding/analytics': {
    yandex_metrika_id: '',
    google_ads_id: '',
    google_ads_label: '',
  },
  '/api/cabinet/branding/colors': themeColors,
  '/api/cabinet/branding/themes': { dark: true, light: true },
  '/api/cabinet/info/languages': {
    languages: [{ code: 'en', name: 'English', flag: 'EN' }],
    default: 'en',
  },
  '/api/cabinet/public/site-verification': { apay_tag: null },
  [`/api/cabinet/landing/${LANDING_SLUG}`]: landingConfig,
};

interface ObservedApiRequest {
  method: string;
  url: string;
  referer: string;
  authorization: string;
}

function observeRequest(request: Request): ObservedApiRequest {
  return {
    method: request.method(),
    url: request.url(),
    referer: request.headers().referer ?? '',
    authorization: request.headers().authorization ?? '',
  };
}

test('keeps quick-purchase contact private when contact storage is blocked @desktop-flow', async ({
  page,
}) => {
  const observedApiRequests: ObservedApiRequest[] = [];
  const unexpectedApiRequests = new Set<string>();
  const purchasePayloads: Record<string, unknown>[] = [];

  await page.addInitScript(
    ({ campaignSlug, campaignExpiresAt }) => {
      const getItem = Storage.prototype.getItem;
      const setItem = Storage.prototype.setItem;
      Storage.prototype.getItem = function (key: string) {
        if (key.startsWith('lp_contact_')) throw new Error('Contact storage blocked');
        return getItem.call(this, key);
      };
      Storage.prototype.setItem = function (key: string, value: string) {
        if (key.startsWith('lp_contact_')) throw new Error('Contact storage blocked');
        return setItem.call(this, key, value);
      };
      localStorage.setItem('cabinet_language', 'en');
      localStorage.setItem('campaign_slug', campaignSlug);
      localStorage.setItem('campaign_slug_ttl', String(campaignExpiresAt));
    },
    {
      campaignSlug: CAMPAIGN_SLUG,
      campaignExpiresAt: Date.now() + 60 * 60 * 1000,
    },
  );

  await page.route('**/health/unified', (route) => {
    observedApiRequests.push(observeRequest(route.request()));
    return route.fulfill({ status: 200, json: { status: 'ok' } });
  });
  await page.route('https://api.exchangerate.host/**', (route) => {
    observedApiRequests.push(observeRequest(route.request()));
    return route.fulfill({
      status: 200,
      json: { success: true, rates: { USD: 0.01, CNY: 0.07, IRR: 420 } },
    });
  });
  await page.route('https://open.er-api.com/**', (route) => {
    observedApiRequests.push(observeRequest(route.request()));
    return route.fulfill({
      status: 200,
      json: { rates: { USD: 0.01, CNY: 0.07, IRR: 420 } },
    });
  });
  await page.route('**/api/cabinet/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const requestKey = `${request.method()} ${path}`;
    observedApiRequests.push(observeRequest(request));

    if (requestKey === `POST /api/cabinet/landing/${LANDING_SLUG}/purchase`) {
      const payload: unknown = request.postDataJSON();
      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        purchasePayloads.push(payload as Record<string, unknown>);
      } else {
        unexpectedApiRequests.add(`${requestKey} without a JSON object body`);
      }
      await route.fulfill({
        status: 422,
        json: { detail: 'Mocked purchase stopped before payment.' },
      });
      return;
    }

    if (request.method() !== 'GET' || !Object.hasOwn(apiResponses, path)) {
      unexpectedApiRequests.add(requestKey);
      await route.fulfill({ status: 500, json: { detail: `Missing local mock: ${requestKey}` } });
      return;
    }

    await route.fulfill({ status: 200, json: apiResponses[path] });
  });

  const initialQuery = new URLSearchParams([
    ['utm_source', 'browser-e2e'],
    ['contact', CONTACT],
    ['subid', SUBID],
  ]);
  const cleanedPath = `/buy/${LANDING_SLUG}?utm_source=browser-e2e&subid=${SUBID}#checkout`;

  await page.goto(`/buy/${LANDING_SLUG}?${initialQuery.toString()}#checkout`);

  await expect(page).toHaveURL(cleanedPath);
  await expect(page.getByRole('heading', { name: landingConfig.title })).toBeVisible();

  const contactInput = page.locator('#contact-input');
  await expect(contactInput).toHaveValue(CONTACT);
  await expect(page.getByText('Browser tariff', { exact: true })).toBeVisible();
  await expect(page.getByRole('radio', { name: /Mock payment/ })).toHaveAttribute(
    'aria-checked',
    'true',
  );

  await page.getByRole('button', { name: /^Pay\b/ }).click();
  await expect.poll(() => purchasePayloads.length).toBe(1);
  await expect(page.getByText('Mocked purchase stopped before payment.')).toBeVisible();
  await expect(page).toHaveURL(cleanedPath);

  expect(purchasePayloads[0]).toMatchObject({
    tariff_id: 101,
    period_days: 30,
    contact_type: 'email',
    contact_value: CONTACT,
    payment_method: 'browser_mock',
    language: 'en',
    is_gift: false,
    subid: SUBID,
    campaign_slug: CAMPAIGN_SLUG,
  });
  expect(purchasePayloads[0]).not.toHaveProperty('referrer');

  const purchaseRequests = observedApiRequests.filter(
    (request) =>
      request.method === 'POST' &&
      new URL(request.url).pathname === `/api/cabinet/landing/${LANDING_SLUG}/purchase`,
  );
  expect(purchaseRequests).toHaveLength(1);
  expect(purchaseRequests[0].authorization).toBe('');

  expect(await page.evaluate(() => localStorage.getItem('campaign_slug'))).toBe(CAMPAIGN_SLUG);

  expect(observedApiRequests.length).toBeGreaterThan(0);
  for (const request of observedApiRequests) {
    expect(request.url, `${request.method} URL leaked contact`).not.toContain('contact');
    expect(request.referer, `${request.method} Referer leaked contact`).not.toContain('contact');
  }

  const currentUrl = new URL(page.url());
  const expectedSameOriginReferer = `${currentUrl.origin}${currentUrl.pathname}${currentUrl.search}`;
  const sameOriginApiRequests = observedApiRequests.filter(
    (request) => new URL(request.url).origin === currentUrl.origin,
  );
  expect(sameOriginApiRequests.length).toBeGreaterThan(0);
  for (const request of sameOriginApiRequests) {
    expect(request.referer, `${request.method} ${request.url}`).toBe(expectedSameOriginReferer);
  }

  expect([...unexpectedApiRequests]).toEqual([]);
});

test('cleans contact after client-side navigation before the next API request @desktop-flow', async ({
  page,
}) => {
  const observedApiRequests: ObservedApiRequest[] = [];

  await page.addInitScript(() => localStorage.setItem('cabinet_language', 'en'));
  await page.route('**/health/unified', (route) =>
    route.fulfill({ status: 200, json: { status: 'ok' } }),
  );
  await page.route('https://api.exchangerate.host/**', (route) =>
    route.fulfill({ status: 200, json: { success: true, rates: { USD: 0.01 } } }),
  );
  await page.route('https://open.er-api.com/**', (route) =>
    route.fulfill({ status: 200, json: { rates: { USD: 0.01 } } }),
  );
  await page.route('**/api/cabinet/**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    observedApiRequests.push(observeRequest(request));

    if (request.method() === 'GET' && Object.hasOwn(apiResponses, path)) {
      await route.fulfill({ status: 200, json: apiResponses[path] });
      return;
    }

    await route.fulfill({ status: 500, json: { detail: `Missing local mock: ${path}` } });
  });

  await page.goto(`/buy/${LANDING_SLUG}`);
  await expect(page.getByRole('heading', { name: landingConfig.title })).toBeVisible();
  observedApiRequests.length = 0;

  await page.evaluate(
    ({ contact, subid }) => {
      history.pushState(null, '', `?contact=${encodeURIComponent(contact)}&subid=${subid}`);
      dispatchEvent(new PopStateEvent('popstate'));
    },
    { contact: CONTACT, subid: SUBID },
  );

  await expect(page).toHaveURL(`/buy/${LANDING_SLUG}?subid=${SUBID}`);
  await expect(page.locator('#contact-input')).toHaveValue(CONTACT);

  await page.evaluate(() => fetch('/api/cabinet/branding/colors'));
  await expect.poll(() => observedApiRequests.length).toBeGreaterThan(0);
  for (const request of observedApiRequests) {
    expect(request.url).not.toContain('contact');
    expect(request.referer).not.toContain('contact');
  }
});
