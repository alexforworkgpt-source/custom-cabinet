import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { classicPurchaseOptions } from './classicPurchasePricingFixture';

for (const theme of ['dark', 'light']) {
  test(`classic summary stays visible during delayed recalculation in ${theme}`, async ({
    page,
  }, testInfo) => {
    const { unexpectedApiRequests, apiRequests } = await prepareAuthenticatedPage(page, {
      language: 'ru',
      responses: { '/api/cabinet/subscription/purchase-options': classicPurchaseOptions },
    });
    await page.route('**/cabinet/activity/events', (route) => route.fulfill({ json: {} }));
    await page.addInitScript((mode) => localStorage.setItem('cabinet-theme', mode), theme);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    let failed = false;
    let completedSlowResponse = false;
    let requestedDevices = 0;
    await page.route(/\/api\/cabinet\/subscription\/purchase-preview(?:\?|$)/, async (route) => {
      const devices = route.request().postDataJSON().selection.devices;
      requestedDevices = devices;
      if (devices === 2) await new Promise((resolve) => setTimeout(resolve, 600));
      await route.fulfill({
        status: failed ? 503 : 200,
        json: failed
          ? { detail: 'Preview unavailable' }
          : {
              total_price_kopeks: devices * 9900,
              total_price_label: `${devices * 99} ₽`,
              breakdown: [
                { label: 'Период', value: '99 ₽' },
                { label: 'Устройства', value: `${devices * 99} ₽` },
              ],
              balance_kopeks: 125000,
              missing_amount_kopeks: 0,
              can_purchase: true,
            },
      });
      if (devices === 2) completedSlowResponse = true;
    });
    await page.goto('/subscription/purchase');
    const wizard = page.locator('[data-purchase-layout="classic"]');
    await wizard.getByRole('button', { name: /^Далее/ }).click();
    const summary = wizard.locator('[data-order-summary]');
    await expect(summary).toBeVisible();
    const previous = await summary.textContent();
    const previousBox = await summary.boundingBox();
    if (!previous || !previousBox) throw new Error('Confirmed summary must be visible');
    await wizard.getByRole('button', { name: '+', exact: true }).click();
    await expect(summary.locator('..')).toHaveAttribute('aria-busy', 'true');
    expect(await wizard.innerText()).not.toContain('Обновляем расчёт');
    await expect(summary).toHaveText(previous);
    const updatingBox = await summary.boundingBox();
    if (!updatingBox) throw new Error('Summary disappeared during recalculation');
    expect(updatingBox?.width).toBe(previousBox?.width);
    expect(updatingBox?.height).toBe(previousBox?.height);
    await page.screenshot({
      path: testInfo.outputPath(`summary-updating-${theme}.png`),
      fullPage: true,
    });
    await expect.poll(() => requestedDevices).toBe(2);
    await wizard.getByRole('button', { name: '+', exact: true }).click();
    await expect(summary.locator('[data-order-summary-detail]').last()).toHaveText('3 устройства');
    await expect(summary).toContainText('297.00 ₽');
    await expect.poll(() => completedSlowResponse).toBe(true);
    await expect(summary.locator('[data-order-summary-detail]').last()).toHaveText('3 устройства');
    await expect(summary).toContainText('297.00 ₽');

    failed = true;
    await wizard.getByRole('button', { name: '+', exact: true }).click();
    await expect(summary).toContainText('297.00 ₽');
    await wizard.getByRole('button', { name: /^Далее$/ }).click();
    const pay = wizard.getByRole('button', { name: 'Оплатить', exact: true });
    await expect(pay).toBeDisabled();
    await expect(wizard.getByRole('alert')).toContainText('Не удалось загрузить цену заказа', {
      timeout: 15000,
    });
    await expect(summary.locator('[data-order-summary-detail]').last()).toHaveText('3 устройства');
    failed = false;
    await wizard.getByRole('button', { name: 'Повторить', exact: true }).click();
    await expect(summary.locator('[data-order-summary-detail]').last()).toHaveText('4 устройства');
    await expect(summary).toContainText('396.00 ₽');
    await expect(pay).toBeEnabled();
    expect(apiRequests).not.toContain('POST /api/cabinet/subscription/purchase');
    expect([...unexpectedApiRequests]).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
