import { expect, test } from '@playwright/test';
import {
  mainNavigation,
  mobileNavigationResponses,
  prepareMobileNavigation,
} from './mobileNavigationFixture';
import { responses } from './classicRenewalFixture';

for (const path of [
  '/subscriptions/42/renew',
  '/referral/partner/apply',
  '/referral/withdrawal/request',
  '/balance',
  '/balance/top-up',
  '/balance/top-up/test-card',
  '/balance/top-up/result?status=success',
  '/balance/top-up/result/test-card?status=success',
  '/gift/result?token=navigation-result',
])
  test(`action screen ${path} does not acquire a mobile panel`, async ({ page }) => {
    const fixture = await prepareMobileNavigation(page, {
      ...responses,
      '/api/cabinet/referral/withdrawal/balance': {
        ...mobileNavigationResponses['/api/cabinet/referral/withdrawal/balance'],
        can_request: true,
        available_total: 500000,
      },
      '/api/cabinet/gift/purchase/navigation-result': {
        status: 'failed',
        is_gift: true,
        is_code_only: false,
        is_claimable: false,
        purchase_token: 'navigation-result',
        recipient_contact_value: null,
        gift_message: null,
        tariff_name: null,
        period_days: null,
        warning: null,
      },
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(path);
    if (path.startsWith('/balance') && !path.includes('/result'))
      await page.getByRole('dialog').waitFor();
    else await page.getByRole('heading', { level: 1 }).filter({ visible: true }).first().waitFor();
    await expect(page).toHaveURL(path);
    if ((page.viewportSize()?.width ?? 1280) < 1024)
      await expect(mainNavigation(page)).toHaveCount(0);
    expect([...fixture.unexpectedApiRequests]).toEqual([]);
  });

test('focusing a text field hides the mobile panel and cancelling restores it without losing navigation', async ({
  page,
}) => {
  const fixture = await prepareMobileNavigation(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/support');
  await page.getByRole('button', { name: 'New Ticket', exact: true }).waitFor();
  const navigation = mainNavigation(page);
  await expect(navigation).toBeVisible();
  await page.getByRole('button', { name: 'New Ticket', exact: true }).click();
  await page.getByLabel('Subject', { exact: true }).fill('Local navigation check');
  if ((page.viewportSize()?.width ?? 1280) < 1024) {
    await expect(navigation).toHaveCSS('opacity', '0');
    await expect(navigation).toHaveCSS('pointer-events', 'none');
  }
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(navigation).toHaveCSS('opacity', '1');
  await navigation.getByRole('link', { name: 'Profile', exact: true }).click();
  await expect(page).toHaveURL('/profile');
  expect(fixture.apiRequests.filter((request) => request === 'POST /api/cabinet/tickets')).toEqual(
    [],
  );
  expect([...fixture.unexpectedApiRequests]).toEqual([]);
});

test('the end of a long article stays above the mobile panel and remains clickable', async ({
  page,
}) => {
  const base = mobileNavigationResponses['/api/cabinet/info-pages/entrance'];
  await prepareMobileNavigation(page, {
    '/api/cabinet/info-pages/entrance': {
      ...base,
      content: {
        en:
          '<p>Local reading content.</p>'.repeat(60) +
          '<p><a href="/profile">End of navigation article</a></p>',
      },
    },
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/info/entrance');
  const last = page.getByRole('main').getByRole('link', { name: 'End of navigation article' });
  await last.waitFor();
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  if ((page.viewportSize()?.width ?? 1280) < 1024) {
    const [link, nav] = await Promise.all([last.boundingBox(), mainNavigation(page).boundingBox()]);
    if (!link || !nav) throw new Error('The article exit and navigation must both be rendered');
    expect(link.y + link.height).toBeLessThanOrEqual(nav.y - 8);
  }
  await page
    .context()
    .route('**/profile', (route) =>
      route.fulfill({ contentType: 'text/html', body: '<h1>Navigation destination</h1>' }),
    );
  const opened = page.waitForEvent('popup');
  await last.click();
  const destination = await opened;
  await expect(destination).toHaveURL(/\/profile$/);
  await destination.close();
});

test('opening a poll keeps the global panel out of the action and restores it on close', async ({
  page,
}) => {
  const fixture = await prepareMobileNavigation(page, {
    '/api/cabinet/polls': [
      {
        id: 1,
        response_id: 1,
        title: 'Navigation poll',
        description: null,
        total_questions: 1,
        answered_questions: 0,
        is_completed: false,
        reward_amount: null,
      },
    ],
    '/api/cabinet/polls/1/start': {
      response_id: 1,
      current_question_index: 0,
      total_questions: 1,
      question: {
        id: 1,
        text: 'Local question',
        order: 0,
        options: [{ id: 1, text: 'Local answer', order: 0 }],
      },
    },
  });
  await page.goto('/polls');
  await page.getByRole('button', { name: 'Start', exact: true }).waitFor();
  await expect(mainNavigation(page)).toBeVisible();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Local question', { exact: true })).toBeVisible();
  if ((page.viewportSize()?.width ?? 1280) < 1024)
    await expect(mainNavigation(page)).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(mainNavigation(page)).toBeVisible();
  expect([...fixture.unexpectedApiRequests]).toEqual([]);
});

test('a contest game keeps the global panel out of the action and restores it on close', async ({
  page,
}) => {
  const fixture = await prepareMobileNavigation(page, {
    '/api/cabinet/contests': [
      {
        id: 1,
        slug: 'navigation',
        name: 'Navigation game',
        description: null,
        prize_days: 1,
        is_available: true,
        already_played: false,
      },
    ],
    '/api/cabinet/contests/1': {
      round_id: 1,
      game_type: 'blitz',
      game_data: { button_text: 'Local action' },
      instructions: 'Local game instructions',
    },
  });
  await page.goto('/contests');
  await page.getByRole('button', { name: 'Play', exact: true }).waitFor();
  await page.getByRole('button', { name: 'Play', exact: true }).click();
  await expect(page.getByText('Local game instructions', { exact: true })).toBeVisible();
  if ((page.viewportSize()?.width ?? 1280) < 1024)
    await expect(mainNavigation(page)).toHaveCount(0);
  await page
    .getByRole('heading', { name: 'Navigation game', level: 2 })
    .locator('..')
    .getByRole('button')
    .click();
  await expect(mainNavigation(page)).toBeVisible();
  expect([...fixture.unexpectedApiRequests]).toEqual([]);
});

test('VPN setup and its QR page retain their own return without a mobile panel', async ({
  page,
}) => {
  const fixture = await prepareMobileNavigation(page, {
    ...responses,
    '/api/cabinet/subscription/connection-link': {
      subscription_url: 'https://example.test/navigation',
      display_link: 'https://example.test/navigation',
      connect_mode: 'plain',
      hide_link: false,
    },
    '/api/cabinet/subscription/app-config': {
      platformNames: { windows: { en: 'Windows' } },
      hasSubscription: true,
      subscriptionUrl: 'https://example.test/navigation',
      hideLink: false,
      baseSettings: { isShowTutorialButton: false, tutorialUrl: '' },
      uiConfig: { installationGuidesBlockType: 'cards' },
      platforms: {
        windows: {
          displayName: { en: 'Windows' },
          apps: [{ name: 'Test App', featured: true, blocks: [] }],
        },
      },
    },
  });
  const setupPath = '/connection?sub=42&platform=windows&app=Test+App&step=add';
  await page.goto(setupPath);
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Open QR code', exact: true })
    .waitFor();
  if ((page.viewportSize()?.width ?? 1280) < 1024)
    await expect(mainNavigation(page)).toHaveCount(0);
  await page.getByRole('dialog').getByRole('button', { name: 'Open QR code', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Subscription QR Code', exact: true }),
  ).toBeVisible();
  if ((page.viewportSize()?.width ?? 1280) < 1024)
    await expect(mainNavigation(page)).toHaveCount(0);
  await page.getByRole('link', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(setupPath);
  expect([...fixture.unexpectedApiRequests]).toEqual([]);
});
