import { expect, test, type Page } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

const period = (days: number, priceKopeks: number, isHighlighted = false) => ({
  days,
  months: days / 30,
  label: `${days} дней`,
  price_kopeks: priceKopeks,
  price_label: `${priceKopeks / 100} ₽`,
  price_per_month_kopeks: Math.round((priceKopeks * 30) / days),
  price_per_month_label: `${Math.round((priceKopeks * 30) / days) / 100} ₽`,
  is_highlighted: isHighlighted,
});

const tariff = (
  id: number,
  name: string,
  options: {
    description: string;
    highlighted?: boolean;
    dailyPriceKopeks?: number;
    originalDailyPriceKopeks?: number;
    periods?: ReturnType<typeof period>[];
    current?: boolean;
  },
) => ({
  id,
  name,
  description: options.description,
  is_highlighted: options.highlighted ?? false,
  tier_level: id,
  traffic_limit_gb: 100,
  traffic_limit_label: '100 ГБ',
  is_unlimited_traffic: false,
  device_limit: 3,
  extra_devices_count: 0,
  servers_count: 1,
  servers: [],
  periods: options.periods ?? [],
  is_current: options.current ?? false,
  is_available: true,
  is_daily: Boolean(options.dailyPriceKopeks),
  daily_price_kopeks: options.dailyPriceKopeks,
  original_daily_price_kopeks: options.originalDailyPriceKopeks,
});

const expiredSubscription = {
  id: 42,
  status: 'expired',
  is_trial: false,
  start_date: '2026-08-01T00:00:00Z',
  end_date: '2026-09-01T00:00:00Z',
  days_left: 0,
  hours_left: 0,
  minutes_left: 0,
  time_left_display: '0 дней',
  traffic_limit_gb: 100,
  traffic_used_gb: 10,
  traffic_used_percent: 10,
  device_limit: 3,
  connected_squads: [],
  servers: [],
  autopay_enabled: false,
  autopay_days_before: 3,
  subscription_url: null,
  hide_subscription_link: false,
  is_active: false,
  is_expired: true,
  is_limited: false,
  tariff_id: 1,
  tariff_name: 'Базовый',
};

const activeSubscription = {
  ...expiredSubscription,
  status: 'active',
  end_date: '2026-09-10T00:00:00Z',
  days_left: 1,
  time_left_display: '1 день',
  is_active: true,
  is_expired: false,
};

function cardFor(page: Page, description: string) {
  return page
    .getByText(description, { exact: true })
    .locator('xpath=ancestor::div[contains(@class, "bento-card-hover")][1]');
}

function expectNoMoneyMutation(apiRequests: string[]) {
  expect(apiRequests).not.toContain('POST /api/cabinet/subscription/tariff/purchase');
  expect(apiRequests).not.toContain('POST /api/cabinet/subscription/renew');
  expect(apiRequests).not.toContain('POST /api/cabinet/subscription/tariff/switch');
}

