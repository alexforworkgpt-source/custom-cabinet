import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

test('opens personal ticket notifications from the Home header', async ({ page, viewport }) => {
  const message = 'Support replied about my subscription';
  await prepareAuthenticatedPage(page, {
    responses: {
      '/api/cabinet/tickets/notifications/unread-count': { unread_count: 1 },
      '/api/cabinet/tickets/notifications/1/read': { success: true },
      '/api/cabinet/tickets/notifications': {
        items: [
          {
            id: 1,
            ticket_id: 42,
            notification_type: 'admin_reply',
            message,
            is_read: false,
            created_at: '2026-11-26T09:00:00Z',
          },
        ],
        total: 1,
        unread_count: 1,
      },
    },
  });

  await page.goto('/');
  const bell = page.getByRole('button', { name: 'Ticket Notifications' });
  await expect(bell).toHaveCount(1);
  const main = page.getByRole('main');
  if (viewport && viewport.width < 1024) {
    await expect(main.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeVisible();
    await expect(main.getByRole('button', { name: 'Ticket Notifications' })).toBeVisible();
  } else {
    await expect(main.getByRole('button', { name: 'Ticket Notifications' })).toHaveCount(0);
  }
  await expect(bell).toContainText('1');
  await bell.click();
  await page.getByRole('button', { name: new RegExp(message) }).click();
  await expect(page).toHaveURL('/support?ticket=42');
});
