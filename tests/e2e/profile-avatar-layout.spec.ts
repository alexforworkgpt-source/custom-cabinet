import { expect, test } from '@playwright/test';
import { avatarUser, prepareAvatarPage } from './profileAvatarFixture';
import { mainNavigation } from './mobileNavigationFixture';

for (const theme of ['light', 'dark']) {
  for (const state of ['photo', 'initials']) {
    test(`Profile identity fits long names in ${theme} with ${state}`, async ({ page }, info) => {
      const fixture = await prepareAvatarPage(page, {
        user: {
          ...avatarUser,
          first_name: 'Александр Константинович',
          last_name: 'Серебряков-Воскресенский',
          username: 'profile_user_with_a_very_long_username_123456789',
        },
        photoUrl: state === 'photo' ? '/profile-avatar-fixture.svg' : null,
      });
      await page.addInitScript((theme) => localStorage.setItem('cabinet-theme', theme), theme);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto('/profile');
      const picture = page.getByRole('img', { name: 'Profile picture', exact: true });
      const name = page.getByRole('heading', {
        name: 'Александр Константинович Серебряков-Воскресенский',
        level: 2,
      });
      await name.waitFor();
      if (state === 'photo') {
        await expect
          .poll(() =>
            picture
              .locator('img')
              .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
          )
          .toBe(true);
        await expect(picture.locator('img')).toHaveCSS('opacity', '1');
      } else {
        await expect(picture).toContainText('АС');
      }
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      const [photoBox, nameBox] = await Promise.all([picture.boundingBox(), name.boundingBox()]);
      if (!photoBox || !nameBox) throw new Error('The identity header must remain visible');
      const size = (page.viewportSize()?.width ?? 1280) < 640 ? 56 : 64;
      expect(photoBox.width).toBe(size);
      expect(photoBox.height).toBe(size);
      expect(nameBox.x).toBeGreaterThanOrEqual(photoBox.x + photoBox.width + 8);
      expect(nameBox.x + nameBox.width).toBeLessThanOrEqual(
        (page.viewportSize()?.width ?? 1280) - 16,
      );
      await expect(
        page.getByText('@profile_user_with_a_very_long_username_123456789', { exact: true }),
      ).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await expect(
        mainNavigation(page).getByRole('link', { name: 'Profile', exact: true }),
      ).toHaveAttribute('aria-current', 'page');
      await page.screenshot({
        path: info.outputPath(`profile-${theme}-${state}.png`),
        fullPage: false,
      });
      expect([...fixture.unexpectedApiRequests]).toEqual([]);
    });
  }
}
