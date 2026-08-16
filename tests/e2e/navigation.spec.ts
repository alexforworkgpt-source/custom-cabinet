import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

test('shows the simplified desktop or mobile user navigation', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page);

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome, Browser Test!' })).toBeVisible();
  await expect(page.getByRole('link', { name: /View plans and subscribe/ })).toBeVisible();

  if ((page.viewportSize()?.width ?? 1280) < 1024) {
    await expect(page.locator('header:visible')).toHaveCount(0);

    const bottomNavigation = page.locator('nav:visible');
    await expect(bottomNavigation.getByRole('link')).toHaveCount(3);
    await expect(
      bottomNavigation.getByRole('link', { name: 'Dashboard', exact: true }),
    ).toBeVisible();
    await expect(
      bottomNavigation.getByRole('link', { name: 'Support', exact: true }),
    ).toBeVisible();
    await expect(
      bottomNavigation.getByRole('link', { name: 'Profile', exact: true }),
    ).toBeVisible();
  } else {
    const desktopNavigation = page.locator('header:visible nav');
    await expect(desktopNavigation).toBeVisible();
    await expect(
      desktopNavigation.getByRole('link', { name: 'Dashboard', exact: true }),
    ).toBeVisible();
    await expect(
      desktopNavigation.getByRole('link', { name: 'Support', exact: true }),
    ).toBeVisible();
    await expect(
      desktopNavigation.getByRole('link', { name: 'Profile', exact: true }),
    ).toBeVisible();
    await expect(desktopNavigation.getByRole('link', { name: /^Subscriptions?$/ })).toHaveCount(0);
    await expect(desktopNavigation.getByRole('link', { name: 'Balance', exact: true })).toHaveCount(
      0,
    );
    await expect(desktopNavigation.getByRole('link', { name: /Wheel/ })).toHaveCount(0);
  }

  expect([...unexpectedApiRequests]).toEqual([]);
});

test('/balance preserves details without starting a new top-up', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page);

  await page.goto('/balance');
  await expect(page).toHaveURL('/balance');
  const balanceDialog = page.getByRole('dialog');
  await expect(balanceDialog).toBeVisible();
  await expect(
    balanceDialog.getByRole('heading', { name: 'Balance', exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Select Payment Method' })).toHaveCount(0);
  expect([...unexpectedApiRequests]).toEqual([]);
});
