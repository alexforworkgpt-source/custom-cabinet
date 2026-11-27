import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

function deferred() {
  let release = () => {};
  const promise = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { promise, release };
}

const subscription = {
  id: 7,
  status: 'active',
  is_trial: false,
  is_active: true,
  is_expired: false,
  is_limited: false,
  end_date: '2027-01-15T00:00:00Z',
  days_left: 60,
  traffic_limit_gb: 0,
  traffic_used_gb: 10,
  traffic_used_percent: 0,
  device_limit: 3,
  connected_squads: [],
  servers: [],
  tariff_name: 'Selected plan',
  subscription_url: 'https://example.test/selected-link',
  hide_subscription_link: false,
};

for (const plan of [
  { name: 'unlimited plan', trafficLimit: 0, trial: false },
  { name: 'limited traffic plan', trafficLimit: 100, trial: false },
  { name: 'trial', trafficLimit: 100, trial: true },
]) {
  test(`cold Dashboard keeps the loading card stationary for a ${plan.name}`, async ({ page }) => {
    const selected = {
      ...subscription,
      status: plan.trial ? 'trial' : 'active',
      is_trial: plan.trial,
      traffic_limit_gb: plan.trafficLimit,
    };
    const list = deferred();
    const details = deferred();
    const detailsRequested = deferred();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await prepareAuthenticatedPage(page, {
      responses: {
        '/api/cabinet/subscriptions': { subscriptions: [selected], multi_tariff_enabled: true },
        '/api/cabinet/subscription': { has_subscription: true, subscription: selected },
        '/api/cabinet/subscription/devices': { devices: [], total: 0, device_limit: 3 },
        '/api/cabinet/subscription/connection-link': {
          display_link: subscription.subscription_url,
          connect_mode: 'plain',
          hide_link: false,
        },
      },
    });
    await page.route('**/api/cabinet/subscriptions', async (route) => {
      await list.promise;
      await route.fallback();
    });
    await page.route(/\/api\/cabinet\/subscription(?:\?|$)/, async (route) => {
      detailsRequested.release();
      await details.promise;
      await route.fallback();
    });

    const balance = page.locator('main [data-onboarding="balance"]');
    const loading = page
      .getByRole('heading', { name: 'Your Subscription' })
      .locator('xpath=ancestor::*[@role="status"][1]');

    let initialCard: { height: number; y: number } | null = null;
    let initialMetrics: { x: number; width: number } | null = null;
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await expect(loading).toBeVisible();
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      const initial = await loading.boundingBox();
      const section = loading.locator('section');
      initialMetrics = await section.locator('.subscription-hero-metrics-loading').boundingBox();
      const linkRow = loading.locator(':scope > div').last();
      const linkParts = linkRow.locator(':scope > span');
      await expect(linkParts).toHaveCount(3);
      for (const part of await linkParts.all()) {
        await expect(part).toHaveCSS('height', '44px');
      }
      await expect(linkRow).toHaveCSS('column-gap', '8px');
      await expect(section.locator('.subscription-hero-details > [class~="h-[46px]"]')).toHaveCount(
        0,
      );
      initialCard = (await section.count()) ? await section.boundingBox() : initial;
      const initialBalance = (await balance.count()) ? await balance.boundingBox() : null;
      list.release();
      await detailsRequested.promise;
      await expect(loading).toBeVisible();
      const whileDetailsPending = await loading.boundingBox();
      const balanceWhileDetailsPending = (await balance.count())
        ? await balance.boundingBox()
        : null;

      expect(initial).toBeTruthy();
      expect(whileDetailsPending).toBeTruthy();
      expect
        .soft(
          Math.abs((whileDetailsPending?.height ?? 0) - (initial?.height ?? 0)),
          'Loading placeholder height changes after the list response',
        )
        .toBeLessThanOrEqual(1);
      expect
        .soft(balanceWhileDetailsPending, 'Balance is already visible while the layout is unknown')
        .toBeNull();
      expect.soft(initialBalance).toBeNull();
    } finally {
      list.release();
      details.release();
    }

    await expect(page.getByRole('button', { name: 'Manage subscription' })).toBeVisible();
    await expect(balance).toBeVisible();
    const ready = await page.locator('[aria-labelledby=subscription-summary-title]').boundingBox();
    if (!ready || !initialCard)
      throw new Error('The initial and ready subscription cards must be visible');
    expect(Math.abs(ready.y - initialCard.y)).toBeLessThanOrEqual(1);
    const summary = page.getByRole('region', {
      name: plan.trial ? 'Trial subscription' : 'Subscription active',
    });
    await expect(summary).toBeVisible();
    const metrics = await summary.locator('.subscription-hero-metrics').boundingBox();
    if (!initialMetrics || !metrics) throw new Error('Expected loading and ready metrics');
    expect(Math.abs(initialMetrics.x - metrics.x)).toBeLessThanOrEqual(1);
    expect(
      Math.abs(initialMetrics.x + initialMetrics.width - metrics.x - metrics.width),
    ).toBeLessThanOrEqual(1);
    await expect(summary.getByRole('progressbar')).toHaveCount(plan.trafficLimit ? 1 : 0);
  });
}

