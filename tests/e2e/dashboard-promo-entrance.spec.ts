import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

declare global {
  interface Window {
    __promoEntranceSamples: { opacity: number; y: number }[];
  }
}

test('the complete promo banner enters after delayed data and does not re-enter on slide changes', async ({
  page,
}) => {
  await prepareAuthenticatedPage(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(recordEntrance);
  let release = () => {};
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/api/cabinet/auth/account/linked-providers', async (route) => {
    await held;
    await route.fallback();
  });
  const carousel = page.getByRole('region', { name: 'Recommended actions' });
  try {
    await page.goto('/');
    await page
      .getByRole('link', { name: /Balance/ })
      .first()
      .waitFor();
    await expect(carousel).toHaveCount(0);
    // Let the other page sections finish entering before the banner becomes ready.
    await page.waitForTimeout(500);
  } finally {
    release();
  }
  await carousel.waitFor({ state: 'visible' });
  await expect
    .poll(() => page.evaluate(() => window.__promoEntranceSamples.length))
    .toBeGreaterThan(0);
  await expect.poll(() => carousel.evaluate(isEntering)).toBe(false);
  await page.evaluate(() => {
    window.__promoEntranceSamples.length = 0;
  });
  await carousel.getByRole('button', { name: /Show slide 2 of/ }).click();
  await expect(carousel.locator('[data-dashboard-promo-slide]')).toHaveAttribute(
    'data-dashboard-promo-slide',
    'tariff',
  );
  await page.waitForTimeout(450);
  expect(await page.evaluate(() => window.__promoEntranceSamples)).toEqual([]);
});

function recordEntrance() {
  window.__promoEntranceSamples = [];
  const sample = () => {
    let element = document.querySelector<HTMLElement>('[data-dashboard-promo-carousel]');
    while (element?.closest('main')) {
      const style = getComputedStyle(element);
      const y = style.transform === 'none' ? 0 : new DOMMatrix(style.transform).m42;
      if (Number(style.opacity) < 1 && y > 0 && y <= 8) {
        window.__promoEntranceSamples.push({ opacity: Number(style.opacity), y });
      }
      element = element.parentElement;
    }
    requestAnimationFrame(sample);
  };
  requestAnimationFrame(sample);
}

function isEntering(region: HTMLElement | SVGElement) {
  let element: Element | null = region;
  while (element?.closest('main')) {
    const style = getComputedStyle(element);
    if (
      Number(style.opacity) < 1 ||
      (style.transform !== 'none' && new DOMMatrix(style.transform).m42 !== 0)
    )
      return true;
    element = element.parentElement;
  }
  return false;
}

test('the promo banner appears without entrance movement when reduced motion is enabled', async ({
  page,
}) => {
  await prepareAuthenticatedPage(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(recordEntrance);
  await page.goto('/');
  const carousel = page.getByRole('region', { name: 'Recommended actions' });
  await carousel.waitFor({ state: 'visible' });
  await page.waitForTimeout(450);
  expect(await carousel.evaluate(isEntering)).toBe(false);
  expect(await page.evaluate(() => window.__promoEntranceSamples)).toEqual([]);
});
