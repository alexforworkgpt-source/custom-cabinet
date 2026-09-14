import { expect, test, type Page } from '@playwright/test';
import type { TicketSettings } from '../../src/api/admin';
import type { PartnerSettings } from '../../src/api/partners';
import { browserTestUser, prepareAuthenticatedPage } from './cabinetTestHarness';

const adminIdentity = {
  ...browserTestUser,
  id: 91_008,
  username: 'settings_source_admin',
  first_name: 'Settings Source Admin',
  email: 'settings-source-admin@example.test',
};

const partnerSettings: PartnerSettings = {
  withdrawal_enabled: true,
  withdrawal_min_amount_kopeks: 100000,
  withdrawal_cooldown_days: 30,
  withdrawal_requisites_text: 'Банк',
  partner_section_visible: true,
  referral_program_enabled: true,
  env_locked: ['partner_section_visible'],
};

const ticketSettings: TicketSettings = {
  sla_enabled: true,
  sla_minutes: 30,
  sla_check_interval_seconds: 60,
  sla_reminder_cooldown_minutes: 15,
  support_system_mode: 'both',
  cabinet_user_notifications_enabled: true,
  cabinet_admin_notifications_enabled: true,
  env_locked: ['sla_minutes'],
};

interface EndpointState {
  gets: number;
  patches: Record<string, unknown>[];
}

async function prepareAdminPage(
  page: Page,
  permissions: string[],
  responses: Record<string, unknown>,
) {
  return prepareAuthenticatedPage(page, {
    user: adminIdentity,
    language: 'ru',
    responses: {
      '/api/cabinet/auth/me/is-admin': { is_admin: true },
      '/api/cabinet/auth/me/permissions': {
        permissions,
        roles: ['browser_test_admin'],
        role_level: 100,
      },
      '/api/cabinet/admin/tickets/notifications/unread-count': { unread_count: 0 },
      ...responses,
    },
  });
}

async function mockWritableSettings<T extends Record<string, unknown>>(
  page: Page,
  path: string,
  initial: T,
  confirmed: T,
  failPatch = false,
) {
  const state: EndpointState = { gets: 0, patches: [] };

  await page.route(`**${path}`, async (route) => {
    if (route.request().method() === 'GET') {
      state.gets += 1;
      await route.fulfill({ status: 200, json: state.gets === 1 ? initial : confirmed });
      return;
    }
    if (route.request().method() === 'PATCH') {
      state.patches.push(route.request().postDataJSON() as Record<string, unknown>);
      if (failPatch) {
        await route.fulfill({ status: 503, json: { detail: 'private backend detail' } });
      } else {
        await route.fulfill({ status: 200, json: initial });
      }
      return;
    }
    await route.fulfill({ status: 405, json: { detail: 'method not allowed in fixture' } });
  });

  return state;
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => ({
        viewport: window.innerWidth,
        content: document.documentElement.scrollWidth,
      })),
    )
    .toEqual(
      expect.objectContaining({
        viewport: page.viewportSize()?.width,
        content: page.viewportSize()?.width,
      }),
    );
}

