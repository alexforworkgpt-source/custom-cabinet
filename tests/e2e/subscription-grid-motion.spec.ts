import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription } from './classicRenewalFixture';

const additionalStates = [
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
    test(`illustrated Dashboard banner covers ${state.name} in ${theme}`, async ({
      page,
    }, testInfo) => {
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
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const card = page.locator(
        'main .subscription-hero--scenario:not(.subscription-hero-loading)',
      );
      const portrait = card.locator('.subscription-hero-portrait');
      await expect(portrait.locator('img')).toBeVisible();
      expect(
        await portrait.locator('img').evaluate(async (img) => {
          const art = img as HTMLImageElement;
          await art.decode();
          return art.naturalWidth;
        }),
      ).toBeGreaterThan(0);
      await expect(card).toHaveCSS('isolation', 'isolate');
      await expect(portrait).toHaveCSS('pointer-events', 'none');
      await card.screenshot({ path: testInfo.outputPath(`${state.name}-${theme}.png`) });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await expect(portrait).toBeVisible();
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
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('link', { name: 'Choose tariff', exact: true })).toBeVisible();
    await expect(page.locator('circle.animate-grid-node')).toHaveCount(0);
  });
}
