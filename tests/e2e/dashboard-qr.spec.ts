import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

const connectionUrl = 'https://example.test/selected-subscription-link';
const subscription = {
  id: 7,
  status: 'active',
  is_trial: false,
  is_active: true,
  is_expired: false,
  is_limited: false,
  end_date: '2026-10-15T00:00:00Z',
  days_left: 60,
  traffic_limit_gb: 100,
  traffic_used_gb: 10,
  traffic_used_percent: 10,
  device_limit: 3,
  connected_squads: [],
  servers: [],
  subscription_url: connectionUrl,
  hide_subscription_link: false,
  tariff_name: 'Selected plan',
};

const responses = {
  '/api/cabinet/subscription': { has_subscription: true, subscription },
  '/api/cabinet/subscriptions': {
    subscriptions: [subscription, { ...subscription, id: 8, tariff_name: 'Other plan' }],
    multi_tariff_enabled: true,
  },
  '/api/cabinet/subscription/devices': { devices: [], total: 0, device_limit: 3 },
  '/api/cabinet/subscription/refresh-traffic': {
    traffic_used_gb: 10,
    traffic_used_percent: 10,
    is_unlimited: false,
  },
  '/api/cabinet/subscription/connection-link': {
    subscription_url: connectionUrl,
    display_link: connectionUrl,
    connect_mode: 'plain',
    hide_link: false,
  },
};

test('opens the selected subscription QR next to Copy link and returns to Dashboard', async ({
  page,
}, testInfo) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, { responses });
  await page.goto('/?sub=7');

  const copy = page.getByRole('button', { name: 'Copy Link', exact: true });
  const qr = page.getByRole('button', { name: 'Open QR code', exact: true });
  await expect(copy).toBeVisible();
  await expect(qr).toBeVisible();
  const copyBox = await copy.boundingBox();
  const qrBox = await qr.boundingBox();
  if (!copyBox || !qrBox) throw new Error('Both subscription actions must have layout boxes');
  expect(qrBox.width).toBeGreaterThanOrEqual(44);
  expect(qrBox.height).toBeGreaterThanOrEqual(44);
  expect(qrBox.x).toBeGreaterThanOrEqual(copyBox.x + copyBox.width);
  expect(Math.abs(qrBox.y - copyBox.y)).toBeLessThanOrEqual(1);
  await page.screenshot({ path: testInfo.outputPath('dashboard-qr-actions.png') });

  await qr.click();
  await expect(page).toHaveURL('/connection/qr');
  await expect(page.getByRole('heading', { name: 'Subscription QR Code' })).toBeVisible();
  await expect(page.getByText(connectionUrl, { exact: true })).toBeVisible();
  await expect(page.locator('main svg path')).not.toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(
    false,
  );
  await page.screenshot({ path: testInfo.outputPath('subscription-qr.png') });

  await page.getByRole('link', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL('/?sub=7');
  await expect(qr).toBeVisible();
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('keeps the Happ link and selected subscription with keyboard activation and browser Back', async ({
  page,
}) => {
  const happLink = 'happ://crypt4/browser-test-payload';
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      ...responses,
      '/api/cabinet/subscription/connection-link': {
        ...responses['/api/cabinet/subscription/connection-link'],
        connect_mode: 'HAPP_CRYPTOLINK',
        happ_scheme_link: happLink,
      },
    },
  });
  await page.goto('/?sub=7');
  await expect(page.getByText(happLink, { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Copy Link', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'Open QR code', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Subscription QR Code' })).toBeVisible();
  await expect(page.getByText(happLink, { exact: true })).toBeVisible();
  await expect(page.getByText(connectionUrl, { exact: true })).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL('/?sub=7');
  await expect(page.getByRole('combobox', { name: 'Subscriptions' })).toHaveValue('7');
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('preserves the existing QR action and return to the VPN setup step', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      ...responses,
      '/api/cabinet/subscription/app-config': {
        platformNames: { windows: { en: 'Windows' } },
        hasSubscription: true,
        subscriptionUrl: connectionUrl,
        hideLink: false,
        baseSettings: { isShowTutorialButton: false, tutorialUrl: '' },
        uiConfig: { installationGuidesBlockType: 'cards' },
        platforms: {
          windows: {
            displayName: { en: 'Windows' },
            apps: [{ name: 'Test App', featured: true, blocks: [] }],
          },
        },
      },
    },
  });
  const setupPath = '/connection?sub=7&platform=windows&app=Test+App&step=add';
  await page.goto(setupPath);
  await page.getByRole('dialog').getByRole('button', { name: 'Open QR code' }).click();
  await expect(page.getByRole('heading', { name: 'Subscription QR Code' })).toBeVisible();
  await page.getByRole('link', { name: 'Back', exact: true }).click();
  await expect(page).toHaveURL(setupPath);
  await expect(
    page.getByRole('dialog').getByRole('heading', { name: 'Add subscription', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('dialog').getByRole('button', { name: 'Open QR code' }),
  ).toBeVisible();
  expect([...unexpectedApiRequests]).toEqual([]);
});

