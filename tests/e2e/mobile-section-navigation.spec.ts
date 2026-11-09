import { expect, test, type Page } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { prepareMobileNavigation, mobileNavigationResponses } from './mobileNavigationFixture';

function mainNavigation(page: Page) {
  return page
    .getByRole('navigation')
    .filter({ has: page.getByRole('link', { name: 'Dashboard', exact: true }) });
}

test('account settings keep the main navigation and the Profile destination through direct entry and browser back', async ({
  page,
}) => {
  const fixture = await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/branding/telegram-widget': { enabled: false, bot_username: null },
    },
  });
  await page.goto('/profile/accounts');
  await page.getByRole('heading', { name: 'Connected Accounts', exact: true }).waitFor();
  const navigation = mainNavigation(page);
  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole('link')).toHaveCount(4);
  await expect(navigation.getByRole('link', { name: 'Profile', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await navigation.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await expect(page).toHaveURL('/');
  await page.goBack();
  await expect(page).toHaveURL('/profile/accounts');
  await expect(navigation.getByRole('link', { name: 'Profile', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await navigation.getByRole('link', { name: 'Profile', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible();
  expect([...fixture.unexpectedApiRequests]).toEqual([]);
});

for (const [route, parent] of [
  ['/profile/notifications', 'Profile'],
  ['/referral', 'Profile'],
  ['/contests', 'Profile'],
  ['/polls', 'Profile'],
  ['/wheel', 'Profile'],
  ['/gift', 'Profile'],
  ['/instructions', 'Profile'],
  ['/instructions/connect-android', 'Profile'],
  ['/info', 'Profile'],
  ['/info/entrance', 'Profile'],
  ['/news/navigation-news', 'Dashboard'],
  ['/balance/saved-cards', 'Dashboard'],
])
  test(`keeps main navigation on ${route} with its parent destination`, async ({ page }) => {
    const fixture = await prepareMobileNavigation(page);
    await page.goto(route);
    await page.locator('main h1').filter({ visible: true }).first().waitFor();
    const navigation = mainNavigation(page);
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole('link')).toHaveCount(4);
    if ((page.viewportSize()?.width ?? 1280) < 1024) {
      await expect(navigation.locator('[aria-current="page"]')).toHaveCount(1);
      await expect(navigation.getByRole('link', { name: parent, exact: true })).toHaveAttribute(
        'aria-current',
        'page',
      );
    }
    await page.reload();
    await page.locator('main h1').filter({ visible: true }).first().waitFor();
    await expect(navigation).toBeVisible();
    await navigation.getByRole('link', { name: 'Dashboard', exact: true }).click();
    await expect(page).toHaveURL('/');
    await page.goBack();
    await expect(page).toHaveURL(route);
    await expect(navigation).toBeVisible();
    if ((page.viewportSize()?.width ?? 1280) < 1024) {
      await expect(navigation.getByRole('link', { name: parent, exact: true })).toHaveAttribute(
        'aria-current',
        'page',
      );
    }
    await navigation.getByRole('link', { name: 'Profile', exact: true }).click();
    await expect(page).toHaveURL('/profile');
    expect([...fixture.unexpectedApiRequests]).toEqual([]);
  });

test('instructions preserve the Support parent through article entry and browser back', async ({
  page,
}) => {
  const fixture = await prepareMobileNavigation(page);
  await page.goto('/support');
  await page.getByRole('main').locator('a[href="/instructions"]').waitFor();
  await page.getByRole('main').locator('a[href="/instructions"]').click();
  await expect(page).toHaveURL('/instructions');
  const navigation = mainNavigation(page);
  if ((page.viewportSize()?.width ?? 1280) < 1024) {
    await expect(navigation.getByRole('link', { name: 'Support', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
  }
  await page.getByRole('main').locator('a[href="/instructions/connect-android"]').click();
  await expect(page).toHaveURL('/instructions/connect-android');
  if ((page.viewportSize()?.width ?? 1280) < 1024) {
    await expect(navigation.getByRole('link', { name: 'Support', exact: true })).toHaveAttribute(
      'aria-current',
      'page',
    );
  }
  await page.goBack();
  await expect(page).toHaveURL('/instructions');
  await page.getByRole('main').getByRole('link', { name: 'Back to support', exact: true }).click();
  await expect(page).toHaveURL('/support');
  expect([...fixture.unexpectedApiRequests]).toEqual([]);
});

for (const [language, theme] of [
  ['ru', 'light'],
  ['fa', 'dark'],
])
  test(`secondary navigation fits ${language} ${theme} without changing desktop navigation`, async ({
    page,
  }, info) => {
    const fixture = await prepareAuthenticatedPage(page, {
      language,
      responses: mobileNavigationResponses,
    });
    await page.addInitScript((theme) => localStorage.setItem('cabinet-theme', theme), theme);
    await page.goto('/info');
    await page.locator('main h1').filter({ visible: true }).first().waitFor();
    const navigation = page.getByRole('navigation').filter({ has: page.locator('a[href="/"]') });
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole('link')).toHaveCount(4);
    if ((page.viewportSize()?.width ?? 1280) < 1024) {
      await expect(navigation.locator('a[href="/profile"]')).toHaveAttribute(
        'aria-current',
        'page',
      );
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    } else {
      await expect(page.locator('header').filter({ has: navigation })).toBeVisible();
    }
    if (language === 'fa') await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await page.screenshot({
      path: info.outputPath(`${language}-${theme}-navigation.png`),
      fullPage: false,
    });
    await navigation.locator('a[href="/profile"]').click();
    await expect(page).toHaveURL('/profile');
    expect([...fixture.unexpectedApiRequests]).toEqual([]);
  });
