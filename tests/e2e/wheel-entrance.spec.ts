import { expect, test } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { prepareQrWheel, wheelGraphic, wheelTargets } from './qrWheelFixture';
import {
  clearEntrances,
  expectEntrance,
  expectNoEntranceErrors,
  expectStationary,
  recordEntrances,
  waitForRestingGeometry,
} from './entranceProbe';

test.afterEach(async ({ page }, info) => {
  expectNoEntranceErrors(page);
  const frames = await page.evaluate(() => window.entranceFrames ?? {});
  const summary = Object.fromEntries(
    Object.entries(frames).map(([name, samples]) => [
      name,
      {
        count: samples.length,
        minOpacity: Math.min(...samples.map((sample) => sample.opacity)),
        maxY: Math.max(...samples.map((sample) => sample.y)),
      },
    ]),
  );
  const file = info.outputPath('entrance-frames.json');
  const heading = await page.locator('main h1').textContent();
  writeFileSync(file, JSON.stringify({ url: page.url(), heading, summary, frames }, null, 2));
  await info.attach('entrance-frames.json', { path: file, contentType: 'application/json' });
});

test('Wheel header enters while loading and complete ready sections enter after late data without replay on refresh', async ({
  page,
}) => {
  const fixture = await prepareQrWheel(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await recordEntrances(page, wheelTargets);
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/cabinet/wheel/config', async (route) => {
    await gate;
    await route.fallback();
  });
  try {
    await page.goto('/wheel');
    await page.getByRole('heading', { name: 'Fortune Wheel', exact: true }).waitFor();
    await expect(page.locator(wheelGraphic)).toHaveCount(0);
    await expectEntrance(page, 'header');
    await waitForRestingGeometry(page.locator('main h1'));
    await clearEntrances(page);
  } finally {
    release();
  }
  await expect(page.locator(wheelGraphic)).toBeVisible();
  await expectEntrance(page, 'wheel');
  await expectEntrance(page, 'history');
  await page.waitForTimeout(900);
  await expectStationary(page, ['header']);
  await clearEntrances(page);
  const reads = fixture.apiRequests.filter(
    (request) => request === 'GET /api/cabinet/wheel/config',
  ).length;
  await page.evaluate(() => {
    window.dispatchEvent(new Event('offline'));
    window.dispatchEvent(new Event('online'));
  });
  await expect
    .poll(
      () =>
        fixture.apiRequests.filter((request) => request === 'GET /api/cabinet/wheel/config').length,
    )
    .toBeGreaterThan(reads);
  await page.waitForTimeout(700);
  await expectStationary(page, ['header', 'wheel', 'history']);
  await page.getByRole('main').getByRole('link', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL('/profile');
  await page.getByRole('heading', { name: 'Profile', exact: true }).waitFor();
  await waitForRestingGeometry(page.locator('main h1'));
  await clearEntrances(page);
  await page.goBack();
  await expect(page).toHaveURL('/wheel');
  await expectEntrance(page, 'wheel');
  expect(
    fixture.apiRequests.filter(
      (request) => request.startsWith('POST ') && request.includes('/wheel/'),
    ),
  ).toEqual([]);
  expect([...fixture.unexpectedApiRequests]).toEqual([]);
});

test('late Wheel sections appear immediately without movement in reduced motion', async ({
  page,
}) => {
  const fixture = await prepareQrWheel(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await recordEntrances(page, wheelTargets);
  let release = () => {};
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/cabinet/wheel/config', async (route) => {
    await gate;
    await route.fallback();
  });
  try {
    await page.goto('/wheel');
    await page.getByRole('heading', { name: 'Fortune Wheel', exact: true }).waitFor();
    await page.waitForTimeout(500);
  } finally {
    release();
  }
  await expect(page.locator(wheelGraphic)).toBeVisible();
  await page.waitForTimeout(500);
  await expectStationary(page, ['header', 'wheel', 'history']);
  expect([...fixture.unexpectedApiRequests]).toEqual([]);
});