test('shows one daily quote and best-value purchase choices in dark and light themes @critical-flow', async ({
  page,
}) => {
  const daily = tariff(7, 'Суточный', {
    description: 'Цена за день',
    dailyPriceKopeks: 1_200,
    originalDailyPriceKopeks: 1_500,
  });
  const recommended = tariff(8, 'Про', {
    description: 'Рекомендуемый тариф',
    highlighted: true,
    periods: [period(30, 60_000), period(180, 270_000, true)],
  });
  const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      '/api/cabinet/promo/active-discount': {
        discount_percent: 20,
        source: 'browser-test',
        expires_at: '2026-09-10T00:00:00Z',
        is_active: true,
      },
      '/api/cabinet/subscription/purchase-options': {
        sales_mode: 'tariffs',
        tariffs: [daily, recommended],
        current_tariff_id: null,
        balance_kopeks: 1_000_000,
        balance_label: '10 000 ₽',
      },
    },
  });
  await page.addInitScript(() => {
    if (window.name === 'dark' || window.name === 'light') {
      localStorage.setItem('cabinet-theme', window.name);
    }
  });

  for (const theme of ['dark', 'light']) {
    await page.evaluate((value) => {
      window.name = value;
    }, theme);
    await page.goto('/subscription/purchase');
    await expect(page.locator('html')).toHaveClass(new RegExp(theme));

    const dailyCard = cardFor(page, 'Цена за день');
    const dailyCardQuote = dailyCard.locator('.font-medium.text-accent-400');
    await expect(dailyCardQuote).toHaveText('9.60 ₽');
    const cardQuote = (await dailyCardQuote.textContent())?.trim();
    expect(cardQuote).toBe('9.60 ₽');
    await dailyCard.getByRole('button', { name: 'Купить' }).click();
    const activationQuote = (
      await page.locator('.text-3xl.font-bold.text-accent-400').textContent()
    )?.trim();
    expect(activationQuote).toBe(cardQuote);
    await expect(page.getByText('-36%', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: /Назад/ }).click();

    const recommendedCard = cardFor(page, 'Рекомендуемый тариф');
    await expect(recommendedCard).toHaveCSS('border-top-width', '2px');
    await expect(recommendedCard.getByText('Выгодно', { exact: true })).toBeVisible();
    await recommendedCard.getByRole('button', { name: 'Купить' }).click();
    const bestPeriod = page
      .getByText('180 дней', { exact: true })
      .locator('xpath=ancestor::button[1]');
    await expect(bestPeriod).toHaveCSS('border-top-width', '2px');
    await expect(bestPeriod.getByText('Выгодно', { exact: true })).toBeVisible();
  }

  expectNoMoneyMutation(apiRequests);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('opens renewal period choice without charging the default month @critical-flow', async ({
  page,
}) => {
  const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      '/api/cabinet/subscription': {
        has_subscription: true,
        subscription: expiredSubscription,
      },
      '/api/cabinet/subscriptions': {
        subscriptions: [expiredSubscription],
        multi_tariff_enabled: false,
      },
      '/api/cabinet/subscription/renewal-options': [
        {
          period_days: 30,
          price_kopeks: 60_000,
          price_rubles: 600,
          discount_percent: 0,
          original_price_kopeks: null,
        },
        {
          period_days: 180,
          price_kopeks: 270_000,
          price_rubles: 2_700,
          discount_percent: 25,
          original_price_kopeks: 360_000,
          is_highlighted: true,
        },
      ],
      '/api/cabinet/subscription/purchase-options': { balance_kopeks: 0 },
    },
  });

  await page.goto('/subscriptions/42/renew');
  const bestPeriod = page
    .getByText('180 дней', { exact: true })
    .locator('xpath=ancestor::button[1]');
  await expect(bestPeriod.getByText('Выгодно', { exact: true })).toBeVisible();
  await expect(bestPeriod).toHaveCSS('border-top-width', '2px');
  await bestPeriod.click();
  await expect(page.getByRole('button', { name: 'Продлить подписку' })).toBeVisible();
  await expect(bestPeriod).toHaveCSS('border-top-width', '1px');

  expectNoMoneyMutation(apiRequests);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('uses the Upstream Bot last-day switch quote on desktop and mobile @critical-flow', async ({
  page,
}) => {
  const current = tariff(1, 'Базовый', {
    description: 'Текущий тариф',
    periods: [period(30, 30_000)],
    current: true,
  });
  const target = tariff(2, 'Про', {
    description: 'Тариф для перехода',
    periods: [period(30, 50_000)],
  });
  const { apiRequests, unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      '/api/cabinet/subscription': {
        has_subscription: true,
        subscription: activeSubscription,
      },
      '/api/cabinet/subscriptions': {
        subscriptions: [activeSubscription],
        multi_tariff_enabled: false,
      },
      '/api/cabinet/subscription/purchase-options': {
        sales_mode: 'tariffs',
        tariffs: [current, target],
        current_tariff_id: 1,
        balance_kopeks: 100_000,
        balance_label: '1 000 ₽',
        subscription_status: 'active',
        subscription_is_expired: false,
      },
      '/api/cabinet/subscription/tariff/switch/preview': {
        can_switch: true,
        current_tariff_id: 1,
        current_tariff_name: 'Базовый',
        new_tariff_id: 2,
        new_tariff_name: 'Про',
        remaining_days: 1,
        upgrade_cost_kopeks: 1_200,
        upgrade_cost_label: '12 ₽',
        balance_kopeks: 100_000,
        balance_label: '1 000 ₽',
        has_enough_balance: true,
        missing_amount_kopeks: 0,
        missing_amount_label: '0 ₽',
        is_upgrade: true,
      },
    },
  });

  await page.goto('/subscription/purchase?subscriptionId=42');
  await cardFor(page, 'Тариф для перехода').getByRole('button', { name: 'Перейти' }).click();
  await expect(page.getByText('Осталось дней').locator('..')).toContainText('1');
  await expect(page.getByText('12 ₽', { exact: true })).toBeVisible();
  await expect(page.getByText('Бесплатно', { exact: true })).toHaveCount(0);

  expect(apiRequests).toContain('POST /api/cabinet/subscription/tariff/switch/preview');
  expectNoMoneyMutation(apiRequests);
  expect([...unexpectedApiRequests]).toEqual([]);
});
