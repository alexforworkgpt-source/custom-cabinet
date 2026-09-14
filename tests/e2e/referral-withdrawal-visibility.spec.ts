import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

const referralResponses = {
  '/api/cabinet/referral': {
    referral_code: 'ISSUE09',
    referral_link: 'https://example.test/r/ISSUE09',
    bot_referral_link: '',
    total_referrals: 1,
    active_referrals: 1,
    total_earnings_kopeks: 5000,
    total_earnings_rubles: 50,
    commission_percent: 10,
    available_balance_kopeks: 5000,
    available_balance_rubles: 50,
    withdrawn_kopeks: 0,
  },
  '/api/cabinet/referral/terms': {
    is_enabled: true,
    scheme: 'legacy',
    commission_percent: 10,
    minimum_topup_kopeks: 10000,
    minimum_topup_rubles: 100,
    first_topup_bonus_kopeks: 0,
    first_topup_bonus_rubles: 0,
    inviter_bonus_kopeks: 0,
    inviter_bonus_rubles: 0,
    max_commission_payments: 0,
    partner_section_visible: true,
  },
  '/api/cabinet/referral/list': { items: [], total: 0, page: 1, per_page: 10, pages: 1 },
  '/api/cabinet/referral/earnings': {
    items: [],
    total: 0,
    total_amount_kopeks: 0,
    total_amount_rubles: 0,
    total_days_granted: 0,
    page: 1,
    per_page: 10,
    pages: 1,
  },
  '/api/cabinet/referral/partner/status': { partner_status: 'none' },
  '/api/cabinet/referral/withdrawal/history': { items: [], total: 0 },
};

function mobileOnly(testInfo: TestInfo) {
  test.skip(
    !['mobile-320', 'mobile-375'].includes(testInfo.project.name),
    'Issue 09 verifies the requested 320px and 375px mobile widths',
  );
}

async function prepareReferral(page: Page, withdrawalEnabled: boolean) {
  return prepareAuthenticatedPage(page, {
    featureFlags: { referralEnabled: true },
    responses: {
      ...referralResponses,
      '/api/cabinet/referral/withdrawal/balance': {
        total_earned: 5000,
        referral_spent: 0,
        withdrawn: 0,
        pending: 0,
        available_referral: 5000,
        available_total: 5000,
        only_referral_mode: false,
        min_amount_kopeks: 100000,
        is_withdrawal_enabled: withdrawalEnabled,
        can_request: withdrawalEnabled,
        cannot_request_reason: withdrawalEnabled ? null : 'INTERNAL_WITHDRAWAL_DISABLED_DETAIL',
        requisites_text: '',
      },
    },
  });
}

async function expectNoHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => window.innerWidth),
  );
}

test('removes a disabled withdrawal without leaving an action or service reason', async ({
  page,
}, testInfo) => {
  mobileOnly(testInfo);
  const { apiRequests, unexpectedApiRequests } = await prepareReferral(page, false);

  await page.goto('/referral');
  await expect(page.getByRole('heading', { name: 'Referral Program' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Withdrawal' })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Request Withdrawal' })).toHaveCount(0);
  await expect(page.getByText('INTERNAL_WITHDRAWAL_DISABLED_DETAIL')).toHaveCount(0);

  await page.getByRole('button', { name: 'Partner' }).click();
  await expect(
    page.getByText('Apply for the partner program to get higher commission rates.'),
  ).toBeVisible();
  await expect(page.getByText(/ability to withdraw your earnings/)).toHaveCount(0);

  expect(apiRequests.filter((request) => request.includes('/withdrawal/'))).toEqual([
    'GET /api/cabinet/referral/withdrawal/balance',
    'GET /api/cabinet/referral/withdrawal/history',
  ]);
  expect(apiRequests).not.toContain('POST /api/cabinet/referral/withdrawal/create');
  await expectNoHorizontalOverflow(page);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('keeps the enabled withdrawal action available without performing it', async ({
  page,
}, testInfo) => {
  mobileOnly(testInfo);
  const { apiRequests, unexpectedApiRequests } = await prepareReferral(page, true);

  await page.goto('/referral');
  const withdrawal = page.getByRole('button', { name: 'Withdrawal' });
  await expect(withdrawal).toBeVisible();
  await withdrawal.click();
  await expect(page.getByRole('button', { name: 'Request Withdrawal' })).toBeVisible();

  expect(apiRequests).not.toContain('POST /api/cabinet/referral/withdrawal/create');
  await expectNoHorizontalOverflow(page);
  expect([...unexpectedApiRequests]).toEqual([]);
});
