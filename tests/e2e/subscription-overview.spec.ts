import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription } from './classicRenewalFixture';

const states = [
  { name: 'active', isTrial: false, isActive: true, expired: false, label: 'Активна' },
  { name: 'expired', isTrial: false, isActive: false, expired: true, label: 'Истекла' },
  { name: 'trial', isTrial: true, isActive: true, expired: false, label: 'Пробный' },
];

const variants = [
  ...states.flatMap((state) =>
    ['light', 'dark'].map((theme) => ({ state, theme, language: 'ru' })),
  ),
  ...['en', 'fa', 'zh'].flatMap((language) =>
    ['light', 'dark'].map((theme) => ({ state: states[0], theme, language })),
  ),
  { state: states[0], theme: 'operator', language: 'ru' },
];

for (const { state, theme, language } of variants) {
  test(`compact subscription overview ${state.name} ${theme} ${language}`, async ({
    page,
  }, info) => {
    const current = {
      ...subscription,
      tariff_name: 'Семейная подписка с длинным названием',
      status: state.name,
      is_trial: state.isTrial,
      is_active: state.isActive,
      is_expired: state.expired,
      end_date: state.expired ? '2026-10-19T00:00:00Z' : '2027-01-24T00:00:00Z',
      servers: [
        { uuid: 'nl', name: 'Нидерланды', country_code: 'NL' },
        { uuid: 'de', name: 'Германия', country_code: 'DE' },
        { uuid: 'fi', name: 'Финляндия', country_code: 'FI' },
      ],
    };
    const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
      language,
      responses: {
        ...responses,
        '/api/cabinet/subscription': { has_subscription: true, subscription: current },
        '/api/cabinet/subscriptions': { subscriptions: [current], multi_tariff_enabled: false },
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
    await page.addInitScript((nextTheme) => {
      localStorage.setItem('cabinet-theme', nextTheme === 'operator' ? 'light' : nextTheme);
      Date.now = () => Date.parse('2026-10-20T00:00:00Z');
    }, theme);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/subscriptions/42');
    const overview = page.locator('[data-subscription-overview]');
    await expect(
      overview.getByRole('heading', {
        name: state.isTrial ? 'Пробный' : current.tariff_name,
        exact: true,
      }),
    ).toBeVisible();
    if (language === 'ru')
      await expect(overview.getByText(state.label, { exact: true })).toBeVisible();
    await expect(overview.locator('time')).toHaveAttribute('dateTime', current.end_date);
    await expect(overview).toContainText('🇳🇱 · 🇩🇪 · 🇫🇮');
    await expect(overview).not.toContainText('subscription.');
    await expect(overview.getByRole('button')).toHaveCount(0);
    await expect(overview.getByRole('note')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(
      apiRequests.filter((request) => /^POST .*subscription\/(purchase|renew)/.test(request)),
    ).toEqual([]);
    expect([...unexpectedApiRequests]).toEqual([]);
    await page.evaluate(() => document.fonts.ready.then(() => undefined));
    if (language === 'ru' && ['mobile-320', 'desktop-1280'].includes(info.project.name)) {
      await page.screenshot({
        path: info.outputPath(`overview-${state.name}-${theme}.png`),
        fullPage: true,
      });
    }
    await page.reload();
    await expect(
      overview.getByRole('heading', {
        name: state.isTrial ? 'Пробный' : current.tariff_name,
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
}
