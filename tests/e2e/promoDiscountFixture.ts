import { expect, type Page } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription } from './classicRenewalFixture';
import { classicPurchaseOptions } from './classicPurchasePricingFixture';

export const activeDiscount = {
  is_active: true,
  discount_percent: 20,
  source: 'offer:1',
  expires_at: '2030-01-01T00:00:00Z',
};

export async function preparePromoPage(page: Page, overrides: Record<string, unknown> = {}) {
  const requests: { method: string; url: URL; body: unknown }[] = [];
  page.on('request', (request) => {
    if (!request.url().includes('/api/cabinet/')) return;
    requests.push({
      method: request.method(),
      url: new URL(request.url()),
      body: request.postData() ? request.postDataJSON() : null,
    });
  });
  await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscription/purchase-options': classicPurchaseOptions,
      '/api/cabinet/promo/active-discount': activeDiscount,
      '/api/cabinet/promo/offers': [],
      '/api/cabinet/subscription/purchase-preview': {
        total_price_kopeks: 7920,
        total_price_label: '79.20 ₽',
        balance_kopeks: 125000,
        missing_amount_kopeks: 0,
        can_purchase: true,
        breakdown: [],
      },
      ...overrides,
    },
  });
  await page.route('**/cabinet/activity/events', (route) =>
    route.fulfill({ status: 204, body: '' }),
  );
  return {
    requests,
    expectNoPayment() {
      expect(
        requests.filter(
          ({ method, url }) =>
            method === 'POST' &&
            /\/subscription\/(purchase(?:-tariff)?|renew|devices\/purchase)$/.test(url.pathname),
        ),
      ).toEqual([]);
    },
  };
}

export { subscription };
