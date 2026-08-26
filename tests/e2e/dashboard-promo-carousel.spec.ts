import { expect, test } from '@playwright/test';
import { browserTestUser, prepareAuthenticatedPage } from './cabinetTestHarness';

const promoResponses = {
  '/api/cabinet/referral/terms': {
    is_enabled: true,
    commission_percent: 20,
    minimum_topup_kopeks: 0,
    minimum_topup_rubles: 0,
    first_topup_bonus_kopeks: 0,
    first_topup_bonus_rubles: 0,
    inviter_bonus_kopeks: 0,
    inviter_bonus_rubles: 0,
    max_commission_payments: 0,
  },
  '/api/cabinet/referral/list': { items: [], total: 0, page: 1, per_page: 10 },
  '/api/cabinet/referral/earnings': {
    items: [],
    total: 0,
    page: 1,
    per_page: 10,
    total_amount_kopeks: 0,
    total_amount_rubles: 0,
  },
  '/api/cabinet/referral/partner/status': {
    partner_status: 'none',
    commission_percent: null,
    latest_application: null,
    campaigns: [],
  },
  '/api/cabinet/referral/withdrawal/balance': {
    total_earned: 0,
    referral_spent: 0,
    withdrawn: 0,
    pending: 0,
    available_referral: 0,
    available_total: 0,
    only_referral_mode: true,
    min_amount_kopeks: 0,
    is_withdrawal_enabled: false,
    can_request: false,
    cannot_request_reason: 'Disabled in browser tests',
    requisites_text: '',
  },
  '/api/cabinet/referral/withdrawal/history': { items: [], total: 0 },
  '/api/cabinet/branding/gift-enabled': { enabled: true },
  '/api/cabinet/wheel/config': { is_enabled: true },
};

test('shows personalized promo actions above the fortune wheel in priority order', async ({
  page,
}) => {
  const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    featureFlags: {
      referralEnabled: true,
      giftEnabled: true,
      wheelEnabled: true,
    },
    responses: promoResponses,
  });

  await page.goto('/');

  const carousel = page.getByRole('region', { name: 'Recommended actions' });
  const wheel = page.getByRole('link', { name: /Try your luck/ });
  await expect(carousel.getByRole('heading', { name: 'Link Telegram' })).toBeVisible();
  await expect(carousel.getByRole('button', { name: 'Show slide 5 of 5' })).toBeVisible();
  const artMotion = await carousel.locator('[data-dashboard-promo-art]').evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      name: style.animationName,
      duration: style.animationDuration,
      iterationCount: style.animationIterationCount,
      timingFunction: style.animationTimingFunction,
    };
  });
  expect(artMotion).toEqual({
    name: 'float',
    duration: '3s',
    iterationCount: 'infinite',
    timingFunction: 'ease-in-out',
  });
  await expect(carousel.locator('[data-dashboard-promo-detail-art]')).toHaveCSS(
    'animation-name',
    'none',
  );
  const [carouselBox, wheelBox] = await Promise.all([carousel.boundingBox(), wheel.boundingBox()]);
  if (!carouselBox || !wheelBox)
    throw new Error('Promo carousel and fortune wheel must be visible');
  expect(carouselBox.y + carouselBox.height).toBeLessThanOrEqual(wheelBox.y);

  await carousel.getByRole('button', { name: 'Show slide 5 of 5' }).click();
  const earningsSlide = carousel.getByRole('link', { name: /Earn with friends/ });
  await expect(earningsSlide).toBeVisible();
  await expect(earningsSlide).toHaveAttribute('href', '/referral');
  await earningsSlide.click();
  await expect(page).toHaveURL(/\/referral$/);
  const referralPageRequests = [
    'GET /api/cabinet/referral/list',
    'GET /api/cabinet/referral/earnings',
    'GET /api/cabinet/referral/partner/status',
    'GET /api/cabinet/referral/withdrawal/balance',
    'GET /api/cabinet/referral/withdrawal/history',
  ];
  await expect
    .poll(() => referralPageRequests.filter((request) => apiRequests.includes(request)))
    .toEqual(referralPageRequests);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('prioritizes email setup when Telegram is already linked', async ({ page }) => {
  await prepareAuthenticatedPage(page, {
    user: {
      ...browserTestUser,
      telegram_id: 123456,
      email: null,
      email_verified: false,
      auth_type: 'telegram',
    },
  });

  await page.goto('/');
  const carousel = page.getByRole('region', { name: 'Recommended actions' });
  const emailSlide = carousel.getByRole('link', { name: /Protect your account/ });
  await expect(emailSlide).toBeVisible();
  await expect(emailSlide).toHaveAttribute('href', '/profile/accounts');
});

