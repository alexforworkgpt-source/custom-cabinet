import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription } from './classicRenewalFixture';

test('HOT Pay recovers the confirmed checkout after a period change and lost response @critical-flow', async ({
  page,
}) => {
  test.skip(process.env.VITE_UPSTREAM_BOT_SHA !== '64beb370e6d69b23d3b651f91033f3b72e9e1f56');
  await prepareAuthenticatedPage(page, {
    responses: {
      ...responses,
      '/api/cabinet/subscription/purchase-options': {
        ...responses['/api/cabinet/subscription/purchase-options'],
        periods: responses['/api/cabinet/subscription/renewal-options'].map((option) => ({
          ...option,
          is_available: true,
        })),
      },
      '/api/cabinet/subscription/payhot-recurrent': {
        status: 'none',
        enabled: true,
        methods: ['card'],
      },
    },
  });

  const quotes: unknown[] = [];
  const attempts: { quote_id: string; checkout_id: string }[] = [];
  await page.route('**/api/cabinet/subscription/payhot-recurrent/quote', async (route) => {
    quotes.push(route.request().postDataJSON());
    await route.fulfill({
      json: {
        quote_id: 'b537fce5-c038-4f1d-b08f-b0c5c7598b86',
        expires_at: '2099-01-01T00:00:00Z',
        amount_kopeks: 50_000,
        period_days: 30,
        payment_method: 'card',
        source_subscription_id: subscription.id,
        first_payment_required: true,
      },
    });
  });
  await page.route('**/api/cabinet/subscription/payhot-recurrent/purchase', async (route) => {
    attempts.push(route.request().postDataJSON());
    if (attempts.length === 1) {
      await route.abort('connectionreset');
    } else {
      await route.fulfill({ json: { status: 'REVIEW', subscription_id: subscription.id } });
    }
  });

  await page.goto(`/subscriptions/${subscription.id}`);
  const panel = page.getByRole('region', { name: 'HOT Pay autopay' });
  await panel.getByRole('button', { name: 'Set up HOT Pay autopay' }).click();
  await expect(panel.getByText(/for 30 days via Card/)).toBeVisible();
  expect(attempts).toHaveLength(0);
  await panel.getByRole('button', { name: 'Pay for the period and enable' }).click();
  await expect(panel.getByRole('alert')).toBeVisible();
  await panel.getByRole('button', { name: '90 days', exact: true }).click();
  await panel.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(panel.getByText(/Checking the payment result/)).toBeVisible();
  await expect(panel.getByRole('alert')).toHaveCount(0);
  expect(quotes).toEqual([
    { subscription_id: subscription.id, tariff_id: null, period_days: 30, payment_method: 'card' },
  ]);
  expect(attempts).toHaveLength(2);
  expect(attempts[0].checkout_id).toMatch(/^[0-9a-f-]{36}$/i);
  expect(attempts[1]).toEqual(attempts[0]);
});
