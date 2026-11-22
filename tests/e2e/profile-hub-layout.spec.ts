import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

for (const wheelEnabled of [false, true]) {
  test(`profile fills the row with optional features ${wheelEnabled ? 'enabled' : 'disabled'}`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await prepareAuthenticatedPage(page, {
      featureFlags: { wheelEnabled },
      responses: {
        '/api/cabinet/wheel/config': { is_enabled: wheelEnabled },
      },
    });
    await page.goto('/profile', { waitUntil: 'domcontentloaded' });

    const main = page.getByRole('main');
    const preferences = main
      .getByRole('heading', { name: 'Preferences', exact: true })
      .locator('..');
    const information = main
      .getByRole('heading', { name: 'Information', exact: true })
      .locator('..');
    const features = main.getByRole('heading', { name: 'More features' }).locator('..');
    await expect(preferences).toBeVisible();
    await expect(information).toBeVisible();
    await expect(features).toHaveCount(wheelEnabled ? 1 : 0);

    const settingsBox = await preferences.boundingBox();
    const informationBox = await information.boundingBox();
    if (!settingsBox || !informationBox) throw new Error('Both profile cards must be measurable');

    const wide = (page.viewportSize()?.width ?? 0) >= 1024;
    expect(Math.abs(settingsBox.x - informationBox.x)).toBeLessThanOrEqual(1);
    if (wheelEnabled && wide) {
      const featuresBox = await features.boundingBox();
      if (!featuresBox) throw new Error('Feature card must be measurable');
      expect(Math.abs(settingsBox.y - featuresBox.y)).toBeLessThanOrEqual(1);
      expect(featuresBox.x).toBeGreaterThan(settingsBox.x + settingsBox.width);
      expect(
        Math.abs(featuresBox.x + featuresBox.width - informationBox.x - informationBox.width),
      ).toBeLessThanOrEqual(1);
    } else {
      expect(Math.abs(settingsBox.width - informationBox.width)).toBeLessThanOrEqual(1);
      if (wheelEnabled) {
        const featuresBox = await features.boundingBox();
        if (!featuresBox) throw new Error('Feature card must be measurable');
        expect(featuresBox.y).toBeGreaterThan(settingsBox.y + settingsBox.height);
        expect(Math.abs(featuresBox.width - informationBox.width)).toBeLessThanOrEqual(1);
      }
    }
  });
}
