import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

function deferred() {
  let release = () => {};
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

test('keeps the balance while a background refresh fails and retries', async ({ page }) => {
  const backgroundRefresh = deferred();
  let balanceRequests = 0;
  await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/balance': { balance_kopeks: 4200, balance_rubles: 42 },
    },
  });
  await page.route('**/api/cabinet/balance', async (route) => {
    balanceRequests += 1;
    if (balanceRequests === 2) {
      await backgroundRefresh.promise;
      await route.fulfill({ status: 500, json: { detail: 'Temporary error' } });
      return;
    }
    if (balanceRequests === 3) {
      await route.fulfill({
        json: { balance_kopeks: 8400, balance_rubles: 84 },
      });
      return;
    }
    await route.fallback();
  });

  await page.goto('/');
  const balanceCard = page.getByRole('link', { name: /Balance/ }).first();
  await expect(balanceCard).toContainText('42');

  await page.locator('nav:visible').getByRole('link', { name: 'Profile', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
  await page.locator('nav:visible').getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect.poll(() => balanceRequests).toBe(2);
  await expect(balanceCard).toContainText('42');
  await expect(balanceCard.getByRole('status')).toHaveCount(0);

  backgroundRefresh.release();
  const error = page.getByRole('alert').filter({ hasText: 'Balance could not be loaded' });
  await expect(error).toBeVisible();
  await expect(balanceCard).toContainText('42');

  await error.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(balanceCard).toContainText('84');
  expect(balanceRequests).toBe(3);
});