test('does not recommend linking email when Google authorization is linked', async ({ page }) => {
  await prepareAuthenticatedPage(page, {
    user: {
      ...browserTestUser,
      telegram_id: 123456,
      email: null,
      email_verified: false,
      auth_type: 'google',
    },
    responses: {
      ...promoResponses,
      '/api/cabinet/auth/account/linked-providers': {
        providers: [
          { provider: 'telegram', linked: true, identifier: '123456' },
          { provider: 'email', linked: false, identifier: null },
          { provider: 'google', linked: true, identifier: 'user@gmail.com' },
          { provider: 'yandex', linked: false, identifier: null },
        ],
      },
    },
  });

  await page.goto('/');
  const carousel = page.getByRole('region', { name: 'Recommended actions' });
  await expect(carousel.getByRole('heading', { name: 'Choose your plan' })).toBeVisible();
  await expect(carousel.getByRole('link', { name: /Protect your account/ })).toHaveCount(0);
});

test('does not recommend linking email when Yandex authorization is linked', async ({ page }) => {
  await prepareAuthenticatedPage(page, {
    user: {
      ...browserTestUser,
      telegram_id: 123456,
      email: null,
      email_verified: false,
      auth_type: 'yandex',
    },
    responses: {
      ...promoResponses,
      '/api/cabinet/auth/account/linked-providers': {
        providers: [
          { provider: 'telegram', linked: true, identifier: '123456' },
          { provider: 'email', linked: false, identifier: null },
          { provider: 'google', linked: false, identifier: null },
          { provider: 'yandex', linked: true, identifier: 'user@yandex.ru' },
        ],
      },
    },
  });

  await page.goto('/');
  const carousel = page.getByRole('region', { name: 'Recommended actions' });
  await expect(carousel.getByRole('heading', { name: 'Choose your plan' })).toBeVisible();
  await expect(carousel.getByRole('link', { name: /Protect your account/ })).toHaveCount(0);
});

test('shows the news and giveaways Telegram channel as an external recommendation', async ({
  page,
}) => {
  await prepareAuthenticatedPage(page, {
    user: {
      ...browserTestUser,
      telegram_id: 123456,
    },
  });

  await page.goto('/');
  const carousel = page.getByRole('region', { name: 'Recommended actions' });
  await carousel.getByRole('button', { name: 'Show slide 2 of 2' }).click();

  const channelSlide = carousel.getByRole('link', { name: /News and giveaways/ });
  await expect(channelSlide).toBeVisible();
  await expect(channelSlide).toHaveAttribute('href', 'https://t.me/private_config_news');
  await expect(channelSlide).toHaveAttribute('target', '_blank');
});

test('waits for authoritative linked providers before showing account actions', async ({
  page,
}) => {
  let releaseLinkedProviders: () => void = () => {};
  const linkedProvidersReady = new Promise<void>((resolve) => {
    releaseLinkedProviders = resolve;
  });

  await prepareAuthenticatedPage(page, {
    user: {
      ...browserTestUser,
      telegram_id: 123456,
      email: 'linked@example.test',
    },
    featureFlags: {
      referralEnabled: true,
      giftEnabled: true,
    },
    responses: promoResponses,
  });
  await page.route('**/api/cabinet/auth/account/linked-providers', async (route) => {
    await linkedProvidersReady;
    await route.fulfill({
      status: 200,
      json: {
        providers: [
          { provider: 'telegram', linked: false, identifier: null },
          { provider: 'email', linked: false, identifier: null },
        ],
      },
    });
  });

  await page.goto('/');
  const carousel = page.getByRole('region', { name: 'Recommended actions' });
  await expect(carousel).toHaveCount(0);

  releaseLinkedProviders();
  await expect(carousel.getByRole('heading', { name: 'Link Telegram' })).toBeVisible();
  await expect(carousel.getByRole('button', { name: 'Show slide 5 of 5' })).toBeVisible();
});

test('automatically advances to the next available promo action', async ({ page }) => {
  await page.clock.install();
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    user: {
      ...browserTestUser,
      telegram_id: 123456,
      email: 'linked@example.test',
    },
    featureFlags: {
      referralEnabled: true,
      giftEnabled: true,
    },
    responses: promoResponses,
  });

  await page.goto('/');
  const carousel = page.getByRole('region', { name: 'Recommended actions' });
  await expect(carousel.getByRole('heading', { name: 'Choose your plan' })).toBeVisible();

  await page.clock.fastForward(6000);
  await expect(carousel.getByRole('heading', { name: 'News and giveaways' })).toBeVisible();
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('keeps the current slide after the user pauses automatic rotation', async ({ page }) => {
  await page.clock.install();
  await prepareAuthenticatedPage(page, {
    featureFlags: {
      referralEnabled: true,
      giftEnabled: true,
    },
    responses: promoResponses,
  });

  await page.goto('/');
  const carousel = page.getByRole('region', { name: 'Recommended actions' });
  await expect(carousel.getByRole('heading', { name: 'Link Telegram' })).toBeVisible();
  await carousel.getByRole('button', { name: 'Pause automatic slide rotation' }).click();

  await page.clock.fastForward(12000);
  await expect(carousel.getByRole('heading', { name: 'Link Telegram' })).toBeVisible();
});