test('partner form excludes env-locked values and shows the confirmed reread', async ({ page }) => {
  const confirmed = { ...partnerSettings, referral_program_enabled: false };
  const { unexpectedApiRequests } = await prepareAdminPage(
    page,
    ['partners:read', 'partners:settings'],
    {
      '/api/cabinet/admin/partners/settings': partnerSettings,
      '/api/cabinet/admin/partners/stats': {
        total_partners: 0,
        pending_applications: 0,
        total_referrals: 0,
        total_earnings_kopeks: 0,
      },
      '/api/cabinet/admin/partners/applications': { items: [], total: 0 },
      '/api/cabinet/admin/partners': { items: [], total: 0 },
    },
  );
  const endpoint = await mockWritableSettings(
    page,
    '/api/cabinet/admin/partners/settings',
    partnerSettings,
    confirmed,
  );

  await page.goto('/admin/partners/settings');
  const locked = page.getByRole('checkbox', { name: /Раздел партнёрки виден в кабинете/ });
  const editable = page.getByRole('checkbox', { name: /Реферальная программа включена/ });
  await expect(locked).toBeDisabled();
  await expect(editable).toBeEnabled();
  await expect(page.getByText('Задано в .env')).toBeVisible();
  await editable.uncheck();
  await page.getByRole('button', { name: 'Сохранить' }).click();

  await expect.poll(() => endpoint.gets).toBe(2);
  await expect(page).toHaveURL(/\/admin\/partners$/);
  expect(endpoint.patches).toHaveLength(1);
  expect(endpoint.patches[0]).not.toHaveProperty('partner_section_visible');
  expect(endpoint.patches[0]).toMatchObject({ referral_program_enabled: false });

  await page.goto('/admin/partners/settings');
  await expect(
    page.getByRole('checkbox', { name: /Реферальная программа включена/ }),
  ).not.toBeChecked();
  await expectNoHorizontalOverflow(page);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('partner PATCH error stays explicit without a false confirmed state', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAdminPage(
    page,
    ['partners:read', 'partners:settings'],
    { '/api/cabinet/admin/partners/settings': partnerSettings },
  );
  const endpoint = await mockWritableSettings(
    page,
    '/api/cabinet/admin/partners/settings',
    partnerSettings,
    partnerSettings,
    true,
  );

  await page.goto('/admin/partners/settings');
  await page.getByRole('checkbox', { name: /Реферальная программа включена/ }).uncheck();
  await page.getByRole('button', { name: 'Сохранить' }).click();

  await expect(page.getByText('Не удалось сохранить настройки')).toBeVisible();
  await expect(page.getByText('private backend detail')).toHaveCount(0);
  await expect(page).toHaveURL(/\/admin\/partners\/settings$/);
  expect(endpoint.gets).toBe(1);
  expect(endpoint.patches).toHaveLength(1);
  await expectNoHorizontalOverflow(page);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('ticket form excludes env-locked values and shows the confirmed reread', async ({ page }) => {
  const confirmed = { ...ticketSettings, support_system_mode: 'contact' };
  const { unexpectedApiRequests } = await prepareAdminPage(
    page,
    ['tickets:read', 'tickets:settings'],
    {
      '/api/cabinet/admin/tickets/settings': ticketSettings,
      '/api/cabinet/admin/tickets/stats': { total: 0, open: 0, pending: 0, answered: 0, closed: 0 },
      '/api/cabinet/admin/tickets': { items: [], total: 0, page: 1, per_page: 20, pages: 0 },
    },
  );
  const endpoint = await mockWritableSettings(
    page,
    '/api/cabinet/admin/tickets/settings',
    ticketSettings,
    confirmed,
  );

  await page.goto('/admin/tickets/settings');
  const locked = page.locator('input[type="number"]').first();
  const mode = page.getByRole('combobox');
  await expect(locked).toBeDisabled();
  await expect(mode).toBeEnabled();
  await expect(page.getByText('Задано в .env')).toBeVisible();
  await mode.selectOption('tickets');
  await page.getByRole('button', { name: 'Сохранить' }).click();

  await expect.poll(() => endpoint.gets).toBe(2);
  await expect(page).toHaveURL(/\/admin\/tickets$/);
  expect(endpoint.patches).toHaveLength(1);
  expect(endpoint.patches[0]).not.toHaveProperty('sla_minutes');
  expect(endpoint.patches[0]).toMatchObject({ support_system_mode: 'tickets' });

  await page.goto('/admin/tickets/settings');
  await expect(page.getByRole('combobox')).toHaveValue('contact');
  await expectNoHorizontalOverflow(page);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('ticket PATCH error stays explicit without a false confirmed state', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAdminPage(page, ['tickets:settings'], {
    '/api/cabinet/admin/tickets/settings': ticketSettings,
  });
  const endpoint = await mockWritableSettings(
    page,
    '/api/cabinet/admin/tickets/settings',
    ticketSettings,
    ticketSettings,
    true,
  );

  await page.goto('/admin/tickets/settings');
  await page.getByRole('combobox').selectOption('tickets');
  await page.getByRole('button', { name: 'Сохранить' }).click();

  await expect(page.getByText('Ошибка сохранения настроек')).toBeVisible();
  await expect(page.getByText('private backend detail')).toHaveCount(0);
  await expect(page).toHaveURL(/\/admin\/tickets\/settings$/);
  expect(endpoint.gets).toBe(1);
  expect(endpoint.patches).toHaveLength(1);
  await expectNoHorizontalOverflow(page);
  expect([...unexpectedApiRequests]).toEqual([]);
});
