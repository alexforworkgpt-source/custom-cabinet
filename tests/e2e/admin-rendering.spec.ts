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

test('opens Admin at the top with mobile bottom navigation and Profile gutters', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 640 });
  await prepareAuthenticatedPage(page, {
    responses: {
      ...adminAccessResponses,
      '/api/cabinet/auth/me/permissions': {
        permissions: ['*:*'],
        roles: ['audit_admin'],
        role_level: 100,
      },
      '/api/cabinet/admin/stats/system-info': {},
      '/api/cabinet/admin/stats/dashboard': { subscriptions: {} },
    },
  });
  await page.goto('/profile');

  const profileHeading = page.getByRole('heading', { name: 'Profile', level: 1 });
  const profileBox = await profileHeading.boundingBox();
  if (!profileBox) throw new Error('Expected the Profile content to be visible');

  const adminLink = page.getByRole('main').getByRole('link', { name: 'Admin', exact: true });
  await adminLink.scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  await adminLink.click();

  await expect(page).toHaveURL('/admin');
  const heading = page.getByRole('heading', { name: 'Admin Panel' });
  await expect(heading).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(heading).toBeInViewport();

  const topMenu = page.getByRole('banner');
  await expect(topMenu).toBeHidden();
  const bottomMenu = page.getByRole('navigation');
  const profileLink = bottomMenu.getByRole('link', { name: 'Profile', exact: true });
  await expect(profileLink).toBeVisible();
  await expect(profileLink).toHaveAttribute('aria-current', 'page');
  await expect(bottomMenu.getByRole('link')).toHaveCount(4);

  for (const name of ['Analytics', 'Users', 'Tariffs & Sales', 'Marketing', 'System', 'Security']) {
    const group = page.getByRole('heading', { name, level: 2, exact: true });
    await expect(group).toBeVisible();
    const card = await group.evaluate((element) => {
      const card = element.parentElement?.parentElement;
      if (!card) throw new Error('Expected a card for the group heading');
      const { left, width } = card.getBoundingClientRect();
      const badge = element.previousElementSibling;
      const icon = badge?.querySelector('svg');
      if (!icon) throw new Error('Expected an icon for the group heading');
      return {
        left,
        width,
        iconColor: getComputedStyle(icon).color,
        iconWidth: icon.getBoundingClientRect().width,
        badgeText: badge?.textContent,
      };
    });
    expect(card.left, name).toBeCloseTo(profileBox.x, 0);
    expect(card.width, name).toBeCloseTo(profileBox.width, 0);
    expect(card.iconWidth, name).toBeCloseTo(19.2, 1);
    expect(card.iconColor, name).toBe('rgb(255, 255, 255)');
    expect(card.badgeText, name).toBe('');
  }

  await profileLink.click();
  await expect(page).toHaveURL('/profile');
  await adminLink.scrollIntoViewIfNeeded();
  await adminLink.click();
  await expect(page).toHaveURL('/admin');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await page.setViewportSize({ width: 1280, height: 800 });
  await expect(
    topMenu.getByRole('navigation').getByRole('link', { name: 'Profile' }),
  ).toBeVisible();
});
