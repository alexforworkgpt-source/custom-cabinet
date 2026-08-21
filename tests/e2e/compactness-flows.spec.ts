import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

test('keeps the Wheel spin action above mobile navigation with a bottom safe area', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    featureFlags: { wheelEnabled: true },
    responses: {
      '/api/cabinet/wheel/config': {
        is_enabled: true,
        name: 'Local Fortune Wheel',
        spin_cost_stars: 10,
        spin_cost_days: null,
        spin_cost_stars_enabled: true,
        spin_cost_days_enabled: false,
        prizes: [
          {
            id: 1,
            display_name: 'One day',
            emoji: '*',
            color: '#3b82f6',
            prize_type: 'subscription_days',
          },
        ],
        daily_limit: 1,
        user_spins_today: 0,
        can_spin: true,
        can_spin_reason: null,
        can_pay_stars: true,
        can_pay_days: false,
        user_balance_kopeks: 50_000,
        required_balance_kopeks: 0,
        has_subscription: true,
        eligible_subscriptions: [{ id: 1, tariff_name: 'Local Standard', days_left: 45 }],
      },
      '/api/cabinet/wheel/history': { items: [], total: 0, page: 1, per_page: 20, pages: 0 },
    },
  });

  await page.goto('/wheel');
  await page.addStyleTag({
    content: `
      :root { --safe-area-inset-bottom: 34px; }
      nav:has(a[href="/"]) { bottom: calc(16px + var(--safe-area-inset-bottom)) !important; }
    `,
  });

  const spinButton = page.getByRole('button', { name: 'SPIN!', exact: true });
  const bottomNavigation = page.locator('nav:visible').filter({
    has: page.locator('a[href="/"]'),
  });
  await expect(spinButton).toBeVisible();
  await expect(bottomNavigation).toBeVisible();

  const [spinBox, navigationBox] = await Promise.all([
    spinButton.boundingBox(),
    bottomNavigation.boundingBox(),
  ]);
  if (!spinBox || !navigationBox) {
    throw new Error('Wheel spin action and mobile navigation must be measurable');
  }

  expect(spinBox.y + spinBox.height).toBeLessThanOrEqual(navigationBox.y - 8);
  expect(spinBox.height).toBeGreaterThanOrEqual(44);

  await spinButton.click();
  await expect(
    page.getByText('You will be redirected to Telegram to pay for one wheel spin.'),
  ).toBeVisible();
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('collapses Referral partner and withdrawal sections only on mobile', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    featureFlags: { referralEnabled: true },
    responses: {
      '/api/cabinet/referral': {
        referral_code: 'BROWSER_TEST',
        referral_link: 'https://t.me/test_bot?start=BROWSER_TEST',
        bot_referral_link: 'https://t.me/test_bot?start=BROWSER_TEST',
        total_referrals: 0,
        active_referrals: 0,
        total_earnings_kopeks: 0,
        total_earnings_rubles: 0,
        commission_percent: 10,
        available_balance_kopeks: 0,
        available_balance_rubles: 0,
        withdrawn_kopeks: 0,
      },
      '/api/cabinet/referral/terms': {
        is_enabled: true,
        commission_percent: 10,
        minimum_topup_kopeks: 0,
        minimum_topup_rubles: 0,
        first_topup_bonus_kopeks: 0,
        first_topup_bonus_rubles: 0,
        inviter_bonus_kopeks: 0,
        inviter_bonus_rubles: 0,
        max_commission_payments: 0,
        partner_section_visible: true,
      },
      '/api/cabinet/referral/list': { items: [], total: 0, page: 1, per_page: 10, pages: 0 },
      '/api/cabinet/referral/earnings': {
        items: [],
        total: 0,
        page: 1,
        per_page: 10,
        pages: 0,
        total_amount_kopeks: 0,
        total_amount_rubles: 0,
      },
      '/api/cabinet/referral/partner/status': {
        partner_status: 'none',
        commission_percent: null,
        latest_application: null,
        campaigns: [],
      },
      '/api/cabinet/referral/withdrawal/balance': {
        total_earned: 20_000,
        referral_spent: 0,
        withdrawn: 0,
        pending: 0,
        available_referral: 20_000,
        available_total: 20_000,
        only_referral_mode: false,
        min_amount_kopeks: 10_000,
        is_withdrawal_enabled: true,
        can_request: true,
        cannot_request_reason: null,
        requisites_text: '',
      },
      '/api/cabinet/referral/withdrawal/history': { items: [], total: 0 },
    },
  });

  await page.goto('/referral');

  const partnerToggle = page.getByRole('button', { name: 'Partner', exact: true });
  const withdrawalToggle = page.getByRole('button', { name: 'Withdrawal', exact: true });
  const applyButton = page.getByRole('button', { name: 'Apply', exact: true });
  const requestButton = page.getByRole('button', { name: 'Request Withdrawal', exact: true });
  const isMobile = (page.viewportSize()?.width ?? 1280) < 768;

  if (isMobile) {
    await expect(partnerToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(withdrawalToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(applyButton).toBeHidden();
    await expect(requestButton).toBeHidden();

    await partnerToggle.click();
    await expect(partnerToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(applyButton).toBeVisible();
    await expect(requestButton).toBeHidden();

    await withdrawalToggle.click();
    await expect(withdrawalToggle).toHaveAttribute('aria-expanded', 'true');
    await expect(requestButton).toBeVisible();
  } else {
    await expect(partnerToggle).toBeHidden();
    await expect(withdrawalToggle).toBeHidden();
    await expect(applyButton).toBeVisible();
    await expect(requestButton).toBeVisible();
  }

  expect([...unexpectedApiRequests]).toEqual([]);
});

test('shows one empty state on mobile Support when there are no tickets', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/info/support-config': {
        tickets_enabled: true,
        support_type: 'tickets',
        support_url: null,
        support_username: null,
      },
      '/api/cabinet/tickets': { items: [], total: 0, page: 1, per_page: 20, pages: 0 },
    },
  });

  await page.goto('/support');

  const noTickets = page.getByText('No tickets yet', { exact: true });
  const selectTicket = page.getByText('Select a ticket or create a new one', { exact: true });
  await expect(noTickets).toBeVisible();

  if ((page.viewportSize()?.width ?? 1280) < 768) {
    await expect(selectTicket).toBeHidden();
  } else {
    await expect(selectTicket).toBeVisible();
  }

  expect([...unexpectedApiRequests]).toEqual([]);
});

