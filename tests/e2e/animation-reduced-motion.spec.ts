import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { dashboardEntranceTargets, prepareEntranceDashboard } from './dashboardEntranceFixture';
import { expectStationary, recordEntrances, expectNoEntranceErrors } from './entranceProbe';
import { informationEntranceResponses } from './informationEntranceFixture';

test.afterEach(({ page }) => expectNoEntranceErrors(page));

for (const route of [
  '/profile',
  '/profile/notifications',
  '/profile/accounts',
  '/balance/saved-cards',
  '/instructions',
  '/info',
  '/info/entrance',
  '/referral',
  '/contests',
  '/polls',
]) {
  test(`reduced motion disables the complete page lift on ${route}`, async ({ page }) => {
    const fixture = await prepareAuthenticatedPage(page, {
      responses: {
        ...informationEntranceResponses,
        '/api/cabinet/contests': [],
        '/api/cabinet/polls': [],
        '/api/cabinet/branding/telegram-widget': { enabled: false, bot_username: null },
      },
    });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await recordEntrances(page, {
      heading: { css: 'main h1' },
      content: { css: 'main > div > div:nth-child(2)' },
    });
    await page.goto(route);
    await expect(page.locator('main h1').filter({ visible: true }).first()).toBeVisible();
    await page.waitForTimeout(1400);
    await expectStationary(page, route === '/info' ? ['heading'] : ['heading', 'content'], true);
    expect([...fixture.unexpectedApiRequests]).toEqual([]);
  });
}

test('reduced motion covers independent news and pending-gift animations as well as inherited entrances', async ({
  page,
}) => {
  const fixture = await prepareEntranceDashboard(page);
  await page.route('**/api/cabinet/gift/pending', (route) =>
    route.fulfill({
      json: [
        {
          token: 'entrance-gift',
          tariff_name: 'Local gift',
          period_days: 30,
          gift_message: null,
          sender_display: null,
          created_at: null,
        },
      ],
    }),
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const targets = {
    ...dashboardEntranceTargets,
    gift: { css: 'main a[href*="code=entrance-gift"]', closest: '.relative.overflow-hidden' },
    newsHeader: { css: 'main section:has(article) .mb-8' },
    newsCard: { css: 'main section article' },
  };
  await recordEntrances(page, targets);
  await page.goto('/');
  await expect(page.locator('main section article')).toHaveCount(2);
  await page.waitForTimeout(1400);
  await expectStationary(page, Object.keys(targets), true);
  expect([...fixture.unexpectedApiRequests]).toEqual([]);
});
