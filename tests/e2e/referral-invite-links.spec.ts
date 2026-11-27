import { expect, test } from '@playwright/test';
import { baseApiResponses, prepareAuthenticatedPage } from './cabinetTestHarness';

const path = '/api/cabinet/referral';
const botUrl = 'https://t.me/example_bot?start=invite-35';

for (const hasBotLink of [false, true]) {
  test(`invitation header points to the ${hasBotLink ? 'two links' : 'cabinet link'} in a single section`, async ({
    page,
  }) => {
    await prepareAuthenticatedPage(page, {
      responses: {
        [path]: {
          ...(baseApiResponses[path] as Record<string, unknown>),
          referral_code: 'r-35',
          bot_referral_link: hasBotLink ? botUrl : '',
          total_referrals: 7,
        },
        '/api/cabinet/referral/terms': {
          ...(baseApiResponses['/api/cabinet/referral/terms'] as Record<string, unknown>),
          is_enabled: true,
          commission_percent: 10,
        },
        '/api/cabinet/referral/list': { items: [], total: 0 },
        '/api/cabinet/referral/earnings': { items: [], total: 0 },
        '/api/cabinet/referral/partner/status': { partner_status: 'none' },
        '/api/cabinet/referral/withdrawal/balance': { is_withdrawal_enabled: false },
        '/api/cabinet/referral/withdrawal/history': { items: [], total: 0 },
      },
    });
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text: string) => sessionStorage.setItem('test-copied-link', text),
        },
      });
      Object.defineProperty(navigator, 'share', {
        configurable: true,
        value: async (data: ShareData) =>
          sessionStorage.setItem('test-shared-link', data.url ?? ''),
      });
    });
    await page.goto('/referral');
    const invite = page.getByRole('region', { name: 'Invite Friends' });
    await expect(invite).toBeVisible();
    await expect(invite).toContainText(
      hasBotLink ? 'Your cabinet and bot links are below.' : 'Your invitation link is below.',
    );
    const links = page.getByRole('region', { name: 'Your Referral Links' });
    const cabinetUrl = new URL('/login?ref=r-35', page.url()).href;
    await expect(page.getByText('Total Referrals', { exact: true })).toBeVisible();
    await expect(page.getByText('7', { exact: true })).toBeVisible();
    await expect(links.getByRole('textbox')).toHaveCount(hasBotLink ? 2 : 1);
    await expect(links.getByRole('textbox').last()).toHaveValue(cabinetUrl);
    const copyName = 'Copy';
    if (hasBotLink) {
      await expect(links.getByRole('textbox').first()).toHaveValue(botUrl);
      await links.getByRole('button', { name: copyName, exact: true }).first().click();
      await expect
        .poll(() => page.evaluate(() => sessionStorage.getItem('test-copied-link')))
        .toBe(botUrl);
    }
    await links.getByRole('button', { name: copyName, exact: true }).last().click();
    await expect
      .poll(() => page.evaluate(() => sessionStorage.getItem('test-copied-link')))
      .toBe(cabinetUrl);
    await links.getByRole('button', { name: 'Share', exact: true }).click();
    await expect
      .poll(() => page.evaluate(() => sessionStorage.getItem('test-shared-link')))
      .toBe(cabinetUrl);
  });
}

test('a disabled referral program shows its state without invitation actions', async ({ page }) => {
  await prepareAuthenticatedPage(page);
  await page.goto('/referral');
  await expect(page.getByText('Referral program is currently disabled')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Invite Friends' })).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Your Referral Links' })).toHaveCount(0);
});

test('an invitation error leaves the independent partner status visible', async ({ page }) => {
  await prepareAuthenticatedPage(page, {
    responseStatuses: { [path]: 503 },
    responses: {
      '/api/cabinet/referral/terms': {
        ...(baseApiResponses['/api/cabinet/referral/terms'] as Record<string, unknown>),
        is_enabled: true,
      },
      '/api/cabinet/referral/partner/status': { partner_status: 'pending' },
    },
  });
  await page.goto('/referral');
  await expect(page.getByRole('alert')).toContainText('Could not load referral data.');
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
  const partner = page.getByRole('button', { name: 'Partner', exact: true });
  if (await partner.isVisible()) await partner.click();
  await expect(page.getByRole('heading', { name: 'Application Under Review' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Your Referral Links' })).toHaveCount(0);
});
