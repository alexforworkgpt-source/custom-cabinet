import { expect, type Page, test } from '@playwright/test';
import { baseApiResponses, prepareAuthenticatedPage } from './cabinetTestHarness';
import { classicPurchaseOptions } from './classicPurchasePricingFixture';
import { responses, subscription } from './classicRenewalFixture';
import {
  clearEntrances,
  expectFadeEntrance,
  expectStationary,
  recordEntrances,
  waitForRestingGeometry,
} from './entranceProbe';
import { informationEntranceResponses } from './informationEntranceFixture';
import { prepareQrWheel, wheelConfig } from './qrWheelFixture';

test('matches the Dashboard traffic value to the device value', async ({ page }) => {
  await prepareAuthenticatedPage(page, {
    responses: {
      ...responses,
      '/api/cabinet/subscription/refresh-traffic': {
        traffic_used_gb: 25,
        traffic_used_percent: 25,
        is_unlimited: false,
      },
    },
  });
  await page.goto('/');
  const card = page.getByRole('region', { name: 'Subscription active' });
  const devices = card.getByText('3 devices', { exact: true });
  await expect(devices).toBeVisible();
  const color = await devices.evaluate((element) => getComputedStyle(element).color);
  const usage = card.locator('[data-traffic-percentage]');
  await expect(usage).toHaveText('25%');
  await expect(usage).toHaveCSS('color', color);
});

test('groups Dashboard traffic and devices with an inset divider and a single-line count', async ({
  page,
}) => {
  const current = { ...subscription, device_limit: 1 };
  await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscription': { has_subscription: true, subscription: current },
      '/api/cabinet/subscriptions': { subscriptions: [current], multi_tariff_enabled: false },
    },
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const hero = page.getByRole('region', { name: 'Подписка активна' });
  const metrics = hero.locator('dl').filter({ hasText: '1 устройство' });
  const count = metrics.getByText('1 устройство', { exact: true });
  await expect(count).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect(
    await count.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      return range.getClientRects().length;
    }),
  ).toBe(1);
  const action = await hero.getByRole('button', { name: 'Управление подпиской' }).boundingBox();
  const group = await metrics.boundingBox();
  if (!action || !group) throw new Error('Expected visible subscription action and metrics');
  expect(group.x).toBeCloseTo(action.x, 0);
  expect(group.width).toBeCloseTo(action.width, 0);

  const divider = await metrics
    .locator('.subscription-hero-metric')
    .last()
    .evaluate((element) => {
      const style = getComputedStyle(element, '::before');
      return {
        content: style.content,
        top: parseFloat(style.top),
        bottom: parseFloat(style.bottom),
      };
    });
  expect(divider.content).toBe('""');
  expect(divider.top).toBeGreaterThan(0);
  expect(divider.bottom).toBeGreaterThan(0);
});

test('keeps Balance text still during the opening animation', async ({ page }) => {
  await prepareAuthenticatedPage(page, { responses });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await recordEntrances(page, {
    amount: { css: '[data-balance-summary] span', text: 'Current Balance' },
    topup: { css: '[role="dialog"] a[href="/balance/top-up"] span.text-sm' },
    promo: { css: '[data-balance-promocode] label' },
  });
  await page.goto('/balance', { waitUntil: 'domcontentloaded' });
  const names = ['amount', 'topup', 'promo'];
  await expect
    .poll(() =>
      page.evaluate(
        (names) => names.every((name) => (window.entranceFrames[name] ?? []).length > 20),
        names,
      ),
    )
    .toBe(true);
  const frames = await page.evaluate(() => window.entranceFrames);
  for (const name of names) {
    const tops = frames[name].filter((frame) => frame.opacity > 0.01).map((frame) => frame.top);
    expect(tops.length, name).toBeGreaterThan(5);
    expect(Math.max(...tops) - Math.min(...tops), name).toBeLessThanOrEqual(0.5);
  }
});

