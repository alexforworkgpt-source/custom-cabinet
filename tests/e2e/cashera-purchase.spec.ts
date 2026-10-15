import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

for (const daily of [false, true]) {
  test(`Cashera ${daily ? 'daily' : 'periodic'} purchase sends only the tariff ID and server-defined terms`, async ({
    page,
  }) => {
    const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
      responses: {
        '/api/cabinet/subscription/purchase-options': {
          sales_mode: 'tariffs',
          current_tariff_id: null,
          balance_kopeks: 0,
          balance_label: '0 ₽',
          cashera_recurrent_enabled: true,
          tariffs: [
            {
              id: 7,
              name: 'Browser tariff',
              description: 'Browser tariff description',
              tier_level: 1,
              traffic_limit_gb: 100,
              traffic_limit_label: '100 GB',
              is_unlimited_traffic: false,
              device_limit: 1,
              extra_devices_count: 0,
              servers_count: 0,
              servers: [],
              periods: daily
                ? []
                : [
                    {
                      days: 30,
                      months: 1,
                      label: '30 days',
                      price_kopeks: 50000,
                      price_label: '500 ₽',
                      price_per_month_kopeks: 50000,
                      price_per_month_label: '500 ₽',
                    },
                  ],
              is_current: false,
              is_available: true,
              is_daily: daily,
              daily_price_kopeks: daily ? 5000 : 0,
            },
          ],
        },
      },
    });
    let received: { tariffId: string | null; body: unknown } | undefined;
    let calls = 0;
    await page.route(
      /\/api\/cabinet\/subscription\/cashera-recurrent\/purchase(?:\?|$)/,
      async (route) => {
        calls += 1;
        received = {
          tariffId: new URL(route.request().url()).searchParams.get('tariff_id'),
          body: route.request().postDataJSON(),
        };
        await route.fulfill({
          json: { status: 'PENDING', redirect_url: null, subscription_id: 42 },
        });
      },
    );
    await page.goto('/subscription/purchase');
    const card = page
      .getByText('Browser tariff description')
      .locator('xpath=ancestor::div[contains(@class, "bento-card-hover")][1]');
    await card.getByRole('button', { name: 'Purchase', exact: true }).click();
    const action = page.getByRole('button', { name: /Subscribe with Cashera auto-pay/ });
    await expect(action).toBeVisible();
    await expect(action).not.toContainText(/500|50|30|₽|\$/);
    await expect(
      page.getByText(
        'The server sets the recurring amount and period. They may differ from the selected balance purchase.',
      ),
    ).toBeVisible();
    expect((await action.boundingBox())?.height).toBeGreaterThanOrEqual(44);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    await action.click();
    await expect.poll(() => received).toEqual({ tariffId: '7', body: {} });
    expect(calls).toBe(1);
    expect(apiRequests).not.toContain('POST /api/cabinet/subscription/purchase-tariff');
    expect(apiRequests).not.toContain('POST /api/cabinet/balance/topup');
    expect([...unexpectedApiRequests]).toEqual([]);
  });
}
