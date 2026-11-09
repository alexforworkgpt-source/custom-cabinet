import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import {
  clearEntrances,
  expectEntrance,
  expectStationary,
  recordEntrances,
  expectNoEntranceErrors,
} from './entranceProbe';

test.afterEach(({ page }) => expectNoEntranceErrors(page));
import { informationEntranceResponses } from './informationEntranceFixture';

for (const feature of ['contests', 'polls'])
  test(`${feature} ready list enters independently of loading and re-enters on return`, async ({
    page,
  }) => {
    const fixture = await prepareAuthenticatedPage(page, {
      responses: {
        '/api/cabinet/contests': [
          {
            id: 1,
            slug: 'entrance',
            name: 'Entrance contest',
            description: 'Local fixture',
            prize_days: 1,
            is_available: true,
            already_played: false,
          },
        ],
        '/api/cabinet/polls': [
          {
            id: 1,
            response_id: 1,
            title: 'Entrance poll',
            description: 'Local fixture',
            total_questions: 1,
            answered_questions: 0,
            is_completed: false,
            reward_amount: null,
          },
        ],
      },
    });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await recordEntrances(page, { heading: { css: 'main h1' }, list: { css: 'main .grid > div' } });
    let release = () => {};
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(`**/api/cabinet/${feature}`, async (route) => {
      await gate;
      await route.fallback();
    });
    try {
      await page.goto(`/${feature}`);
      await expect(page.locator('main h1')).toBeVisible();
      await expectEntrance(page, 'heading');
      await page.waitForTimeout(700);
      await clearEntrances(page);
    } finally {
      release();
    }
    await expectEntrance(page, 'list');
    await page.waitForTimeout(700);
    await expectStationary(page, ['heading']);
    await page.getByRole('main').getByRole('link', { name: 'Back', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
    await clearEntrances(page);
    await page.goBack();
    await expectEntrance(page, 'list');
    expect([...fixture.unexpectedApiRequests]).toEqual([]);
  });

for (const feature of ['contests', 'polls'])
  test(`${feature} loaded empty state enters without animating its skeleton`, async ({ page }) => {
    await prepareAuthenticatedPage(page, { responses: { [`/api/cabinet/${feature}`]: [] } });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await recordEntrances(page, { empty: { css: 'main .py-12.text-center' } });
    await page.goto(`/${feature}`);
    await expectEntrance(page, 'empty');
  });

for (const item of [
  { route: '/info', content: 'main nav[aria-label="Information"], main div.flex-wrap.gap-2.pb-1' },
  { route: '/info/entrance', content: 'main .prose' },
  { route: '/referral', content: 'main h1 + .grid > div' },
])
  test(`complete heading and ready section enter on ${item.route}`, async ({ page }) => {
    const fixture = await prepareAuthenticatedPage(page, {
      responses: informationEntranceResponses,
      featureFlags: { referralEnabled: true },
    });
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await recordEntrances(page, { heading: { css: 'main h1' }, content: { css: item.content } });
    await page.goto(item.route);
    await expectEntrance(page, 'heading');
    await expectEntrance(page, 'content');
    await page.waitForTimeout(1200);
    await clearEntrances(page);
    await page.evaluate(() => {
      window.dispatchEvent(new Event('offline'));
      window.dispatchEvent(new Event('online'));
    });
    await page.waitForTimeout(700);
    await expectStationary(page, ['heading', 'content']);
    await page
      .locator('header a[href="/profile"]')
      .first()
      .evaluate((link: HTMLAnchorElement) => link.click());
    await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
    await clearEntrances(page);
    await page.goBack();
    await expectEntrance(page, 'heading');
    await expectEntrance(page, 'content');
    expect([...fixture.unexpectedApiRequests]).toEqual([]);
  });
