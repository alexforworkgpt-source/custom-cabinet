import { expect, test, type Locator } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { responses, subscription } from './classicRenewalFixture';

async function presentation(badges: Locator) {
  return badges.evaluateAll((elements) =>
    elements.map((element) => {
      const style = getComputedStyle(element);
      const icon = element.querySelector('svg');
      return {
        font: style.fontSize,
        line: style.lineHeight,
        weight: style.fontWeight,
        casing: style.textTransform,
        radius: style.borderRadius,
        paddingX: style.paddingLeft,
        paddingY: style.paddingTop,
        gap: style.columnGap,
        icon: icon
          ? {
              width: icon.getBoundingClientRect().width,
              height: icon.getBoundingClientRect().height,
            }
          : null,
      };
    }),
  );
}

for (const language of ['ru', 'en', 'fa', 'zh']) {
  for (const theme of ['light', 'dark']) {
    for (const trial of [false, true]) {
      test(`conditions badges match Dashboard ${language} ${theme} ${trial ? 'trial' : 'paid'}`, async ({
        page,
      }, info) => {
        const current = {
          ...subscription,
          tariff_name:
            language === 'fa'
              ? 'اشتراک خانوادگی با نام بسیار طولانی'
              : 'Семейная подписка с длинным названием',
          status: trial ? 'trial' : 'active',
          is_trial: trial,
          is_active: true,
        };
        const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
          language,
          responses: {
            ...responses,
            '/api/cabinet/subscription': { has_subscription: true, subscription: current },
            '/api/cabinet/subscriptions': { subscriptions: [current], multi_tariff_enabled: false },
          },
        });
        await page.addInitScript((value) => localStorage.setItem('cabinet-theme', value), theme);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto('/');
        const reference = page.locator('section[aria-labelledby="subscription-summary-title"]');
        await expect(reference).toBeVisible();
        await page.evaluate(() => document.fonts.ready.then(() => undefined));
        const expected = await presentation(reference.locator('span.uppercase'));
        expect(expected).toHaveLength(trial ? 1 : 2);
        for (const route of ['/subscriptions/42', '/subscriptions/42/renew']) {
          await page.goto(route);
          const card = page.locator(
            route.endsWith('/renew') ? '[data-renewal-info]' : '[data-subscription-overview]',
          );
          const header = card.locator('[data-subscription-identity]');
          await expect(header).toBeVisible();
          await page.evaluate(() => document.fonts.ready.then(() => undefined));
          const badges = header.locator(':scope > span, :scope > h2');
          expect(await presentation(badges)).toEqual(expected);
          await expect(header.getByRole('heading', { level: 2 })).toHaveCount(1);
          if (trial) {
            await expect(header.locator('[data-subscription-status]')).toHaveCount(0);
            await expect(header).not.toContainText(current.tariff_name);
          } else {
            await expect(
              header.getByRole('heading', { name: current.tariff_name, exact: true }),
            ).toBeVisible();
          }
          expect(
            await header.evaluate((element) => element.scrollWidth <= element.clientWidth),
          ).toBe(true);
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          ).toBe(true);
          if (language === 'ru' && ['mobile-320', 'desktop-1280'].includes(info.project.name)) {
            await card.screenshot({
              path: info.outputPath(
                `${trial ? 'trial' : 'paid'}-${route.endsWith('/renew') ? 'renewal' : 'management'}-${theme}.png`,
              ),
            });
          }
        }
        expect(
          apiRequests.filter((request) => /^POST .*subscription\/(renew|purchase)/.test(request)),
        ).toEqual([]);
        expect([...unexpectedApiRequests]).toEqual([]);
      });
    }
  }
}

test('expired trial keeps its expired status beside the trial badge on both cards', async ({
  page,
}) => {
  const current = {
    ...subscription,
    status: 'expired',
    is_trial: true,
    is_active: false,
    is_expired: true,
  };
  await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      ...responses,
      '/api/cabinet/subscription': { has_subscription: true, subscription: current },
      '/api/cabinet/subscriptions': { subscriptions: [current], multi_tariff_enabled: false },
    },
  });
  for (const route of ['/subscriptions/42', '/subscriptions/42/renew']) {
    await page.goto(route);
    const header = page.locator('[data-subscription-identity]:visible');
    await expect(header.getByText('Истекла', { exact: true })).toBeVisible();
    await expect(header.getByRole('heading', { name: 'Пробный', exact: true })).toBeVisible();
    await expect(header.locator('svg')).toHaveCount(2);
  }
});