for (const plan of [
  {
    kind: 'expired-trial',
    title: 'Пробный период истёк',
    action: 'Управление подпиской',
    flags: { is_trial: true },
  },
  { kind: 'expired-paid', title: 'Подписка истекла', action: 'Продлить', flags: {} },
  {
    kind: 'limited',
    title: 'Трафик закончился',
    action: 'Докупить трафик',
    flags: { status: 'limited', is_expired: false, is_limited: true },
  },
  {
    kind: 'paused',
    title: 'Подписка приостановлена',
    action: 'Возобновить',
    flags: {
      status: 'disabled',
      is_expired: false,
      is_daily: true,
      is_daily_paused: true,
      daily_price_kopeks: 1000,
    },
  },
  {
    kind: 'disabled',
    title: 'Подписка отключена',
    action: 'Продлить',
    flags: { status: 'disabled', is_expired: false },
  },
  {
    kind: 'expired-daily',
    title: 'Подписка истекла',
    action: 'Продлить',
    flags: { is_daily: true, daily_price_kopeks: 1000 },
  },
]) {
  for (const cache of ['cold', 'list', 'full'] as const) {
    test(`${plan.kind} loading stays continuous with ${cache} cache`, async ({ page }) => {
      const selected = {
        ...subscription,
        status: 'expired',
        is_active: false,
        is_expired: true,
        days_left: 0,
        subscription_url: null,
        tariff_name: 'Тестовый тариф',
        ...plan.flags,
      };
      const list = deferred();
      const details = deferred();
      const delayRefresh = deferred();
      let detailRequests = 0;
      await page.emulateMedia({ reducedMotion: 'no-preference' });
      await prepareAuthenticatedPage(page, {
        language: 'ru',
        responses: {
          '/api/cabinet/balance': { balance_kopeks: 125000, balance_rubles: 1250 },
          '/api/cabinet/subscriptions': { subscriptions: [selected], multi_tariff_enabled: true },
          '/api/cabinet/subscription': { has_subscription: true, subscription: selected },
        },
      });
      await page.route('**/api/cabinet/subscriptions', async (route) => {
        if (cache === 'cold') await list.promise;
        await route.fallback();
      });
      await page.route(
        (url) => url.pathname === '/api/cabinet/subscription',
        async (route) => {
          detailRequests += 1;
          await (cache === 'full' && detailRequests > 1 ? delayRefresh.promise : details.promise);
          await route.fallback();
        },
      );
      const main = page.getByRole('main');
      const loading = main.getByRole('status').filter({
        has: page.getByRole('heading', { name: 'Ваша подписка' }),
      });
      const generic = loading.locator(
        '.subscription-hero-loading:not(.subscription-hero--scenario)',
      );
      const specific = loading.locator(`.subscription-hero--${plan.kind}`);
      const banner = page.getByRole('region', { name: plan.title, exact: true });
      try {
        if (cache === 'list') {
          await page.goto('/subscriptions', { waitUntil: 'domcontentloaded' });
          await expect(main.getByText('Тестовый тариф', { exact: true }).first()).toBeVisible();
          await page
            .getByRole('link', { name: 'Главная', exact: true })
            .filter({ visible: true })
            .first()
            .click();
          await expect(specific).toBeVisible();
          await expect(generic).toHaveCount(0);
        } else if (cache === 'full') {
          details.release();
          await page.goto('/', { waitUntil: 'domcontentloaded' });
          await expect(banner).toBeVisible();
          await page
            .getByRole('link', { name: 'Поддержка', exact: true })
            .filter({ visible: true })
            .first()
            .click();
          await expect(main.getByRole('heading', { name: 'Поддержка', exact: true })).toBeVisible();
          await expect(banner).toHaveCount(0);
          await page
            .getByRole('link', { name: 'Главная', exact: true })
            .filter({ visible: true })
            .first()
            .click();
          await expect(banner).toBeVisible();
          await expect.poll(() => detailRequests).toBeGreaterThan(1);
          await expect(loading).toHaveCount(0);
          return;
        } else {
          await page.goto('/', { waitUntil: 'domcontentloaded' });
          await expect(generic).toBeVisible();
          await page.evaluate(() => document.fonts.ready);
          const heights = page.evaluate(async () => {
            const heights: number[] = [];
            const end = performance.now() + 550;
            while (performance.now() < end) {
              const container =
                document.querySelector('main [data-dashboard-subscription-loading]') ??
                document.querySelector('main .subscription-hero-loading')?.parentElement;
              if (container) heights.push(container.getBoundingClientRect().height);
              await new Promise(requestAnimationFrame);
            }
            return heights;
          });
          await page.waitForTimeout(70);
          list.release();
          await expect(specific).toBeVisible();
          const frames = await heights;
          const from = frames[0];
          const to = frames.at(-1) ?? 0;
          expect(from - to).toBeGreaterThan(1);
          expect(
            new Set(frames.filter((height) => height < from - 1 && height > to + 1)).size,
          ).toBeGreaterThanOrEqual(3);
        }

        await page.evaluate(() => document.fonts.ready);
        await expect(loading.getByRole('button')).toHaveCount(0);
        const placeholder = await specific.boundingBox();
        details.release();
        await expect(banner.getByRole('button', { name: plan.action, exact: true })).toBeVisible();
        if (['expired-paid', 'paused', 'disabled'].includes(plan.kind)) {
          await expect(banner.getByRole('button', { name: 'Управление подпиской' })).toHaveCount(0);
        }
        const ready = await banner.boundingBox();
        if (!ready || !placeholder) throw new Error('Both subscription surfaces must be visible');
        for (const key of ['x', 'y', 'width', 'height'] as const) {
          expect(Math.abs(ready[key] - placeholder[key]), key).toBeLessThanOrEqual(1);
        }
      } finally {
        list.release();
        details.release();
        delayRefresh.release();
      }
    });
  }
}

