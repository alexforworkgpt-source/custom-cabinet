import { expect, test } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { prepareQrWheel, wheelGraphic } from './qrWheelFixture';
import { mainNavigation } from './mobileNavigationFixture';

for (const theme of ['light', 'dark'])
  test(`the larger wheel fits its card and keeps controls reachable in ${theme}`, async ({
    page,
  }, info) => {
    const fixture = await prepareQrWheel(page);
    await page.addInitScript((theme) => localStorage.setItem('cabinet-theme', theme), theme);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/wheel');
    const graphic = page.locator(wheelGraphic);
    await graphic.waitFor();
    const box = await graphic.boundingBox();
    if (!box) throw new Error('The wheel must be rendered');
    const width = page.viewportSize()?.width ?? 1280;
    const minimum = width < 360 ? 240 : width < 640 ? 280 : 420;
    expect(box.width).toBeGreaterThanOrEqual(minimum);
    expect(Math.abs(box.width - box.height)).toBeLessThanOrEqual(1);
    expect(box.x).toBeGreaterThanOrEqual(16);
    expect(box.x + box.width).toBeLessThanOrEqual(width - 16);
    const insideCard = await graphic.evaluate((svg) => {
      const card = svg.closest('div.relative.overflow-hidden');
      const pointer = card?.querySelector('svg[viewBox="0 0 44 56"]');
      if (!card || !pointer) return false;
      const bounds = card.getBoundingClientRect();
      return [svg, pointer].every((element) => {
        const rect = element.getBoundingClientRect();
        return (
          rect.x >= bounds.x &&
          rect.right <= bounds.right &&
          rect.y >= bounds.y &&
          rect.bottom <= bounds.bottom
        );
      });
    });
    expect(insideCard).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    writeFileSync(
      info.outputPath('wheel-layout.json'),
      JSON.stringify({ theme, viewport: page.viewportSize(), wheel: box }, null, 2),
    );
    await page.screenshot({ path: info.outputPath(`larger-wheel-${theme}.png`), fullPage: false });
    const spin = page.getByRole('button', { name: 'SPIN!', exact: true });
    await spin.evaluate((button) =>
      button.scrollIntoView({ block: 'center', behavior: 'instant' }),
    );
    if (width < 1024) {
      const [control, navigation] = await Promise.all([
        spin.boundingBox(),
        mainNavigation(page).boundingBox(),
      ]);
      if (!control || !navigation)
        throw new Error('The spin control and navigation must remain rendered');
      expect(control.y + control.height).toBeLessThanOrEqual(navigation.y - 8);
    }
    await expect(spin).toBeDisabled();
    expect(
      fixture.apiRequests.filter(
        (request) => request.startsWith('POST ') && request.includes('/wheel/'),
      ),
    ).toEqual([]);
    expect([...fixture.unexpectedApiRequests]).toEqual([]);
  });
