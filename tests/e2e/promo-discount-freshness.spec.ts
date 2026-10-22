import { expect, test } from '@playwright/test';
import { activeDiscount, preparePromoPage, subscription } from './promoDiscountFixture';

test('changing the selected subscription while refreshing cannot open the previous ID', async ({
  page,
}) => {
  const second = { ...subscription, id: 43, tariff_id: 8 };
  const fixture = await preparePromoPage(page, {
    '/api/cabinet/subscriptions': {
      subscriptions: [subscription, second],
      multi_tariff_enabled: true,
    },
  });
  await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, (route) => {
    const id = new URL(route.request().url()).searchParams.get('subscription_id');
    return route.fulfill({
      json: { has_subscription: true, subscription: id === '43' ? second : subscription },
    });
  });
  await page.goto('/?sub=42');
  const action = page.locator('[data-promo-active-discount]').getByRole('button').first();
  await expect(action).toBeEnabled();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let refreshing = false;
  await page.route('**/api/cabinet/promo/active-discount', async (route) => {
    refreshing = true;
    await gate;
    await route.fulfill({ json: activeDiscount });
  });
  try {
    await action.click();
    await expect.poll(() => refreshing).toBe(true);
    await page.getByRole('combobox').selectOption('43');
    release();
    await expect(page.locator('[data-promo-offers]').getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL('/?sub=43');
    fixture.expectNoPayment();
  } finally {
    release();
  }
});

test('a double click starts only one fresh navigation and no payment', async ({ page }) => {
  const fixture = await preparePromoPage(page);
  await page.goto('/');
  const action = page.locator('[data-promo-active-discount]').getByRole('button').first();
  await expect(action).toBeEnabled();
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let reads = 0;
  await page.route('**/api/cabinet/promo/active-discount', async (route) => {
    reads++;
    await gate;
    await route.fulfill({ json: activeDiscount });
  });
  try {
    await action.evaluate((button) => {
      button.click();
      button.click();
    });
    await expect.poll(() => reads).toBe(1);
    await expect(action).toBeDisabled();
    release();
    await expect(page).toHaveURL('/subscriptions/42/renew');
    expect(reads).toBe(1);
    fixture.expectNoPayment();
  } finally {
    release();
  }
});

test('a discount revoked before the click is refreshed instead of opening purchase or renewal', async ({
  page,
}) => {
  const fixture = await preparePromoPage(page);
  await page.goto('/');
  const action = page.locator('[data-promo-active-discount]').getByRole('button').first();
  await expect(action).toBeEnabled();
  await page.route('**/api/cabinet/promo/active-discount', (route) =>
    route.fulfill({ json: { ...activeDiscount, is_active: false } }),
  );
  await action.click();
  await expect(page.locator('[data-promo-offers]').getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL('/');
  await expect(page.locator('[data-promo-active-discount]')).toHaveCount(0);
  fixture.expectNoPayment();
});

test('a full subscription removed after loading is not used for renewal', async ({ page }) => {
  const fixture = await preparePromoPage(page);
  await page.goto('/?sub=42');
  const action = page.locator('[data-promo-active-discount]').getByRole('button').first();
  await expect(action).toBeEnabled();
  await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, (route) =>
    route.fulfill({ json: { has_subscription: false, subscription: null } }),
  );
  await action.click();
  await expect(page.locator('[data-promo-offers]').getByRole('alert')).toBeVisible();
  await expect(page).toHaveURL('/?sub=42');
  fixture.expectNoPayment();
});

test('unavailable sales mode offers retry instead of assuming a classic purchase', async ({
  page,
}) => {
  const fixture = await preparePromoPage(page);
  await page.route('**/api/cabinet/subscription/purchase-options*', (route) =>
    route.fulfill({ status: 400, json: { detail: 'Условия временно недоступны' } }),
  );
  await page.goto('/');
  const action = page.locator('[data-promo-active-discount]').getByRole('button').first();
  await expect(action).toHaveText('Повторить');
  await action.click();
  await expect(page.locator('[data-promo-offers]').getByRole('alert')).toContainText(
    'Условия временно недоступны',
  );
  await expect(page).toHaveURL('/');
  await page.unroute('**/api/cabinet/subscription/purchase-options*');
  await action.click();
  await expect(page).toHaveURL('/subscriptions/42/renew');
  fixture.expectNoPayment();
});