test('exhausted traffic keeps the corresponding banner and purchase action during initial loading', async ({
  page,
}) => {
  const limited = {
    ...subscription,
    is_limited: true,
    status: 'limited',
    traffic_limit_gb: 100,
    traffic_used_gb: 100,
    traffic_used_percent: 100,
  };
  const details = deferred();
  await prepareAuthenticatedPage(page, {
    language: 'ru',
    responses: {
      '/api/cabinet/subscriptions': { subscriptions: [limited], multi_tariff_enabled: true },
      '/api/cabinet/subscription': { has_subscription: true, subscription: limited },
    },
  });
  await page.route(
    (url) => url.pathname === '/api/cabinet/subscription',
    async (route) => {
      await details.promise;
      await route.fallback();
    },
  );
  const placeholder = page.locator('main [aria-busy] .subscription-hero--limited');
  let before: Awaited<ReturnType<typeof placeholder.boundingBox>> = null;
  try {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(placeholder).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    before = await placeholder.boundingBox();
  } finally {
    details.release();
  }
  const card = page.getByRole('region', { name: 'Трафик закончился', exact: true });
  const action = card.getByRole('button', { name: 'Докупить трафик', exact: true });
  await expect(action).toBeVisible();
  await expect(action).toHaveCSS('transition-property', 'box-shadow');
  const manage = card.getByRole('button', { name: 'Управление подпиской', exact: true });
  await expect(manage).toBeVisible();
  const buyBox = await action.boundingBox();
  const manageBox = await manage.boundingBox();
  if (!buyBox || !manageBox) throw new Error('Both traffic actions must be visible');
  expect(manageBox.y).toBeGreaterThanOrEqual(buyBox.y + buyBox.height);

  const after = await card.boundingBox();
  if (!before || !after) throw new Error('Both traffic surfaces must be visible');
  expect(before.y).toBeCloseTo(after.y, 0);
  expect(before.height).toBeCloseTo(after.height, 0);
});

