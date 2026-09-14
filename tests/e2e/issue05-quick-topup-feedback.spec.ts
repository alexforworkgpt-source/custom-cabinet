import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

const paymentMethod = {
  id: 'test-card',
  name: 'Test Card',
  description: 'Local browser-test provider',
  min_amount_kopeks: 10_000,
  max_amount_kopeks: 100_000,
  is_available: true,
  quick_amounts: [10_000, 30_000, 50_000],
  open_url_direct: false,
};

test('shows pending feedback, blocks repeats, and recovers without a real payment @critical-flow', async ({
  page,
}) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/balance/payment-methods': [paymentMethod],
      // Safety fallback: the dedicated route below owns both attempts.
      '/api/cabinet/balance/topup': { detail: { code: 'unexpected_fallback' } },
    },
  });

  let releaseFirstResponse!: () => void;
  const firstResponseBarrier = new Promise<void>((resolve) => {
    releaseFirstResponse = resolve;
  });
  let requestCount = 0;

  await page.route('**/api/cabinet/balance/topup', async (route) => {
    requestCount += 1;
    if (requestCount === 1) {
      await firstResponseBarrier;
      await route.fulfill({
        status: 503,
        json: { detail: { code: 'provider_unavailable' } },
      });
      return;
    }

    await route.fulfill({
      status: 200,
      json: {
        payment_id: 'browser-payment-42',
        payment_url: 'https://payments.example.test/browser-payment-42',
        amount_kopeks: 30_000,
        amount_rubles: 300,
        status: 'pending',
        expires_at: null,
      },
    });
  });

  await page.goto('/balance/top-up/test-card?amount=300');
  const amountInput = page.getByLabel('Enter amount');
  const submit = page.getByRole('button', { name: 'Top Up' });
  await expect(submit).toBeVisible();

  await submit.click();
  const pending = page.getByRole('button', { name: 'Processing…' });
  await expect(pending).toBeVisible();
  await expect(pending).toBeDisabled();
  await expect(pending).toHaveAttribute('aria-busy', 'true');
  await expect.poll(() => requestCount).toBe(1);

  // Enter on the amount field calls the same public submit action. The synchronous
  // submission lock must reject it while the first provider request is unresolved.
  await amountInput.focus();
  await amountInput.press('Enter');
  await page.waitForTimeout(100);
  expect(requestCount).toBe(1);

  releaseFirstResponse();
  await expect(page.getByRole('alert')).toContainText(
    'Payment could not be created. Please try again.',
  );
  const retry = page.getByRole('button', { name: 'Top Up' });
  await expect(retry).toBeEnabled();

  await retry.focus();
  await expect(retry).toBeFocused();
  await retry.press('Enter');
  await expect(page.getByText('Payment link is ready')).toBeVisible();
  expect(requestCount).toBe(2);
  await expect(page).toHaveURL(/\/balance\/top-up\/test-card/);
  expect([...unexpectedApiRequests]).toEqual([]);
});
