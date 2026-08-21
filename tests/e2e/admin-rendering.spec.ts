import { expect, test, type Page } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

function collectConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  return errors;
}

const adminAccessResponses = {
  '/api/cabinet/auth/me/is-admin': { is_admin: true },
  '/api/cabinet/auth/me/permissions': {
    permissions: ['news:edit', 'servers:read'],
    roles: ['audit_admin'],
    role_level: 100,
  },
  '/api/cabinet/admin/tickets/notifications/unread-count': { unread_count: 0 },
};

test('renders the admin server heading without invalid nested HTML', async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      ...adminAccessResponses,
      '/api/cabinet/admin/servers/1': {
        id: 1,
        squad_uuid: '00000000-0000-4000-8000-000000000001',
        display_name: 'Local Audit Server',
        original_name: 'local-audit',
        country_code: null,
        description: 'Read-only browser fixture',
        is_available: false,
        is_trial_eligible: false,
        price_kopeks: 0,
        price_rubles: 0,
        max_users: null,
        current_users: 0,
        sort_order: 1,
        is_full: false,
        availability_status: 'disabled',
        promo_groups: [],
        active_subscriptions: 0,
        tariffs_using: [],
        created_at: '2026-08-01T00:00:00Z',
        updated_at: null,
      },
    },
  });

  await page.goto('/admin/servers/1/edit');
  await expect(page.getByRole('heading', { name: 'Edit Server' })).toBeVisible();
  const backLink = page.getByRole('link', { name: 'Back' });
  await expect(backLink).toBeVisible();
  const backLinkBox = await backLink.boundingBox();
  expect(backLinkBox?.width).toBeGreaterThanOrEqual(44);
  expect(backLinkBox?.height).toBeGreaterThanOrEqual(44);
  expect(consoleErrors.filter((message) => message.includes('cannot be a descendant'))).toEqual([]);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('renders selected news metadata without nested buttons', async ({ page }) => {
  const consoleErrors = collectConsoleErrors(page);
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      ...adminAccessResponses,
      '/api/cabinet/admin/news/categories': [{ id: 1, name: 'Updates', color: '#3b82f6' }],
      '/api/cabinet/admin/news/tags': [],
      '/api/cabinet/admin/news/1': {
        id: 1,
        title: 'Local audit news',
        slug: 'local-audit-news',
        content: '<p>Local audit content.</p>',
        excerpt: 'Read-only browser fixture',
        category: 'Updates',
        category_color: '#3b82f6',
        category_id: 1,
        tag: null,
        tag_id: null,
        featured_image_url: null,
        is_published: false,
        is_featured: false,
        published_at: null,
        read_time_minutes: 1,
        views_count: 0,
        created_at: '2026-08-01T00:00:00Z',
        updated_at: null,
      },
    },
  });

  await page.goto('/admin/news/1/edit');
  await expect(page.getByRole('heading', { name: 'Edit' })).toBeVisible();
  expect(consoleErrors.filter((message) => message.includes('cannot be a descendant'))).toEqual([]);
  expect([...unexpectedApiRequests]).toEqual([]);
});