for (const offer of ['none', 'free', 'paid'] as const) {
  test(`first visit shows only the available action after the ${offer} trial response`, async ({
    page,
  }) => {
    const trial = deferred();
    const request = deferred();
    await prepareAuthenticatedPage(page, {
      language: 'ru',
      responses: {
        '/api/cabinet/subscriptions': { subscriptions: [], multi_tariff_enabled: true },
        '/api/cabinet/subscription': { has_subscription: false, subscription: null },
        '/api/cabinet/balance': { balance_kopeks: 125000, balance_rubles: 1250 },
        '/api/cabinet/subscription/trial': {
          is_available: offer !== 'none',
          duration_days: 7,
          traffic_limit_gb: 100,
          device_limit: 1,
          requires_payment: offer === 'paid',
          price_kopeks: offer === 'paid' ? 10000 : 0,
          price_rubles: offer === 'paid' ? 100 : 0,
        },
      },
    });
    await page.route('**/api/cabinet/subscription/trial', async (route) => {
      request.release();
      await trial.promise;
      await route.fallback();
    });
    const welcome = page.getByRole('region', { name: 'Добро пожаловать!', exact: true });
    const tariff = welcome.getByRole('link', { name: 'Выберите тариф', exact: true });
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await request.promise;
      await expect(welcome.getByRole('status')).toBeVisible();
      await expect(tariff).toHaveCount(0);
      const geometry = await welcome.boundingBox();
      const delivered = page.waitForResponse(
        (response) => new URL(response.url()).pathname === '/api/cabinet/subscription/trial',
      );
      trial.release();
      await delivered;
      if (offer !== 'none') {
        await expect(
          welcome.getByRole('heading', {
            name: offer === 'free' ? 'Бесплатный пробный период' : 'Пробная подписка',
          }),
        ).toBeVisible();
        await expect(
          welcome.getByRole('button', {
            name: offer === 'free' ? 'Активировать бесплатно' : 'Оплатить с баланса',
            exact: true,
          }),
        ).toBeVisible();
        await expect(tariff).toHaveCount(0);
        const card = welcome.locator('dl').filter({ hasText: 'Период' });
        const values = card.locator('dd');
        await expect(values).toHaveText(['7 дней', '100 ГБ', '1 устройство']);
        const { border, cells } = await card.evaluate((list) => ({
          border: getComputedStyle(list).borderTopWidth,
          cells: [...list.children].map((cell) => {
            const bounds = cell.getBoundingClientRect();
            const style = getComputedStyle(cell);
            const separator = getComputedStyle(cell, '::before');
            return {
              y: bounds.top,
              width: bounds.width,
              border: style.borderTopWidth,
              separator: separator.content !== 'none' ? parseFloat(separator.insetBlockStart) : 0,
            };
          }),
        }));
        expect(border).toBe('1px');
        for (const [index, cell] of cells.entries()) {
          expect(cell.y).toBeCloseTo(cells[0].y, 0);
          expect(cell.width).toBeCloseTo(cells[0].width, 0);
          expect(cell.border).toBe('0px');
          if (index > 0) expect(cell.separator).toBeGreaterThan(0);
        }

        await expect(welcome.locator('.subscription-hero-portrait img')).toHaveAttribute(
          'src',
          /guardian-welcome-gift/,
        );
      } else {
        await expect(tariff).toBeVisible();
        await expect(tariff).toHaveAttribute('href', '/subscription/purchase');
        await expect(welcome.getByRole('button')).toHaveCount(0);
      }
      const after = await welcome.boundingBox();
      if (!geometry || !after) throw new Error('The welcome banner must remain on screen');
      expect(after.y).toBeCloseTo(geometry.y, 0);
    } finally {
      trial.release();
    }
  });
}
