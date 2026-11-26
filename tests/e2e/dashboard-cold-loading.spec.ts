import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

function deferred() {
  let release = () => {};
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

const subscription = {
  id: 7,
  status: 'active',
  is_trial: false,
  is_active: true,
  is_expired: false,
  is_limited: false,
  end_date: '2027-01-15T00:00:00Z',
  days_left: 60,
  traffic_limit_gb: 0,
  traffic_used_gb: 10,
  traffic_used_percent: 0,
  device_limit: 3,
  connected_squads: [],
  servers: [],
  tariff_name: 'Selected plan',
  subscription_url: 'https://example.test/selected-link',
  hide_subscription_link: false,
};

for (const plan of [
  { name: 'unlimited plan', trafficLimit: 0, trial: false },
  { name: 'limited traffic plan', trafficLimit: 100, trial: false },
  { name: 'trial', trafficLimit: 100, trial: true },
]) {
  test(`cold Dashboard keeps the subscription card the same size for a ${plan.name}`, async ({
    page,
  }) => {
    const selected = {
      ...subscription,
      status: plan.trial ? 'trial' : 'active',
      is_trial: plan.trial,
      traffic_limit_gb: plan.trafficLimit,
    };
    const list = deferred();
    const details = deferred();
    const detailsRequested = deferred();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await prepareAuthenticatedPage(page, {
      responses: {
        '/api/cabinet/subscriptions': { subscriptions: [selected], multi_tariff_enabled: true },
        '/api/cabinet/subscription': { has_subscription: true, subscription: selected },
        '/api/cabinet/subscription/devices': { devices: [], total: 0, device_limit: 3 },
        '/api/cabinet/subscription/connection-link': {
          display_link: subscription.subscription_url,
          connect_mode: 'plain',
          hide_link: false,
        },
      },
    });
    await page.route('**/api/cabinet/subscriptions', async (route) => {
      await list.promise;
      await route.fallback();
    });
    await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, async (route) => {
      detailsRequested.release();
      await details.promise;
      await route.fallback();
    });

    const balance = page.locator('main [data-onboarding="balance"]');
    const loading = page
      .getByRole('heading', { name: 'Your Subscription' })
      .locator('xpath=ancestor::*[@role="status"][1]');

    let initialCard: { height: number; y: number } | null = null;
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(loading).toBeVisible();
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      const initial = await loading.boundingBox();
      const section = loading.locator('section');
      initialCard = (await section.count()) ? await section.boundingBox() : initial;
      const initialBalance = (await balance.count()) ? await balance.boundingBox() : null;
      list.release();
      await detailsRequested.promise;
      await expect(loading).toBeVisible();
      const whileDetailsPending = await loading.boundingBox();
      const balanceWhileDetailsPending = (await balance.count())
        ? await balance.boundingBox()
        : null;

      expect(initial).toBeTruthy();
      expect(whileDetailsPending).toBeTruthy();
      expect
        .soft(
          Math.abs((whileDetailsPending?.height ?? 0) - (initial?.height ?? 0)),
          'Loading placeholder height changes after the list response',
        )
        .toBeLessThanOrEqual(1);
      expect
        .soft(balanceWhileDetailsPending, 'Balance is already visible while the layout is unknown')
        .toBeNull();
      expect.soft(initialBalance).toBeNull();
    } finally {
      list.release();
      details.release();
    }

    await expect(page.getByRole('button', { name: 'Manage subscription' })).toBeVisible();
    await expect(balance).toBeVisible();
    const ready = await page.locator('[aria-labelledby=subscription-summary-title]').boundingBox();
    if (!ready || !initialCard)
      throw new Error('The initial and ready subscription cards must be visible');
    expect(Math.abs(ready.y - initialCard.y)).toBeLessThanOrEqual(1);
    expect(
      Math.abs(ready.height - initialCard.height),
      'The subscription card itself must keep its height',
    ).toBeLessThanOrEqual(1);
  });
}