test('uses the same heading gap for Dashboard and related robot cards', async ({ page }) => {
  await prepareAuthenticatedPage(page, {
    responses: {
      ...responses,
      '/api/cabinet/info/support-config': { tickets_enabled: true, support_type: 'tickets' },
      '/api/cabinet/tickets': { items: [], total: 0 },
      '/api/cabinet/referral/terms': {
        ...(baseApiResponses['/api/cabinet/referral/terms'] as Record<string, unknown>),
        is_enabled: true,
      },
      '/api/cabinet/referral/list': { items: [], total: 0 },
      '/api/cabinet/referral/earnings': { items: [], total: 0 },
      '/api/cabinet/referral/partner/status': { partner_status: 'none' },
      '/api/cabinet/referral/withdrawal/balance': { is_withdrawal_enabled: false },
      '/api/cabinet/referral/withdrawal/history': { items: [], total: 0 },
    },
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [path, selector] of [
    ['/', '.subscription-hero'],
    ['/subscriptions/42', '.subscription-hero'],
    ['/support', '.cabinet-page-hero--support'],
    ['/profile', 'div:has(> .cabinet-page-hero--profile)'],
    ['/referral', '.cabinet-page-hero--referral'],
  ]) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expectHeadingGap(page, path, 'main h1', selector);
  }
});

for (const preference of ['no-preference', 'reduce'] as const) {
  test(`Dashboard card respects motion preference ${preference}`, async ({ page }) => {
    await prepareAuthenticatedPage(page, { responses });
    await page.emulateMedia({ reducedMotion: preference });
    await recordEntrances(page, { subscription: { css: 'main .subscription-hero' } });
    await page.goto('/');
    await expect(page.getByRole('region', { name: 'Subscription active' })).toBeVisible();
    if (preference === 'no-preference') {
      await expectFadeEntrance(page, 'subscription');
    } else {
      await expect
        .poll(() => page.evaluate(() => window.entranceFrames.subscription?.length ?? 0))
        .toBeGreaterThan(5);
      await expectStationary(page, ['subscription']);
    }
  });
}

async function expectHeadingGap(page: Page, path: string, heading: string, content: string) {
  await expect
    .poll(
      () =>
        page.evaluate(
          ({ heading, content }) => {
            const visibleBox = (selector: string) =>
              Array.from(document.querySelectorAll(selector), (element) =>
                element.getBoundingClientRect(),
              ).find((box) => box.height > 0);
            const titleBox = visibleBox(heading);
            const contentBox = visibleBox(content);
            return titleBox?.height && contentBox?.height ? contentBox.top - titleBox.bottom : null;
          },
          { heading, content },
        ),
      { message: path },
    )
    .toBeCloseTo(24, 0);
}