for (const hiddenBy of ['subscription', 'connection-link', 'missing-link']) {
  test(`does not expose quick QR when the link is hidden or missing: ${hiddenBy}`, async ({
    page,
  }) => {
    await prepareAuthenticatedPage(page, {
      responses: {
        ...responses,
        '/api/cabinet/subscription': {
          has_subscription: true,
          subscription: {
            ...subscription,
            hide_subscription_link: hiddenBy === 'subscription',
            subscription_url: hiddenBy === 'missing-link' ? null : connectionUrl,
          },
        },
        '/api/cabinet/subscription/connection-link': {
          subscription_url: hiddenBy === 'missing-link' ? null : connectionUrl,
          display_link: null,
          connect_mode: 'plain',
          hide_link: hiddenBy === 'connection-link',
        },
      },
    });
    const linkResponse = page.waitForResponse((response) =>
      new URL(response.url()).pathname.endsWith('/subscription/connection-link'),
    );
    await page.goto('/?sub=7');
    await linkResponse;
    await expect(page.getByRole('button', { name: 'Manage subscription' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Copy Link', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open QR code' })).toHaveCount(0);
  });
}

test('keeps quick QR accessible and contained in RTL layout', async ({ page }) => {
  await prepareAuthenticatedPage(page, { responses, language: 'fa' });
  await page.goto('/?sub=7');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  const copy = page.getByRole('button', { name: 'کپی لینک', exact: true });
  const qr = page.getByRole('button', { name: 'باز کردن کد QR', exact: true });
  await expect(qr).toBeVisible();
  const copyBox = await copy.boundingBox();
  const qrBox = await qr.boundingBox();
  if (!copyBox || !qrBox) throw new Error('Both subscription actions must have layout boxes');
  expect(qrBox.x + qrBox.width).toBeLessThanOrEqual(copyBox.x);
  await qr.click();
  await expect(page.getByRole('heading', { name: 'کد QR اشتراک' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(
    false,
  );
  await page.goBack();
  await expect(page).toHaveURL('/?sub=7');
});

for (const colorScheme of ['dark', 'light'] as const) {
  test(`keeps the Russian QR action aligned with Copy in ${colorScheme} theme`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await prepareAuthenticatedPage(page, { responses, language: 'ru' });
    await page.goto('/?sub=7');
    const copy = page.getByRole('button', { name: 'Копировать ссылку', exact: true });
    const qr = page.getByRole('button', { name: 'Открыть QR-код', exact: true });
    await expect(qr).toBeVisible();
    for (const property of ['background-color', 'border-top-color', 'border-radius', 'color']) {
      const expected = await copy.evaluate(
        (element, name) => getComputedStyle(element).getPropertyValue(name),
        property,
      );
      await expect(qr).toHaveCSS(property, expected);
    }
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    ).toBe(false);
    await page.screenshot({ path: testInfo.outputPath(`dashboard-qr-${colorScheme}-ru.png`) });
  });
}
