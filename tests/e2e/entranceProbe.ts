import { expect, type Page, type Locator } from '@playwright/test';

/** Geometry assertions measure the settled target without changing their tolerances. */
export async function waitForRestingGeometry(locator: Locator) {
  await expect
    .poll(() =>
      locator.evaluate((target) => {
        let element: Element | null = target;
        while (element && element.tagName !== 'MAIN') {
          const transform = getComputedStyle(element).transform;
          if (transform !== 'none' && !new DOMMatrix(transform).isIdentity) return false;
          element = element.parentElement;
        }
        return true;
      }),
    )
    .toBe(true);
}

type ProbeTarget = { css: string; closest?: string };
interface Frame {
  opacity: number;
  y: number;
  scale: number;
}
const pageErrors = new WeakMap<Page, string[]>();

export function expectNoEntranceErrors(page: Page) {
  expect(pageErrors.get(page) ?? [], 'Entrance scenarios must not throw JavaScript errors').toEqual(
    [],
  );
}
declare global {
  interface Window {
    entranceFrames: Record<string, Frame[]>;
  }
}

/** Observe only the complete visible target and its ancestors, never its children. */
export async function recordEntrances(page: Page, targets: Record<string, ProbeTarget>) {
  const errors: string[] = [];
  pageErrors.set(page, errors);
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript((targets) => {
    window.entranceFrames = {};
    const sample = () => {
      for (const [name, target] of Object.entries(targets)) {
        const match = [...document.querySelectorAll<HTMLElement>(target.css)].find(
          (el) => el.getBoundingClientRect().width && getComputedStyle(el).visibility !== 'hidden',
        );
        let element: Element | null = target.closest
          ? (match?.closest(target.closest) ?? null)
          : (match ?? null);
        if (!element) continue;
        window.entranceFrames[name] ??= [];
        const frames = window.entranceFrames[name];
        if (frames.length >= 240) continue;
        let opacity = 1;
        let y = 0;
        let scale = 1;
        while (element && element !== document.body) {
          const style = getComputedStyle(element);
          const matrix =
            style.transform === 'none' ? new DOMMatrix() : new DOMMatrix(style.transform);
          opacity *= Number(style.opacity);
          y += matrix.m42;
          scale *= matrix.m11;
          element = element.parentElement;
        }
        frames.push({ opacity, y, scale });
      }
      requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  }, targets);
}

export async function clearEntrances(page: Page) {
  await page.evaluate(() => {
    window.entranceFrames = {};
  });
}

export async function expectEntrance(page: Page, name: string) {
  await expect
    .poll(
      () =>
        page.evaluate(
          (name) =>
            (window.entranceFrames[name] ?? []).some(
              (frame) => frame.opacity < 0.99 && frame.y > 0.1,
            ),
          name,
        ),
      { message: `The complete ${name} must enter, not only its children` },
    )
    .toBe(true);
}

export async function expectStationary(page: Page, names: string[], allowFade = false) {
  const frames = await page.evaluate(() => window.entranceFrames);
  for (const name of names) {
    expect(frames[name]?.length, `${name} must actually be sampled`).toBeGreaterThan(5);
    // MotionConfig may retain an initial transform while effective opacity is
    // exactly zero. Only painted pixels can move; fades remain allowed in reduce.
    expect(
      frames[name].filter(
        (frame) =>
          (!allowFade || frame.opacity > 0.001) &&
          (Math.abs(frame.y) > 0.05 || Math.abs(frame.scale - 1) > 0.001),
      ),
      `${name} must not move`,
    ).toEqual([]);
    if (!allowFade)
      expect(
        frames[name].filter((frame) => frame.opacity < 0.99),
        `${name} must not replay its fade`,
      ).toEqual([]);
  }
}
