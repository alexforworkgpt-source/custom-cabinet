import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';
import { classicPurchaseOptions } from './classicPurchasePricingFixture';
import { responses } from './classicRenewalFixture';

for (const theme of ['dark', 'light']) {
  for (const language of ['ru', 'en', 'fa']) {
    for (const mode of ['classic', 'tariff', 'renewal']) {
      test(`compact period cards: ${mode} ${theme} ${language}`, async ({ page }, testInfo) => {
        const periods = classicPurchaseOptions.periods;
        const tariff = {
          id: 7,
          name: 'Базовый',
          description: 'Тариф для проверки',
          traffic_limit_label: '100 ГБ',
          device_limit: 3,
          servers: [],
          periods: periods.map((period, index) => ({
            ...period,
            days: period.period_days,
            is_highlighted: index === 5,
          })),
        };
        const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
          language,
          responses: {
            ...(mode === 'renewal' ? responses : {}),
            ...(mode === 'renewal'
              ? {
                  '/api/cabinet/subscription': {
                    has_subscription: true,
                    subscription: {
                      ...responses['/api/cabinet/subscription'].subscription,
                      tariff_name: 'Базовый',
                    },
                  },
                  '/api/cabinet/subscription/renewal-options': periods.map((period, index) => ({
                    period_days: period.period_days,
                    price_kopeks: period.price_kopeks,
                    original_price_kopeks: period.original_price_kopeks,
                    discount_percent: [0, 0, 5, 10, 15, 25][index],
                    is_highlighted: index === 5,
                  })),
                }
              : {}),
            '/api/cabinet/subscription/purchase-options':
              mode === 'classic'
                ? classicPurchaseOptions
                : {
                    sales_mode: 'tariffs',
                    tariffs: [
                      tariff,
                      {
                        ...tariff,
                        id: 8,
                        name: 'Расширенный',
                        description: null,
                        periods: tariff.periods.slice(3),
                      },
                      {
                        ...tariff,
                        id: 9,
                        name: 'Суточный',
                        description: 'Дополнительное описание тарифа для проверки выравнивания',
                        daily_price_kopeks: 1000,
                        original_daily_price_kopeks: 1500,
                        is_daily: true,
                      },
                    ],
                    balance_kopeks: 125_000,
                  },
            '/api/cabinet/subscription/purchase-preview': {
              total_price_kopeks: 5_000,
              total_price_label: '50 ₽',
              balance_kopeks: 125_000,
              missing_amount_kopeks: 0,
              can_purchase: true,
              breakdown: [],
            },
          },
        });
        await page.addInitScript((value) => localStorage.setItem('cabinet-theme', value), theme);
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(mode === 'renewal' ? '/subscriptions/42/renew' : '/subscription/purchase');
        if (mode === 'tariff') {
          await expect(page.getByText('Суточный', { exact: true })).toBeVisible();
          const tariffGeometry = await page.locator('div.bento-card-hover').evaluateAll((cards) =>
            cards.map((card) => {
              const price = card.querySelector('.text-2xl');
              if (!price) throw new Error('Missing tariff price');
              return {
                height: card.getBoundingClientRect().height,
                priceBottom:
                  card.getBoundingClientRect().bottom - price.getBoundingClientRect().bottom,
              };
            }),
          );
          expect(tariffGeometry).toHaveLength(3);
          expect(
            Math.max(...tariffGeometry.map((item) => item.height)) -
              Math.min(...tariffGeometry.map((item) => item.height)),
          ).toBeLessThanOrEqual(1);
          expect(
            Math.max(...tariffGeometry.map((item) => item.priceBottom)) -
              Math.min(...tariffGeometry.map((item) => item.priceBottom)),
          ).toBeLessThanOrEqual(1);
          await page
            .getByText('Тариф для проверки', { exact: true })
            .locator('..')
            .locator('..')
            .locator('..')
            .getByRole('button')
            .click();
        }
        const first = page.getByRole('button', { name: mode === 'renewal' ? /^30 / : /^14 / });
        await expect(first).toBeVisible();
        const cards = first.locator('..').locator(':scope > button');
        if (language === 'ru') {
          const annualPeriod = cards.filter({ hasText: '360 дней' });
          await expect(annualPeriod.getByText('74 ₽/мес', { exact: true })).toBeVisible();
          await expect(annualPeriod.getByText('891.00 ₽', { exact: true })).toBeVisible();
          await expect(
            cards.filter({ hasText: '60 дней' }).getByText('188.10 ₽', { exact: true }),
          ).toBeVisible();
        }
        if (mode === 'renewal') {
          await expect(page.locator('[data-renewal-panel]')).toHaveCSS('border-top-width', '0px');
          await expect(page.locator('[data-renewal-panel]')).toHaveCSS(
            'background-color',
            'rgba(0, 0, 0, 0)',
          );
          await expect(page.getByRole('heading', { level: 1 }).locator('..')).not.toContainText(
            'Базовый',
          );
          await expect(cards.getByRole('img')).toHaveCount(1);
          const favorite = cards.filter({ has: page.getByRole('img') });
          await expect(
            favorite.locator('.rounded-full').filter({ hasText: /^-25%$/ }),
          ).toBeVisible();
          const positions = await favorite.evaluate((card) => {
            const star = card.querySelector('[role="img"]');
            const header = card.firstElementChild;
            if (!star || !header) throw new Error('Missing favorite star or header');
            return {
              starBottom: star.getBoundingClientRect().bottom,
              headerBottom: header.getBoundingClientRect().bottom,
            };
          });
          expect(positions.starBottom).toBeLessThanOrEqual(positions.headerBottom);
          if (language === 'ru')
            await expect(favorite.getByText('Выгодно', { exact: true })).toHaveCount(0);
        }
        const geometry = await cards.evaluateAll((elements) =>
          elements.map((element) => {
            const card = element.getBoundingClientRect();
            const priceElement = element.querySelector('.text-xl');
            const headerElement = element.firstElementChild;
            if (!priceElement || !headerElement) throw new Error('Missing card price or header');
            const price = priceElement.getBoundingClientRect();
            const header = headerElement.getBoundingClientRect();
            const discount = element.querySelector('.rounded-full');
            const label = headerElement.firstElementChild;
            if (!label) throw new Error('Missing period label');
            const labelBox = label.getBoundingClientRect();
            const discountBox = discount?.getBoundingClientRect();
            return {
              height: card.height,
              priceBottom: card.bottom - price.bottom,
              fits: element.scrollWidth <= element.clientWidth,
              headerFits: !discount || discount.getBoundingClientRect().bottom <= header.bottom,
              labelFits:
                label.getBoundingClientRect().height <=
                parseFloat(getComputedStyle(label).lineHeight) + 1,
              noOverlap:
                !discountBox ||
                labelBox.right <= discountBox.left ||
                labelBox.left >= discountBox.right ||
                labelBox.bottom <= discountBox.top ||
                labelBox.top >= discountBox.bottom,
            };
          }),
        );
        expect(geometry.length).toBeGreaterThan(1);
        expect(
          Math.max(...geometry.map((item) => item.height)) -
            Math.min(...geometry.map((item) => item.height)),
        ).toBeLessThanOrEqual(1);
        expect(
          Math.max(...geometry.map((item) => item.priceBottom)) -
            Math.min(...geometry.map((item) => item.priceBottom)),
        ).toBeLessThanOrEqual(1);
        expect(
          geometry.every(
            (item) => item.fits && item.headerFits && item.labelFits && item.noOverlap,
          ),
        ).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await first.focus();
        await page.keyboard.press('Enter');
        if (mode !== 'tariff') await expect(first).toHaveAttribute('aria-pressed', 'true');
        if (mode === 'renewal') {
          const labelsFit = await cards.evaluateAll((items) =>
            items.every((card) => {
              const label = card.firstElementChild?.firstElementChild;
              if (!label) throw new Error('Missing period label');
              return (
                label.getBoundingClientRect().height <=
                parseFloat(getComputedStyle(label).lineHeight) + 1
              );
            }),
          );
          expect(labelsFit).toBe(true);
        }
        expect(apiRequests.some((request) => /^POST .*\/(purchase|renew)$/.test(request))).toBe(
          false,
        );
        expect([...unexpectedApiRequests]).toEqual([]);
        if (language === 'ru' && ['mobile-320', 'desktop-1280'].includes(testInfo.project.name)) {
          await page.screenshot({
            path: testInfo.outputPath(`${mode}-${theme}.png`),
            fullPage: true,
          });
        }
      });
    }
  }
}
