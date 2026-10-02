import { expect, test, type Locator } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

const traffic = {
  selectable: true,
  mode: 'selectable',
  current: 100,
  options: [100, 200].map((value) => ({
    value,
    label: `${value} ГБ`,
    price_kopeks: 0,
    is_available: true,
  })),
};
const servers = { options: [], min: 0, max: 0, default: [], selected: [] };
const devices = {
  min: 1,
  max: 1,
  default: 1,
  current: 1,
  price_per_device_kopeks: 0,
};
const classicOptions = {
  sales_mode: 'classic',
  currency: 'RUB',
  balance_kopeks: 50_000,
  periods: [30, 90].map((days) => ({
    id: `period-${days}`,
    period_days: days,
    months: days / 30,
    label: `${days} дней`,
    price_kopeks: days * 1_000,
    is_available: true,
    traffic,
    servers,
    devices,
  })),
  traffic,
  servers,
  devices,
  selection: {
    period_id: 'period-30',
    period_days: 30,
    traffic_value: 100,
    servers: [],
    devices: 1,
  },
};

for (const theme of ['light', 'dark'] as const) {
  test(`keeps classic selection visible after switching period and traffic in ${theme} theme`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme: theme, reducedMotion: 'reduce' });
    const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
      language: 'ru',
      responses: {
        '/api/cabinet/subscription/purchase-options': classicOptions,
        '/api/cabinet/subscription/purchase-preview': {
          total_price_kopeks: 30_000,
          total_price_label: '300 ₽',
          balance_kopeks: 50_000,
          missing_amount_kopeks: 0,
          can_purchase: true,
          breakdown: [],
        },
      },
    });
    await page.addInitScript((value) => localStorage.setItem('cabinet-theme', value), theme);
    await page.goto('/subscription/purchase');

    const wizard = page.locator('[data-purchase-layout="classic"]');
    const selectedBorder = await page.evaluate(() => {
      const color = getComputedStyle(document.documentElement)
        .getPropertyValue('--color-accent-500')
        .trim()
        .split(/[,\s]+/)
        .join(', ');
      return `rgb(${color})`;
    });
    const verifySelection = async (selected: Locator, other: Locator) => {
      await page.mouse.move(0, 0);
      await expect(selected).toHaveCSS('border-top-color', selectedBorder);
      await expect(selected).toHaveCSS('border-top-width', theme === 'light' ? '2px' : '1px');
      await expect(other).not.toHaveCSS('border-top-color', selectedBorder);
      await expect(selected).toHaveAttribute('aria-pressed', 'true');
      await expect(other).toHaveAttribute('aria-pressed', 'false');
      if (theme === 'light') {
        await selected.hover();
        await expect(selected).toHaveCSS('border-top-color', selectedBorder);
      }
    };

    const month = wizard.getByRole('button', { name: /^30 дней/ });
    const quarter = wizard.getByRole('button', { name: /^90 дней/ });
    await verifySelection(month, quarter);
    await quarter.click();
    await verifySelection(quarter, month);
    await month.focus();
    await page.keyboard.press('Enter');
    await verifySelection(month, quarter);
    await page.screenshot({ path: testInfo.outputPath(`classic-period-${theme}.png`) });

    await wizard.getByRole('button', { name: /^Далее/ }).click();
    const smallTraffic = wizard.getByRole('button', { name: /^100 ГБ/ });
    const largeTraffic = wizard.getByRole('button', { name: /^200 ГБ/ });
    await verifySelection(smallTraffic, largeTraffic);
    await largeTraffic.click();
    await verifySelection(largeTraffic, smallTraffic);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    ).toBe(false);
    expect([...unexpectedApiRequests]).toEqual([]);
  });
}