test('keeps Gift payment context and action above mobile navigation', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    featureFlags: { giftEnabled: true },
    responses: {
      '/api/cabinet/branding/gift-enabled': { enabled: true },
      '/api/cabinet/gift/config': {
        is_enabled: true,
        tariffs: [
          {
            id: 10,
            name: 'Local Gift Plan',
            description: 'Safe local gift',
            traffic_limit_gb: 100,
            device_limit: 3,
            periods: [
              {
                days: 30,
                price_kopeks: 30_000,
                price_label: '300 RUB',
                original_price_kopeks: null,
                discount_percent: null,
              },
            ],
          },
        ],
        payment_methods: [],
        balance_kopeks: 50_000,
        currency_symbol: 'RUB',
        promo_group_name: null,
        active_discount_percent: null,
        active_discount_expires_at: null,
      },
    },
  });

  await page.goto('/gift');
  await page.addStyleTag({
    content: `
      :root { --safe-area-inset-bottom: 34px; }
      nav:has(a[href="/"]) { bottom: calc(16px + var(--safe-area-inset-bottom)) !important; }
    `,
  });

  const paymentContext = page.getByRole('button', { name: /^From balance/ });
  const sendGift = page.getByRole('button', { name: /^Send Gift/ });
  const bottomNavigation = page.locator('nav:visible').filter({
    has: page.locator('a[href="/"]'),
  });
  await expect(paymentContext).toHaveAttribute('aria-pressed', 'true');
  await expect(sendGift).toBeVisible();

  const [paymentBox, sendGiftBox, navigationBox] = await Promise.all([
    paymentContext.boundingBox(),
    sendGift.boundingBox(),
    bottomNavigation.boundingBox(),
  ]);
  if (!paymentBox || !sendGiftBox || !navigationBox) {
    throw new Error('Gift payment context, action and mobile navigation must be measurable');
  }

  expect(paymentBox.y + paymentBox.height).toBeLessThanOrEqual(navigationBox.y - 8);
  expect(sendGiftBox.y + sendGiftBox.height).toBeLessThanOrEqual(navigationBox.y - 8);
  expect(sendGiftBox.height).toBeGreaterThanOrEqual(44);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('keeps Quick Purchase payment method clear of the Pay action', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/landing/cta-geometry': {
        slug: 'cta-geometry',
        title: 'Local VPN Access',
        subtitle: 'A fully mocked purchase page',
        features: [],
        footer_text: null,
        tariffs: [
          {
            id: 10,
            name: 'Local Standard',
            description: '100 GB and 3 devices',
            traffic_limit_gb: 100,
            device_limit: 3,
            tier_level: 1,
            periods: [
              {
                days: 30,
                label: '30 days',
                price_kopeks: 30_000,
                price_label: '300 RUB',
                original_price_kopeks: null,
                original_price_label: null,
                discount_percent: null,
              },
            ],
          },
        ],
        payment_methods: [
          {
            method_id: 'local-card',
            display_name: 'Local Test Card',
            description: 'No charge will occur',
            icon_url: null,
            sort_order: 1,
            min_amount_kopeks: null,
            max_amount_kopeks: null,
            currency: 'RUB',
            sub_options: null,
          },
        ],
        gift_enabled: true,
        custom_css: null,
        meta_title: 'Local VPN Access',
        meta_description: 'Safe geometry test',
        discount: null,
        background_config: null,
        analytics_view_enabled: false,
        analytics_view_goal: '',
        analytics_click_enabled: false,
        analytics_click_goal: '',
        sticky_pay_button: true,
      },
    },
  });

  await page.goto('/buy/cta-geometry');
  await page.addStyleTag({
    content: ':root { --safe-area-inset-bottom: 34px; }',
  });

  const selectedMethod = page.getByRole('radio', { name: /Local Test Card/ });
  const payButtons = page.getByRole('button', { name: /^Pay / });
  await expect(selectedMethod).toHaveAttribute('aria-checked', 'true');
  await selectedMethod.scrollIntoViewIfNeeded();
  await expect(selectedMethod).toBeVisible();

  const selectedMethodBox = await selectedMethod.boundingBox();
  const fixedPayBox = await payButtons.evaluateAll((buttons) => {
    const fixedButton = buttons.find(
      (button) => getComputedStyle(button.parentElement ?? button).position === 'fixed',
    );
    const fixedBar = fixedButton?.parentElement;
    if (!fixedBar) return null;
    const box = fixedBar.getBoundingClientRect();
    return { top: box.top, bottom: box.bottom };
  });
  if (!selectedMethodBox) throw new Error('Selected payment method must be measurable');
  if (fixedPayBox) {
    expect(selectedMethodBox.y + selectedMethodBox.height).toBeLessThanOrEqual(fixedPayBox.top - 8);
  }

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect
    .poll(() =>
      payButtons.evaluateAll(
        (buttons) =>
          buttons.filter((button) => {
            const box = button.getBoundingClientRect();
            return (
              getComputedStyle(button).visibility !== 'hidden' && box.width > 0 && box.height > 0
            );
          }).length,
      ),
    )
    .toBeGreaterThan(0);

  const visiblePayBoxes = await payButtons.evaluateAll((buttons) =>
    buttons
      .map((button) => button.getBoundingClientRect())
      .filter((box) => box.width > 0 && box.height > 0)
      .map((box) => ({ top: box.top, bottom: box.bottom, height: box.height })),
  );
  expect(visiblePayBoxes.some((box) => box.height >= 44)).toBe(true);
  expect(visiblePayBoxes.some((box) => box.bottom <= 568 - 34 - 12)).toBe(true);
  expect([...unexpectedApiRequests]).toEqual([]);
});
