import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription } from './classicRenewalFixture';

for (const theme of ['light', 'dark']) {
  test(`subscription grid stays stationary and respects reduced motion in ${theme}`, async ({
    page,
  }, testInfo) => {
    const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, { responses });
    await page.route('**/cabinet/activity/events', (route) => route.fulfill({ json: {} }));
    await page.addInitScript((value) => localStorage.setItem('cabinet-theme', value), theme);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');
    const card = page.locator('section[aria-labelledby="subscription-summary-title"]');
    const grid = card.locator('> svg');
    const nodes = grid.locator('circle.animate-grid-node');
    const wave = nodes.first();
    await expect(wave).toBeVisible();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const runningTime = await wave.evaluate((element) => {
      const animation = element
        .getAnimations()
        .find((item) => (item as CSSAnimation).animationName === 'gridNodePulse');
      if (animation?.playState !== 'running') throw new Error('Grid is not animating');
      return Number(animation.currentTime);
    });
    await expect
      .poll(() =>
        wave.evaluate((element) =>
          Number(
            element
              .getAnimations()
              .find((item) => (item as CSSAnimation).animationName === 'gridNodePulse')
              ?.currentTime,
          ),
        ),
      )
      .toBeGreaterThan(runningTime + 250);
    const sample = async (time: number) =>
      wave.evaluate((element, milliseconds) => {
        const animation = element
          .getAnimations()
          .find((item) => (item as CSSAnimation).animationName === 'gridNodePulse');
        if (!animation) throw new Error('Activity animation missing');
        animation.pause();
        animation.currentTime =
          milliseconds + Number(animation.effect?.getTiming().delay ?? 0) + 12000;
        const style = getComputedStyle(element);
        return {
          radius: parseFloat(style.getPropertyValue('r')),
          opacity: parseFloat(style.opacity),
          transform: style.transform,
          duration: style.animationDuration,
          iterations: style.animationIterationCount,
          center: [element.getAttribute('cx'), element.getAttribute('cy')],
        };
      }, time);
    const rest = await sample(0);
    const peak = await sample(1200);
    await card.screenshot({ path: testInfo.outputPath(`grid-pulse-${theme}.png`) });
    const settled = await sample(2400);
    expect(peak.duration).toBe('12s');
    expect(peak.iterations).toBe('infinite');
    expect(peak.radius).toBeGreaterThan(rest.radius * 1.5);
    expect(peak.opacity).toBeGreaterThan(rest.opacity);
    expect(settled.radius).toBeCloseTo(rest.radius);
    expect(settled.opacity).toBeCloseTo(rest.opacity);
    expect(peak.transform).toBe('none');
    expect(peak.center).toEqual(rest.center);
    const phases = await nodes.evaluateAll((elements) =>
      elements.map((element) => ({
        x: Number(element.getAttribute('cx')),
        y: Number(element.getAttribute('cy')),
        delay: parseFloat(getComputedStyle(element).animationDelay),
      })),
    );
    const row = phases.filter((node) => node.y === phases[0].y).sort((a, b) => a.x - b.x);
    expect(row.length).toBeGreaterThan(1);
    for (let i = 1; i < row.length; i++) expect(row[i - 1].delay).toBeGreaterThan(row[i].delay);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(wave).toBeHidden();
    expect(await wave.evaluate((element) => element.getAnimations().length)).toBe(0);
    await expect(grid).toBeVisible();
    expect(await grid.locator('pattern').first().getAttribute('width')).toBe('32');
    expect([...unexpectedApiRequests]).toEqual([]);
  });
}

const additionalStates = [
  { name: 'active trial', changes: { is_trial: true } },
  { name: 'expiring paid', changes: { days_left: 2 } },
  { name: 'expired trial', changes: { is_trial: true, is_expired: true, status: 'expired' } },
  { name: 'expired paid', changes: { is_expired: true, status: 'expired' } },
  { name: 'exhausted traffic', changes: { is_limited: true, traffic_used_percent: 100 } },
  { name: 'disabled subscription', changes: { status: 'disabled', is_active: false } },
  { name: 'paused daily', changes: { status: 'disabled', is_daily: true, is_active: false } },
  { name: 'expired daily', changes: { status: 'expired', is_daily: true, is_expired: true } },
  { name: 'free trial offer', trial: true, paid: false },
  { name: 'paid trial offer', trial: true, paid: true },
];

for (const theme of ['light', 'dark']) {
  for (const state of additionalStates) {
    test(`grid covers ${state.name} in ${theme}`, async ({ page }, testInfo) => {
      const current = { ...subscription, ...('changes' in state ? state.changes : {}) };
      const isOffer = 'trial' in state;
      const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
        responses: {
          ...responses,
          '/api/cabinet/subscription': {
            has_subscription: !isOffer,
            subscription: isOffer ? null : current,
          },
          '/api/cabinet/subscriptions': {
            subscriptions: isOffer ? [] : [current],
            multi_tariff_enabled: false,
          },
          ...(isOffer
            ? {
                '/api/cabinet/subscription/trial': {
                  is_available: true,
                  duration_days: 7,
                  traffic_limit_gb: 100,
                  device_limit: 3,
                  requires_payment: state.paid,
                  price_kopeks: state.paid ? 10000 : 0,
                  price_rubles: state.paid ? 100 : 0,
                },
              }
            : {}),
        },
      });
      await page.route('**/cabinet/activity/events', (route) => route.fulfill({ json: {} }));
      await page.addInitScript((value) => localStorage.setItem('cabinet-theme', value), theme);
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await page.goto('/');
      const wave = page.locator('circle.animate-grid-node').first();
      await expect(wave).toBeVisible();
      const grid = page.locator('svg').filter({ has: wave });
      const card = grid.locator('..');
      expect(await card.evaluate((element) => getComputedStyle(element).isolation)).toBe('isolate');
      expect(await grid.evaluate((element) => getComputedStyle(element).pointerEvents)).toBe(
        'none',
      );
      await card.screenshot({ path: testInfo.outputPath(`${state.name}-${theme}.png`) });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(wave).toBeHidden();
      await expect(grid).toBeVisible();
      expect(await wave.evaluate((element) => element.getAnimations().length)).toBe(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect([...unexpectedApiRequests]).toEqual([]);
    });
  }

  test(`no subscription and unavailable trial retains a simple purchase link in ${theme}`, async ({
    page,
  }) => {
    await prepareAuthenticatedPage(page);
    await page.route('**/cabinet/activity/events', (route) => route.fulfill({ json: {} }));
    await page.addInitScript((value) => localStorage.setItem('cabinet-theme', value), theme);
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Choose tariff', exact: true })).toBeVisible();
    await expect(page.locator('circle.animate-grid-node')).toHaveCount(0);
  });
}
