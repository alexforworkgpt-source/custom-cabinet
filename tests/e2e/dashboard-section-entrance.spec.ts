import { expect, test } from '@playwright/test';
import { dashboardEntranceTargets, prepareEntranceDashboard } from './dashboardEntranceFixture';
import {
  clearEntrances,
  expectEntrance,
  expectStationary,
  recordEntrances,
  expectNoEntranceErrors,
} from './entranceProbe';

test.afterEach(({ page }) => expectNoEntranceErrors(page));

test('complete optional Dashboard sections enter after late data, re-enter on return, and stay mounted on refresh', async ({
  page,
}) => {
  const fixture = await prepareEntranceDashboard(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await recordEntrances(page, dashboardEntranceTargets);
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/cabinet/**', async (route) => {
    if (
      /\/(promo\/(active-discount|offers)|reminders\/active|news)$/.test(
        new URL(route.request().url()).pathname,
      )
    )
      await gate;
    await route.fallback();
  });
  try {
    await page.goto('/');
    await expect(page.locator('main label:has(select)')).toBeVisible();
    await page.waitForTimeout(700);
    await expect(page.locator('[data-promo-active-discount]')).toHaveCount(0);
  } finally {
    release();
  }
  for (const name of Object.keys(dashboardEntranceTargets)) await expectEntrance(page, name);
  await page.waitForTimeout(1400);
  await page
    .getByRole('link', { name: 'Profile', exact: true })
    .filter({ visible: true })
    .first()
    .click();
  await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
  await page.waitForTimeout(700);
  await clearEntrances(page);
  await page.goBack();
  await expect(page.locator('[data-promo-active-discount]')).toBeVisible();
  for (const name of Object.keys(dashboardEntranceTargets)) await expectEntrance(page, name);
  await page.waitForTimeout(1400);
  const reads = fixture.apiRequests.length;
  await clearEntrances(page);
  await page.evaluate(() => {
    window.dispatchEvent(new Event('offline'));
    window.dispatchEvent(new Event('online'));
  });
  await expect.poll(() => fixture.apiRequests.length).toBeGreaterThan(reads);
  await page.waitForTimeout(700);
  await expectStationary(page, Object.keys(dashboardEntranceTargets));
  expect([...fixture.unexpectedApiRequests]).toEqual([]);
  if ([375, 1280].includes(page.viewportSize()?.width ?? 0)) {
    await page.screenshot({ path: test.info().outputPath('dashboard-ready.png'), fullPage: true });
  }
});
