import { expect, test } from '@playwright/test';
import { baseApiResponses, prepareAuthenticatedPage } from './cabinetTestHarness';

const sections = [
  { route: '/profile/accounts', label: 'Connected Accounts' },
  { route: '/profile/notifications', label: 'Notification Settings' },
  { route: '/contests', label: 'Contests' },
  { route: '/polls', label: 'Polls' },
  { route: '/wheel', label: 'Fortune Wheel' },
  { route: '/instructions', label: 'Instructions and setup' },
  { route: '/info', label: 'Information' },
  { route: '/gift', label: 'Gifts' },
];

const responses = {
  '/api/cabinet/branding/telegram-widget': { enabled: false, bot_username: null },
  '/api/cabinet/contests': [],
  '/api/cabinet/polls': [],
  '/api/cabinet/contests/count': { count: 1 },
  '/api/cabinet/polls/count': { count: 1 },
  '/api/cabinet/wheel/config': {
    is_enabled: true,
    name: 'Local wheel',
    spin_cost_stars: null,
    spin_cost_days: 1,
    spin_cost_stars_enabled: false,
    spin_cost_days_enabled: true,
    prizes: [
      { id: 1, display_name: 'Nothing', emoji: '🎰', color: '#3b82f6', prize_type: 'nothing' },
    ],
    daily_limit: 5,
    user_spins_today: 0,
    can_spin: false,
    can_spin_reason: null,
    can_pay_stars: false,
    can_pay_days: false,
    user_balance_kopeks: 0,
    required_balance_kopeks: 0,
    has_subscription: false,
    eligible_subscriptions: [],
  },
  '/api/cabinet/wheel/history': { items: [], total: 0, page: 1, per_page: 10, pages: 0 },
  '/api/cabinet/info-pages/tab-replacements': {
    faq: null,
    rules: null,
    privacy: null,
    offer: null,
  },
  '/api/cabinet/info-pages': [],
  '/api/cabinet/info/visibility': {
    faq: true,
    rules: true,
    privacy: true,
    offer: true,
    recurrent: true,
  },
  '/api/cabinet/info/faq': [],
  '/api/cabinet/branding/gift-enabled': { enabled: true },
  '/api/cabinet/gift/config': {
    is_enabled: true,
    tariffs: [],
    payment_methods: [],
    balance_kopeks: 0,
    currency_symbol: '₽',
    promo_group_name: null,
    active_discount_percent: null,
    active_discount_expires_at: null,
  },
};

for (const { route, label } of sections) {
  test(`returns from ${label} to Profile after direct entry and reload`, async ({ page }) => {
    const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
      responses,
      featureFlags: { giftEnabled: true, wheelEnabled: true, hasContests: true, hasPolls: true },
    });
    await page.goto('/profile');
    const entrance =
      route === '/profile/accounts'
        ? page.getByRole('link', { name: /^Connected Accounts/ })
        : page.getByRole('main').locator(`a[href="${route}"]`);
    await entrance.click();
    await expect(page).toHaveURL(route);
    await page.getByRole('main').getByRole('link', { name: 'Back', exact: true }).click();
    await expect(page).toHaveURL('/profile');
    await page.goto(route);
    await expect(page.getByRole('heading', { name: label, exact: true })).toBeVisible();
    await page.reload();
    const main = page.getByRole('main');
    const back = main.getByRole('link', { name: 'Back', exact: true });
    await expect(back).toBeVisible();
    await expect(back).toHaveAttribute('href', '/profile');
    const size = await back.evaluate((link) => ({
      width: link.offsetWidth,
      height: link.offsetHeight,
    }));
    expect(size.width).toBeGreaterThanOrEqual(44);
    expect(size.height).toBeGreaterThanOrEqual(44);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await back.click();
    await expect(page).toHaveURL('/profile');
    await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
    expect([...unexpectedApiRequests]).toEqual([]);
  });
}

