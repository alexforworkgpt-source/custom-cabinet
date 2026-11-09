import { expect, test } from '@playwright/test';
import { prepareQrWheel, qrTargets } from './qrWheelFixture';
import {
  clearEntrances,
  expectEntrance,
  expectNoEntranceErrors,
  expectStationary,
  recordEntrances,
  waitForRestingGeometry,
} from './entranceProbe';

test.afterEach(({ page }) => expectNoEntranceErrors(page));

test('the complete QR block and its header enter on opening and reopening', async ({
  page,
}, info) => {
  const fixture = await prepareQrWheel(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await recordEntrances(page, qrTargets);
  await page.goto('/?sub=42');
  const openQr = page.getByRole('button', { name: 'Open QR code', exact: true });
  await openQr.waitFor();
  for (let entry = 0; entry < 2; entry++) {
    await clearEntrances(page);
    await openQr.click();
    await expect(
      page.getByRole('heading', { name: 'Subscription QR Code', exact: true }),
    ).toBeVisible();
    await expect(page.locator(qrTargets.qr.css)).toBeVisible();
    await expectEntrance(page, 'qr');
    await expectEntrance(page, 'header');
    await waitForRestingGeometry(page.locator(qrTargets.qr.css));
    await clearEntrances(page);
    await page.waitForTimeout(300);
    await expectStationary(page, ['qr', 'header']);
    if (entry === 0)
      await page.screenshot({ path: info.outputPath('qr-ready.png'), fullPage: false });
    await page.getByRole('link', { name: 'Back', exact: true }).click();
    await expect(page).toHaveURL('/?sub=42');
    await openQr.waitFor();
  }
  expect([...fixture.unexpectedApiRequests]).toEqual([]);
});

test('the QR content is immediately stationary with reduced motion', async ({ page }) => {
  const fixture = await prepareQrWheel(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await recordEntrances(page, qrTargets);
  await page.goto('/?sub=42');
  await page.getByRole('button', { name: 'Open QR code', exact: true }).waitFor();
  await clearEntrances(page);
  await page.getByRole('button', { name: 'Open QR code', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Subscription QR Code', exact: true }),
  ).toBeVisible();
  await page.waitForTimeout(500);
  await expectStationary(page, ['qr', 'header']);
  expect([...fixture.unexpectedApiRequests]).toEqual([]);
});