for (const { path, firstBlock, trial } of [
  { path: '/subscription/purchase', firstBlock: '[data-purchase-layout="classic"]' },
  {
    path: '/subscription/purchase?subscriptionId=42',
    firstBlock: '[data-purchase-layout="classic"]',
    trial: true,
  },
  { path: '/subscriptions/42/renew', firstBlock: '[data-renewal-panel]' },
  { path: '/gift', firstBlock: 'div:has(> [role="tablist"])' },
]) {
  const prepareCommerce = async (page: Page) => {
    const current = trial ? { ...subscription, is_trial: true } : subscription;
    await prepareAuthenticatedPage(page, {
      language: 'ru',
      featureFlags: { giftEnabled: true },
      responses: {
        ...responses,
        '/api/cabinet/branding/gift-enabled': { enabled: true },
        '/api/cabinet/subscription': {
          has_subscription: trial || path.includes('/renew'),
          subscription: trial || path.includes('/renew') ? current : null,
        },
        '/api/cabinet/subscriptions': {
          subscriptions: trial || path.includes('/renew') ? [current] : [],
          multi_tariff_enabled: false,
        },
        '/api/cabinet/subscription/purchase-options': classicPurchaseOptions,
        '/api/cabinet/gift/config': {
          is_enabled: true,
          tariffs: [1, 2].map((id) => ({
            id,
            name: 'Gift ' + id,
            description: null,
            traffic_limit_gb: 100,
            device_limit: 3,
            periods: [
              {
                days: 30,
                price_kopeks: 9900,
                price_label: '99 ₽',
                original_price_kopeks: null,
                discount_percent: null,
              },
            ],
          })),
          payment_methods: [],
          balance_kopeks: 0,
          currency_symbol: '₽',
        },
      },
    });
  };
  test(`uses a 24 px title gap on ${path}`, async ({ page }) => {
    await prepareCommerce(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    await expectHeadingGap(page, path, 'main h1', firstBlock);
  });

  test(`keeps commerce anchors still during the round trip to ${path}`, async ({ page }) => {
    await prepareCommerce(page);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const source =
      path === '/gift' ? '/profile' : trial || path.includes('/renew') ? '/subscriptions/42' : '/';
    const sourceCard =
      source === '/profile'
        ? 'div:has(> .cabinet-page-hero--profile)'
        : source === '/'
          ? '.subscription-hero--welcome'
          : '[data-subscription-overview] .subscription-hero';
    const option =
      path === '/gift'
        ? 'main [role="radiogroup"] [role="radio"]'
        : `main ${firstBlock} button.bento-card-hover`;
    await recordEntrances(page, {
      option: { css: option, path },
      heading: { css: 'main h1', path, inViewport: true },
      sourceHeading: { css: 'main h1', path: source, inViewport: true },
      commerce: { css: `main ${firstBlock}` },
      source: { css: `main ${sourceCard}` },
    });
    await page.goto(source);
    const originCard = page.locator(`main ${sourceCard}`).first();
    await waitForRestingGeometry(originCard);
    const title = await page.locator('main h1').boundingBox();
    const card = await originCard.boundingBox();
    if (!title || !card) throw new Error('Expected source heading and first block');
    const assertTop = async (name: string, top: number) => {
      const frames = await page.evaluate((name) => window.entranceFrames[name] ?? [], name);
      const visible = frames.filter(({ opacity }) => opacity > 0.01);
      expect(visible.length).toBeGreaterThan(0);
      expect(
        Math.max(...visible.map((frame) => Math.abs(frame.top - top))),
        name +
          ' expected ' +
          top +
          ' extremes ' +
          JSON.stringify([
            visible[0],
            visible.at(-1),
            visible.reduce((a, b) => (Math.abs(a.top - top) > Math.abs(b.top - top) ? a : b)),
          ]),
      ).toBeLessThanOrEqual(0.5);
    };

    const control = page.locator(`a[href="${path}"]:visible`).first();
    await control.scrollIntoViewIfNeeded();
    await clearEntrances(page);
    await control.click();
    await expect(page).toHaveURL(path);
    await expectFadeEntrance(page, 'commerce');
    await assertTop('heading', title.y);
    await assertTop('commerce', title.y + title.height + 24);
    await expectHeadingGap(page, path, 'main h1', firstBlock);
    const optionBox = await page.locator(option).first().boundingBox();
    if (!optionBox) throw new Error('Expected the first selectable card');
    await assertTop('option', optionBox.y);

    await clearEntrances(page);
    if (source === '/') {
      await page.goBack();
    } else {
      await page.getByRole('main').getByRole('link', { name: 'Назад', exact: true }).click();
    }
    await expect(page).toHaveURL(source);
    await expectFadeEntrance(page, 'source');
    await assertTop('sourceHeading', title.y);
    await assertTop('source', card.y);
    await expect(page.locator('main h1')).toBeVisible();
  });
}

const card = '[class~="border-dark-700/65"]';
const pageCard = `main ${card}`;
const pageTitle = 'main h1';
const otherPageGaps = [
  ['/subscriptions', pageTitle, 'main .grid-cols-1 > :first-child'],
  ['/balance', '[role="dialog"] div:has(> h2 + p)', '[data-balance-summary]'],
  ['/balance/saved-cards', pageTitle, pageCard],
  ['/balance/top-up', '[role="dialog"] h1', '[data-payment-method-card]'],
  [
    '/balance/top-up/test-card',
    '[role="dialog"] div:has(> h2 + p)',
    '[role="dialog"] div:has(> div + div > h3)',
  ],
  [
    '/connection',
    '[role="dialog"] div:has(> h2 + p)',
    '[role="dialog"] div:has(> p[aria-live] ~ h2)',
  ],
  ['/profile/accounts', 'main div:has(> h1 + p)', pageCard],
  ['/profile/notifications', pageTitle, pageCard],
  ['/referral/partner/apply', 'main header:has(h1)', 'main form .bento-card'],
  ['/referral/withdrawal/request', 'main header:has(h1)', 'main form .bento-card'],
  ['/contests', pageTitle, 'main .grid > div'],
  ['/polls', pageTitle, 'main .grid > div'],
  ['/info', pageTitle, 'main div:has(> nav[aria-label]), main div.flex-wrap.gap-2.pb-1'],
  ['/info/entrance', pageTitle, 'main .prose'],
  ['/news/anchors', 'main div:has(> h1)', 'main .prose'],
  ['/instructions', 'main header:has(h1)', 'main section[aria-labelledby]'],
  ['/instructions/connect-android', 'main header:has(h1)', 'main aside[aria-label]'],
  ['/wheel', pageTitle, pageCard],
] as const;

test.describe('page heading gaps throughout Custom Cabinet', () => {
  test.beforeEach(async ({ page }) => {
    await prepareAuthenticatedPage(page, {
      language: 'ru',
      featureFlags: { wheelEnabled: true },
      responses: {
        ...responses,
        ...informationEntranceResponses,
        '/api/cabinet/subscriptions': { subscriptions: [subscription], multi_tariff_enabled: true },
        '/api/cabinet/referral/withdrawal/balance': {
          ...informationEntranceResponses['/api/cabinet/referral/withdrawal/balance'],
          available_total: 200000,
          is_withdrawal_enabled: true,
          can_request: true,
        },
        '/api/cabinet/subscription/app-config': {
          hasSubscription: true,
          subscriptionUrl: subscription.subscription_url,
          hideLink: false,
          platformNames: { windows: { en: 'Windows' } },
          platforms: {
            windows: {
              displayName: { en: 'Windows' },
              apps: [
                { name: 'Test VPN', deepLink: 'testvpn://import/{subscriptionUrl}', blocks: [] },
              ],
            },
          },
        },
        '/api/cabinet/news/anchors': {
          id: 1,
          slug: 'anchors',
          title: 'Новость',
          content: '<p>Текст новости</p>',
          category: 'Updates',
          category_color: '#3b82f6',
          published_at: '2026-11-25T00:00:00Z',
          is_published: true,
          read_time_minutes: 1,
        },
        '/api/cabinet/wheel/config': wheelConfig,
        '/api/cabinet/wheel/history': { items: [], total: 0, page: 1, per_page: 10, pages: 0 },
        '/api/cabinet/contests': [
          { id: 1, slug: 'spacing', name: 'Contest', prize_days: 1, is_available: true },
        ],
        '/api/cabinet/polls': [
          { id: 1, title: 'Poll', total_questions: 1, answered_questions: 0, is_completed: false },
        ],
      },
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
  });

  for (const [path, heading, content] of otherPageGaps) {
    test(`uses the standard gap on ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expectHeadingGap(page, path, heading, content);
    });

    test(`keeps page anchors still on ${path} and after returning`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await recordEntrances(page, {
        heading: { css: heading, path },
        content: { css: content, path },
        dashboard: { css: 'main h1', text: 'Главная' },
        dashboardCard: { css: 'main .subscription-hero:not(.subscription-hero-loading)' },
      });
      const check = async () => {
        const anchors: number[] = [];
        await expectHeadingGap(page, path, heading, content);
        await expect
          .poll(() =>
            page.evaluate(() =>
              ['heading', 'content'].every(
                (name) =>
                  (window.entranceFrames[name] ?? []).filter(({ opacity }) => opacity > 0.01)
                    .length > 5,
              ),
            ),
          )
          .toBe(true);
        for (const name of ['heading', 'content']) {
          const frames = await page.evaluate((name) => window.entranceFrames[name], name);
          const tops = frames.filter(({ opacity }) => opacity > 0.01).map(({ top }) => top);
          expect(tops.length, name).toBeGreaterThan(0);
          expect(Math.max(...tops) - Math.min(...tops), name).toBeLessThanOrEqual(0.5);
          anchors.push(tops.at(-1) ?? 0);
        }
        return anchors;
      };
      await page.goto(path);
      const firstVisit = await check();
      await clearEntrances(page);
      if (
        (path.startsWith('/balance') && path !== '/balance/saved-cards') ||
        path === '/connection'
      ) {
        for (let step = 0; step < 3 && new URL(page.url()).pathname !== '/'; step++) {
          const previous = page.url();
          await page
            .getByRole('dialog')
            .getByRole('button', { name: 'Close', exact: true })
            .click();
          await expect(page).not.toHaveURL(previous);
        }
      } else if (path === '/referral/partner/apply' || path === '/referral/withdrawal/request') {
        await page.getByRole('button', { name: 'Отмена', exact: true }).click();
        await expect(page).toHaveURL('/referral');
        await page.getByRole('link', { name: 'Главная', exact: true }).click();
      } else {
        await page.getByRole('link', { name: 'Главная', exact: true }).click();
      }
      await expect.poll(() => new URL(page.url()).pathname).toBe('/');
      await expect(page.locator('main h1')).toBeVisible();
      await expect
        .poll(() => page.evaluate(() => window.entranceFrames.dashboard?.length ?? 0))
        .toBeGreaterThan(5);
      await expectStationary(page, ['dashboard']);
      await expect
        .poll(() => page.evaluate(() => window.entranceFrames.dashboardCard?.length ?? 0))
        .toBeGreaterThan(5);
      await expectStationary(page, ['dashboardCard'], true);
      await clearEntrances(page);
      if (path === '/balance' || path.startsWith('/balance/top-up') || path === '/connection') {
        await page.goto(path);
      } else {
        await page.goBack();
        if (new URL(page.url()).pathname !== path) await page.goto(path);
      }
      const revisited = await check();
      expect(Math.abs(revisited[0] - firstVisit[0])).toBeLessThanOrEqual(0.5);
      expect(Math.abs(revisited[1] - firstVisit[1])).toBeLessThanOrEqual(0.5);
    });
  }
});

test('uses the standard heading gap on the connection QR page', async ({ page }) => {
  await prepareQrWheel(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?sub=42', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Open QR code', exact: true }).click();
  await expect(page).toHaveURL(/\/connection\/qr$/);
  await expectHeadingGap(page, '/connection/qr', pageTitle, 'main .max-w-sm');
});

test('keeps Dashboard and Support aligned when switching pages', async ({ page }) => {
  await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/info/support-config': { tickets_enabled: true, support_type: 'tickets' },
      '/api/cabinet/tickets': { items: [], total: 0 },
    },
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/support');
  const getLayout = async (title: string, cardSelector: string) => {
    const heading = page.getByRole('heading', { name: title, level: 1, exact: true });
    const card = page.locator(cardSelector);
    await expect(heading).toBeVisible();
    await expect(card).toBeVisible();
    const titleBox = await heading.boundingBox();
    const cardBox = await card.boundingBox();
    if (!titleBox || !cardBox) throw new Error('The page heading and card must be measurable');
    return { titleX: titleBox.x, titleY: titleBox.y, cardX: cardBox.x, cardY: cardBox.y };
  };

  const support = await getLayout('Поддержка', '.cabinet-page-hero--support');
  await page.getByRole('link', { name: 'Главная', exact: true }).click();
  await expect(page).toHaveURL('/');
  const dashboard = await getLayout(
    'Главная',
    '.subscription-hero:not(.subscription-hero-loading)',
  );
  expect(dashboard).toEqual(support);

  await page.getByRole('link', { name: 'Поддержка', exact: true }).click();
  await expect(page).toHaveURL('/support');
  expect(await getLayout('Поддержка', '.cabinet-page-hero--support')).toEqual(support);
});

const dashboardCard = '.subscription-hero:not(.subscription-hero-loading)';
for (const [title, route, destinationCard, headingAnchor = destinationCard] of [
  ['Подписка', '/subscriptions/42', '[data-subscription-overview] .subscription-hero'],
  ['Поддержка', '/support', '.cabinet-page-hero--support'],
  ['Профиль', '/profile', 'div:has(> .cabinet-page-hero--profile)', '.cabinet-page-hero--profile'],
  ['Реферальная программа', '/referral', '.cabinet-page-hero--referral'],
] as const) {
  test(`keeps both top edges still during the animated Dashboard round trip to ${route}`, async ({
    page,
  }) => {
    await prepareAuthenticatedPage(page, {
      language: 'ru',
      featureFlags: { referralEnabled: true },
      responses: {
        ...responses,
        ...informationEntranceResponses,
        '/api/cabinet/info/support-config': { tickets_enabled: true, support_type: 'tickets' },
        '/api/cabinet/tickets': { items: [], total: 0 },
      },
    });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    const home = `${dashboardCard}:not([data-subscription-overview] *)`;
    const destination = `main ${destinationCard}`;
    await recordEntrances(page, {
      homeHeading: { css: `main:has(${home}) h1` },
      homeCard: { css: `main ${home}` },
      destinationHeading: { css: `main:has(${headingAnchor}) h1` },
      destinationCard: { css: destination },
    });

    await page.goto('/');
    await expect(page.locator(home)).toBeVisible();
    const headingTop = (await page.locator('main h1').boundingBox())?.y;
    const cardTop = (await page.locator(home).boundingBox())?.y;
    if (headingTop === undefined || cardTop === undefined)
      throw new Error('Dashboard must render its heading and card before navigation');

    const openDestination =
      route === '/subscriptions/42'
        ? page.getByRole('button', { name: 'Управление подпиской', exact: true })
        : page.locator(`a[href="${route}"]:visible:not([data-dashboard-promo-slide])`).first();
    for (const [control, path, heading, headingFrame, cardFrame] of [
      [openDestination, route, title, 'destinationHeading', 'destinationCard'],
      [
        page.getByRole('link', { name: 'Главная', exact: true }),
        '/',
        'Главная',
        'homeHeading',
        'homeCard',
      ],
    ] as const) {
      await clearEntrances(page);
      await control.click();
      await expect(page).toHaveURL(path);
      await expect(
        page.getByRole('heading', { name: heading, level: 1, exact: true }),
      ).toBeVisible();
      await expectFadeEntrance(page, cardFrame);
      const frames = await page.evaluate(() => window.entranceFrames);
      for (const [name, top] of [
        [headingFrame, headingTop],
        [cardFrame, cardTop],
      ] as const) {
        const visible = frames[name].filter(({ opacity }) => opacity > 0.01);
        expect(visible.length).toBeGreaterThan(0);
        expect(
          Math.max(...visible.map((frame) => Math.abs(frame.top - top))),
          `${path}: visible ${name} displacement`,
        ).toBeLessThanOrEqual(0.5);
      }
    }
  });
}
