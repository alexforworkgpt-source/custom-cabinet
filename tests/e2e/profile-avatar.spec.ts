import { expect, test } from '@playwright/test';
import { avatarUser, prepareAvatarPage } from './profileAvatarFixture';

test('Profile shows the existing account photo beside a single name and username while retaining account details', async ({
  page,
}) => {
  const fixture = await prepareAvatarPage(page);
  await page.goto('/profile');
  await page.getByRole('heading', { name: 'Profile', exact: true }).waitFor();
  const picture = page.getByRole('img', { name: 'Profile picture', exact: true });
  await expect(picture).toBeVisible();
  await expect
    .poll(() =>
      picture
        .locator('img')
        .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
    )
    .toBe(true);
  await expect(picture.locator('img')).toHaveCSS('opacity', '1');
  await expect(page.getByRole('heading', { name: 'Dmitry Ivanov', level: 2 })).toBeVisible();
  await expect(page.getByText('Dmitry Ivanov', { exact: true })).toHaveCount(1);
  await expect(page.getByText('@dmitry', { exact: true })).toHaveCount(1);
  await expect(page.getByText('Name', { exact: true })).toHaveCount(0);
  await expect(page.getByText('Username', { exact: true })).toHaveCount(0);
  await expect(page.getByText('123456', { exact: true })).toBeVisible();
  await expect(page.getByText('browser-test@example.test', { exact: true })).toBeVisible();
  await expect(page.getByText('1/1/2026', { exact: true })).toBeVisible();
  const accounts = page.getByRole('link', { name: /Connected Accounts/ });
  await expect(accounts).toHaveAttribute('href', '/profile/accounts');
  await accounts.click();
  await expect(
    page.getByRole('heading', { name: 'Connected Accounts', exact: true }),
  ).toBeVisible();
  await page.getByRole('main').getByRole('link', { name: 'Back', exact: true }).click();
  await expect(picture.locator('img')).toHaveCSS('opacity', '1');
  expect(
    fixture.apiRequests.filter((request) => request === 'GET /api/cabinet/auth/me/avatar'),
  ).toHaveLength(1);
  expect([...fixture.unexpectedApiRequests]).toEqual([]);
});

for (const source of ['no-photo', 'api-error', 'image-error'])
  test(`Profile keeps initials when the avatar source is ${source}`, async ({ page }) => {
    const fixture = await prepareAvatarPage(page, {
      photoUrl: source === 'image-error' ? '/broken-avatar.svg' : null,
      status: source === 'api-error' ? 503 : 200,
    });
    await page.route('**/broken-avatar.svg', (route) => route.fulfill({ status: 404, body: '' }));
    await page.goto('/profile');
    const picture = page.getByRole('img', { name: 'Profile picture', exact: true });
    await expect(picture).toContainText('DI');
    await expect(picture.locator('img')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Dmitry Ivanov', level: 2 })).toBeVisible();
    expect(
      fixture.apiRequests.filter((request) => request === 'GET /api/cabinet/auth/me/avatar'),
    ).toHaveLength(1);
    expect([...fixture.unexpectedApiRequests]).toEqual([]);
  });

test('an email account shows initials without asking for a Telegram avatar', async ({ page }) => {
  const fixture = await prepareAvatarPage(page, {
    user: { ...avatarUser, telegram_id: null, auth_type: 'email' },
  });
  await page.goto('/profile');
  await expect(page.getByRole('img', { name: 'Profile picture', exact: true })).toContainText('DI');
  expect(fixture.apiRequests).not.toContain('GET /api/cabinet/auth/me/avatar');
  await expect(page.getByRole('link', { name: 'Connect Telegram ID', exact: true })).toBeVisible();
  expect([...fixture.unexpectedApiRequests]).toEqual([]);
});

test('a nameless email account keeps a user icon and readable account identity', async ({
  page,
}) => {
  const fixture = await prepareAvatarPage(page, {
    user: {
      ...avatarUser,
      telegram_id: null,
      auth_type: 'email',
      first_name: null,
      last_name: null,
      username: null,
    },
  });
  await page.goto('/profile');
  const picture = page.getByRole('img', { name: 'Profile picture', exact: true });
  await expect(picture.locator('svg')).toBeVisible();
  await expect(picture.locator('img')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'browser-test', level: 2 })).toBeVisible();
  expect(fixture.apiRequests).not.toContain('GET /api/cabinet/auth/me/avatar');
});

test('late avatar data and image bytes keep initials visible and do not move account information', async ({
  page,
}) => {
  const fixture = await prepareAvatarPage(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  let releaseData = () => {};
  let releaseImage = () => {};
  const dataGate = new Promise<void>((resolve) => {
    releaseData = resolve;
  });
  const imageGate = new Promise<void>((resolve) => {
    releaseImage = resolve;
  });
  await page.route('**/api/cabinet/auth/me/avatar', async (route) => {
    await dataGate;
    await route.fallback();
  });
  await page.route('**/profile-avatar-fixture.svg', async (route) => {
    await imageGate;
    await route.fallback();
  });
  const picture = page.getByRole('img', { name: 'Profile picture', exact: true });
  const name = page.getByRole('heading', { name: 'Dmitry Ivanov', level: 2 });
  const email = page.getByText('browser-test@example.test', { exact: true });
  try {
    await page.goto('/profile');
    await expect(picture.getByText('DI', { exact: true })).toBeVisible();
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    const before = await Promise.all([
      picture.boundingBox(),
      name.boundingBox(),
      email.boundingBox(),
    ]);
    const requestedImage = page.waitForRequest('**/profile-avatar-fixture.svg');
    releaseData();
    await requestedImage;
    await expect(picture.getByText('DI', { exact: true })).toBeVisible();
    releaseImage();
    await expect
      .poll(() =>
        picture
          .locator('img')
          .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0),
      )
      .toBe(true);
    await expect(picture.locator('img')).toHaveCSS('opacity', '1');
    await expect(picture.getByText('DI', { exact: true })).toHaveCount(0);
    const after = await Promise.all([
      picture.boundingBox(),
      name.boundingBox(),
      email.boundingBox(),
    ]);
    for (let index = 0; index < before.length; index++) {
      const a = before[index];
      const b = after[index];
      if (!a || !b) throw new Error('The avatar and account information must remain rendered');
      expect(Math.abs(a.y - b.y)).toBeLessThanOrEqual(1);
      expect(Math.abs(a.height - b.height)).toBeLessThanOrEqual(1);
      expect(Math.abs(a.width - b.width)).toBeLessThanOrEqual(1);
    }
    expect([...fixture.unexpectedApiRequests]).toEqual([]);
  } finally {
    releaseData();
    releaseImage();
  }
});
