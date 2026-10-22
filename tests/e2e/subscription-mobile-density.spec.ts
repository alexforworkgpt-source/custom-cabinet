import { expect, test, type Page } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription } from './classicRenewalFixture';
import { classicPurchaseOptions } from './classicPurchasePricingFixture';

async function prepare(page: Page, language = 'ru', theme = 'dark') {
  const result = await prepareAuthenticatedPage(page, {
    language,
    responses: {
      ...responses,
      '/api/cabinet/subscription/purchase-options': {
        ...classicPurchaseOptions,
        platega_recurrent_enabled: false,
        lava_recurrent_enabled: false,
      },
      '/api/cabinet/subscription/devices/price': {
        available: true,
        current_device_limit: 3,
        max_device_limit: 10,
        days_left: 30,
        total_price_kopeks: 9900,
        total_price_label: '99 ₽',
        price_per_device_label: '99 ₽',
      },
      '/api/cabinet/subscription/devices/reduction-info': {
        available: true,
        current_device_limit: 3,
        min_device_limit: 1,
        connected_devices_count: 0,
      },
      '/api/cabinet/subscription/traffic-packages': [
        { gb: 20, price_kopeks: 10000, price_rubles: 100, is_unlimited: false },
        { gb: 50, price_kopeks: 20000, price_rubles: 200, is_unlimited: false },
      ],
      ...(theme === 'operator'
        ? {
            '/api/cabinet/branding/colors': {
              accent: '#9d174d',
              success: '#15803d',
              warning: '#b45309',
              error: '#b91c1c',
            },
          }
        : {}),
    },
  });
  await page.addInitScript(
    (value) => localStorage.setItem('cabinet-theme', value),
    theme === 'operator' ? 'light' : theme,
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  return result;
}

async function ready(page: Page) {
  await page.goto('/subscriptions/42');
  await expect(page.locator('[data-subscription-autopay]')).toBeVisible();
  await expect(page.locator('a[href="/subscriptions/42/renew"]')).toBeVisible();
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

for (const language of ['ru', 'en', 'fa', 'zh']) {
  for (const theme of ['light', 'dark']) {
    test(`subscription density keeps complete text and touch targets ${language} ${theme}`, async ({
      page,
    }) => {
      const { apiRequests, unexpectedApiRequests } = await prepare(page, language, theme);
      await ready(page);
      const mobile = (page.viewportSize()?.width ?? 1280) < 640;
      const rows = page.locator('#subscription-additional-options-panel > div > button');
      await expect(rows).toHaveCount(4);
      const measurements = await rows.evaluateAll((elements) =>
        elements.slice(0, 3).map((element) => {
          const style = getComputedStyle(element);
          const icon = element.querySelector('svg');
          const text = element.querySelector('div > div');
          if (!icon || !text?.firstElementChild || !text.lastElementChild)
            throw new Error('Every add-on action must retain its icon, title and description');
          const svg = icon.getBoundingClientRect();
          return {
            height: element.getBoundingClientRect().height,
            padding: style.paddingTop,
            title: getComputedStyle(text.firstElementChild).fontSize,
            subtitle: getComputedStyle(text.lastElementChild).fontSize,
            svgWidth: svg.width,
            contained: text.getBoundingClientRect().right <= element.getBoundingClientRect().right,
          };
        }),
      );
      for (const value of measurements) {
        expect(value.height).toBeGreaterThanOrEqual(64);
        expect(value.padding).toBe(mobile ? '12px' : '16px');
        expect(value.title).toBe(mobile ? '14px' : '16px');
        expect(value.subtitle).toBe(mobile ? '12px' : '14px');
        expect(value.svgWidth).toBeCloseTo(20, 0);
        expect(value.contained).toBe(true);
      }
      const autopay = page.getByRole('switch');
      const hit = await autopay.boundingBox();
      const track = await autopay.locator(':scope > span').boundingBox();
      expect(hit?.height).toBe(mobile ? 44 : 28);
      expect(hit?.width).toBe(52);
      expect(track?.height).toBe(28);
      expect(track?.width).toBe(52);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(
        apiRequests.filter((request) =>
          /^POST .*subscription\/(purchase|renew|autopay|devices\/purchase)/.test(request),
        ),
      ).toEqual([]);
      expect([...unexpectedApiRequests]).toEqual([]);
    });
  }
}

test('mobile density stops exactly at sm and preserves the painted section gap @critical-flow', async ({
  page,
}) => {
  await prepare(page);
  await ready(page);
  for (const width of [320, 375, 390, 639, 640, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const mobile = width < 640;
    const devices = page.getByRole('link', { name: /Мои устройства/ });
    const renew = page.locator('a[href="/subscriptions/42/renew"] .hover-border-gradient');
    await expect(devices).toHaveCSS('padding-top', mobile ? '12px' : '16px');
    const deviceBox = await devices.boundingBox();
    const renewBox = await renew.boundingBox();
    if (!deviceBox || !renewBox) throw new Error('Both management actions must be visible');
    expect(deviceBox.height).toBe(mobile ? 64 : 78);
    expect(Math.abs(deviceBox.y - renewBox.y - renewBox.height - 16)).toBeLessThanOrEqual(1);
    expect(renewBox.height).toBeGreaterThanOrEqual(mobile ? 72 : 80);
    expect(renewBox.height).toBeLessThanOrEqual(mobile ? 90 : 80);
    await expect(page.locator('[data-subscription-autopay]')).toHaveCSS(
      'padding-top',
      mobile ? '8px' : '12px',
    );
  }
});

test('open add-on forms retain controls, close targets and desktop density', async ({ page }) => {
  const { apiRequests } = await prepare(page);
  await ready(page);
  const mobile = (page.viewportSize()?.width ?? 1280) < 640;
  const options = page.locator('#subscription-additional-options-panel');
  for (const label of ['Докупить устройства', 'Уменьшить устройства', 'Докупить трафик']) {
    await options.getByRole('button', { name: new RegExp(`^${label}`) }).click();
    const close = options.getByRole('button', { name: 'Закрыть', exact: true });
    await expect(close).toBeVisible();
    const panel = close.locator('../..');
    await expect(panel).toHaveCSS('padding-top', mobile ? '16px' : '20px');
    if (mobile) {
      expect((await close.boundingBox())?.height).toBe(44);
      expect((await close.boundingBox())?.width).toBe(44);
    }
    if (label !== 'Докупить трафик') {
      const increment = options.getByRole('button', {
        name: 'Увеличить кол-во устройств',
        exact: true,
      });
      await expect(increment).toBeVisible();
      expect((await increment.boundingBox())?.height).toBe(48);
      expect((await increment.boundingBox())?.width).toBe(48);
    } else {
      const choice = options.getByRole('button', { name: /20 ГБ/ });
      await expect(choice).toBeVisible();
      await expect(choice).toHaveCSS('padding-top', mobile ? '12px' : '16px');
      await choice.click();
      const buy = options.getByRole('button', { name: /Купить 20 ГБ/ });
      await expect(buy).toBeVisible();
      expect((await buy.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    }
    await close.click();
    await expect(close).toHaveCount(0);
  }
  expect(
    apiRequests.filter((request) =>
      /^POST .*subscription\/(devices\/(purchase|reduce)|traffic)/.test(request),
    ),
  ).toEqual([]);
});

test('operator colors and enlarged mobile text retain every action @critical-flow', async ({
  page,
}) => {
  await prepare(page, 'ru', 'operator');
  await ready(page);
  await page.setViewportSize({ width: 320, height: 900 });
  await page.addStyleTag({ content: 'html { font-size: 200%; }' });
  const options = page.locator('#subscription-additional-options-panel > div > button');
  await expect(options).toHaveCount(4);
  for (const row of await options.all()) {
    await expect(row).toBeVisible();
    expect((await row.boundingBox())?.height).toBeGreaterThanOrEqual(64);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('Dashboard traffic form shares only the approved open-form density', async ({ page }) => {
  await prepare(page);
  await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, (route) =>
    route.fulfill({
      json: {
        has_subscription: true,
        subscription: {
          ...subscription,
          status: 'limited',
          is_limited: true,
          is_active: false,
          traffic_used_gb: 100,
        },
      },
    }),
  );
  await page.goto('/?sub=42');
  await page.getByRole('button', { name: /Докупить трафик/ }).click();
  const panel = page.locator('#traffic-topup-panel');
  await expect(panel.getByRole('button', { name: /20 ГБ/ })).toBeVisible();
  const mobile = (page.viewportSize()?.width ?? 1280) < 640;
  await expect(panel.locator(':scope > div')).toHaveCSS('padding-top', mobile ? '16px' : '20px');
});
