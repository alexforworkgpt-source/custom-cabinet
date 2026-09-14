import { expect, test, type Page } from '@playwright/test';
import type { EmailQueueState } from '../../src/api/adminEmailQueue';
import { browserTestUser, prepareAuthenticatedPage } from './cabinetTestHarness';

const adminIdentity = {
  ...browserTestUser,
  id: 91_007,
  username: 'email_queue_admin',
  first_name: 'Email Queue Admin',
  email: 'email-queue-admin@example.test',
};

const emptyQueue: EmailQueueState = {
  pending: 0,
  sent: 0,
  dead: 0,
  smtp_configured: true,
  items: [],
};

const populatedQueue: EmailQueueState = {
  pending: 2,
  sent: 1,
  dead: 1,
  smtp_configured: false,
  items: [
    {
      id: 7001,
      to_email: 'retry@example.test',
      subject: 'Код подтверждения',
      status: 'pending',
      attempts: 1,
      next_attempt_at: '2026-09-10T09:05:00Z',
      last_error: 'SMTP INTERNAL: password=do-not-render',
      created_at: '2026-09-10T09:00:00Z',
      sent_at: null,
    },
  ],
};

async function prepareEmailPage(
  page: Page,
  permissions: string[],
  queue: EmailQueueState = emptyQueue,
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
      '/api/cabinet/admin/email-templates': {
        items: [],
        available_languages: ['ru', 'en'],
        common_context_vars: [],
      },
      '/api/cabinet/admin/email-queue': queue,
    },
  });
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

test('denies the page without email_templates:read and never loads the queue', async ({ page }) => {
  const { apiRequests } = await prepareEmailPage(page, []);

  await page.goto('/admin/email-templates');

  await expect(page).toHaveURL(/\/admin$/);
  expect(apiRequests).not.toContain('GET /api/cabinet/admin/email-queue');
});

test('keeps the empty queue visible and read-only on a narrow screen', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareEmailPage(page, ['email_templates:read']);

  await page.goto('/admin/email-templates');

  await expect(page.getByRole('heading', { name: 'Очередь писем' })).toBeVisible();
  await expect(page.getByText('Только письма, не ушедшие с первого раза')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Очистить' })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('shows honest retry counters and safe queue details on a narrow screen', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareEmailPage(
    page,
    ['email_templates:read', 'email_templates:edit'],
    populatedQueue,
  );

  await page.goto('/admin/email-templates');

  await expect(page.getByText('retry@example.test')).toBeVisible();
  await expect(page.getByText('Ждёт повтора')).toBeVisible();
  await expect(page.getByText(/Почтовый сервер не настроен, письма не отправляются/)).toBeVisible();
  await expect(page.getByText('password=do-not-render')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Убрать ожидающие' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Очистить' })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('confirms once, blocks repeated clears and refreshes after success', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareEmailPage(
    page,
    ['email_templates:read', 'email_templates:edit'],
    populatedQueue,
  );
  let queue = populatedQueue;
  let clearRequests = 0;
  let releaseClear = () => {};
  const clearGate = new Promise<void>((resolve) => {
    releaseClear = resolve;
  });
  await page.route('**/api/cabinet/admin/email-queue**', async (route) => {
    if (route.request().method() === 'DELETE') {
      clearRequests += 1;
      await clearGate;
      queue = emptyQueue;
      await route.fulfill({ status: 200, json: { removed: 2, pending_only: true } });
      return;
    }
    await route.fulfill({ status: 200, json: queue });
  });

  await page.goto('/admin/email-templates');
  const clearPending = page.getByRole('button', { name: 'Убрать ожидающие' });
  page.once('dialog', (dialog) => void dialog.accept());
  await clearPending.click();
  await expect(clearPending).toBeDisabled();
  await clearPending.click({ force: true });
  await expect.poll(() => clearRequests).toBe(1);
  releaseClear();

  await expect(page.getByText('Очередь очищена: 2')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Убрать ожидающие' })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('shows a failure and unlocks the clear action for a retry', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareEmailPage(
    page,
    ['email_templates:read', 'email_templates:edit'],
    populatedQueue,
  );
  let clearRequests = 0;
  await page.route('**/api/cabinet/admin/email-queue**', async (route) => {
    if (route.request().method() === 'DELETE') {
      clearRequests += 1;
      await route.fulfill({ status: 503, json: { detail: 'Временная ошибка очереди' } });
      return;
    }
    await route.fulfill({ status: 200, json: populatedQueue });
  });

  await page.goto('/admin/email-templates');
  const clearAll = page.getByRole('button', { name: 'Очистить' });
  page.once('dialog', (dialog) => void dialog.accept());
  await clearAll.click();

  await expect(page.getByText('Временная ошибка очереди')).toBeVisible();
  await expect(clearAll).toBeEnabled();
  expect(clearRequests).toBe(1);
  await expectNoHorizontalOverflow(page);
  expect([...unexpectedApiRequests]).toEqual([]);
});