test('returns from notification settings to Profile without saving settings', async ({ page }) => {
  const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page);
  await page.goto('/profile');
  await page.getByRole('link', { name: 'Notification Settings', exact: true }).click();
  await expect(page).toHaveURL('/profile/notifications');
  const back = page.getByRole('main').getByRole('link', { name: 'Back', exact: true });
  await expect(back).toBeVisible();
  await back.focus();
  await expect(back).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/profile');
  await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
  expect(apiRequests.filter((request) => request.startsWith('PATCH '))).toEqual([]);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('can leave pending gift processing without cancelling or buying again', async ({ page }) => {
  const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/gift/purchase/local-token': { status: 'pending', is_claimable: false },
      '/api/cabinet/gift/config': {
        is_enabled: true,
        tariffs: [],
        payment_methods: [],
        balance_kopeks: 0,
      },
    },
  });
  await page.goto('/gift/result?token=local-token');
  await expect(page.getByRole('heading', { name: 'Processing...', exact: true })).toBeVisible();
  const back = page.getByRole('main').getByRole('link', { name: 'Back', exact: true });
  await expect(back).toBeVisible();
  await expect(back).toHaveAttribute('href', '/gift');
  await back.click();
  await expect(page).toHaveURL('/gift');
  await expect(page.getByRole('heading', { name: 'Gifts', exact: true })).toBeVisible();
  expect(apiRequests.filter((request) => /^(POST|PATCH|DELETE) .*\/gift/.test(request))).toEqual(
    [],
  );
  expect([...unexpectedApiRequests]).toEqual([]);
});

const loadingScreens = [
  {
    path: '/contests',
    api: '/api/cabinet/contests',
    json: [],
    errorText: 'Failed to load contests',
  },
  { path: '/polls', api: '/api/cabinet/polls', json: [], errorText: 'Failed to load polls' },
  {
    path: '/wheel',
    api: '/api/cabinet/wheel/config',
    json: responses['/api/cabinet/wheel/config'],
    errorText: 'Failed to load wheel configuration',
  },
  {
    path: '/gift',
    api: '/api/cabinet/gift/config',
    json: responses['/api/cabinet/gift/config'],
    errorText: 'Error',
  },
  {
    path: '/profile/notifications',
    api: '/api/cabinet/notifications',
    json: baseApiResponses['/api/cabinet/notifications'],
    errorText: 'Error',
  },
  {
    path: '/profile/accounts',
    api: '/api/cabinet/auth/account/linked-providers',
    json: { providers: [] },
    errorText: 'Error',
  },
];

test('keeps the exit available while sections are loading', async ({ page }) => {
  await prepareAuthenticatedPage(page, { responses });
  for (const { path, api, json } of loadingScreens) {
    let release: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(`**${api}`, async (route) => {
      await pending;
      await route.fulfill({ json }).catch(() => {});
    });
    try {
      const request = page.waitForRequest((request) => new URL(request.url()).pathname === api);
      await page.goto(path);
      await request;
      const back = page.getByRole('main').getByRole('link', { name: 'Back', exact: true });
      await expect(back).toBeVisible();
      await back.click();
      await expect(page).toHaveURL('/profile');
    } finally {
      release();
    }
  }
});

test('keeps the exit available when section requests fail', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses,
    responseStatuses: Object.fromEntries(loadingScreens.map(({ api }) => [api, 500])),
  });
  for (const { path, api, errorText } of loadingScreens) {
    const failed = page.waitForResponse(
      (response) => new URL(response.url()).pathname === api && response.status() === 500,
    );
    await page.goto(path);
    await failed;
    await expect(
      page.getByRole('main').getByText(errorText, { exact: true }).first(),
    ).toBeVisible();
    const back = page.getByRole('main').getByRole('link', { name: 'Back', exact: true });
    await expect(back).toBeVisible();
    await back.click();
    await expect(page).toHaveURL('/profile');
  }
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('keeps the exit available when the wheel is disabled', async ({ page }) => {
  await prepareAuthenticatedPage(page, {
    responses: { ...responses, '/api/cabinet/wheel/config': { is_enabled: false } },
  });
  await page.goto('/wheel');
  await expect(
    page.getByText('Fortune Wheel is currently unavailable', { exact: true }),
  ).toBeVisible();
  await page.getByRole('main').getByRole('link', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL('/profile');
});

test('keeps a readable RTL exit in the operator palette', async ({ page }) => {
  await prepareAuthenticatedPage(page, { language: 'fa' });
  await page.addInitScript(() => localStorage.setItem('cabinet-theme', 'light'));
  await page.goto('/profile/notifications');
  const back = page
    .getByRole('main')
    .getByRole('link')
    .filter({ has: page.locator('svg') });
  await expect(back).toHaveAttribute('href', '/profile');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const transform = await back.locator('svg').evaluate((icon) => getComputedStyle(icon).transform);
  expect(transform).toBe('matrix(-1, 0, 0, -1, 0, 0)');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await back.click();
  await expect(page).toHaveURL('/profile');
});
