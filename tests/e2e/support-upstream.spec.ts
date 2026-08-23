import { expect, test, type Page } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

const supportConfig = {
  tickets_enabled: true,
  support_type: 'tickets',
  support_url: null,
  support_username: null,
};

function makeTicket(id: number, title: string, messageText: string) {
  const message = {
    id: id * 10,
    message_text: messageText,
    is_from_admin: false,
    has_media: false,
    media_type: null,
    media_file_id: null,
    media_caption: null,
    media_items: [],
    created_at: '2026-08-20T10:00:00Z',
  };
  const ticket = {
    id,
    title,
    status: 'open',
    priority: 'normal',
    created_at: '2026-08-20T10:00:00Z',
    updated_at: '2026-08-20T10:00:00Z',
    closed_at: null,
  };

  return {
    summary: { ...ticket, messages_count: 1, last_message: message },
    detail: { ...ticket, is_reply_blocked: false, messages: [message] },
  };
}

function supportResponses(ticket?: ReturnType<typeof makeTicket>) {
  return {
    '/api/cabinet/info/support-config': supportConfig,
    '/api/cabinet/tickets': {
      items: ticket ? [ticket.summary] : [],
      total: ticket ? 1 : 0,
      page: 1,
      per_page: 20,
      pages: ticket ? 1 : 0,
    },
    ...(ticket ? { [`/api/cabinet/tickets/${ticket.detail.id}`]: ticket.detail } : {}),
  };
}

interface FailedWrite {
  status: number;
  detail: string;
}

async function mockFailedTicketWrites(page: Page, failures: Record<string, FailedWrite>) {
  const writes: Array<{ method: string; path: string; body: unknown }> = [];

  await page.route('**/api/cabinet/tickets**', async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    const failure = failures[path];
    if (request.method() !== 'POST' || !failure) {
      await route.fallback();
      return;
    }

    writes.push({ method: request.method(), path, body: request.postDataJSON() });
    await route.fulfill({ status: failure.status, json: { detail: failure.detail } });
  });

  return writes;
}

test('shows the already-open message for a create-ticket 409 @desktop-flow', async ({ page }) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: supportResponses(),
  });
  const writes = await mockFailedTicketWrites(page, {
    '/api/cabinet/tickets': { status: 409, detail: 'Backend conflict detail' },
  });

  await page.goto('/support');
  await page.getByRole('button', { name: 'New Ticket', exact: true }).click();
  await page.getByRole('textbox', { name: 'Subject' }).fill('Existing request');
  await page
    .getByRole('textbox', { name: 'Message' })
    .fill('This request should report the existing open ticket.');
  await page.getByRole('button', { name: 'Send', exact: true }).click();

  await expect(
    page.getByText(
      'You already have an open ticket. Please continue the conversation there \u2014 a new ticket can be created once the current one is closed.',
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByText('Backend conflict detail', { exact: true })).toHaveCount(0);
  expect(writes).toEqual([
    {
      method: 'POST',
      path: '/api/cabinet/tickets',
      body: {
        title: 'Existing request',
        message: 'This request should report the existing open ticket.',
      },
    },
  ]);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('shows backend detail for failed ticket creation and reply @desktop-flow', async ({
  page,
}) => {
  const ticket = makeTicket(42, 'Existing browser ticket', 'Initial user message');
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: supportResponses(ticket),
  });
  const writes = await mockFailedTicketWrites(page, {
    '/api/cabinet/tickets': { status: 500, detail: 'Create detail from Upstream Bot' },
    '/api/cabinet/tickets/42/messages': {
      status: 500,
      detail: 'Reply detail from Upstream Bot',
    },
  });

  await page.goto('/support');
  await page.getByRole('button', { name: 'New Ticket', exact: true }).click();
  await page.getByRole('textbox', { name: 'Subject' }).fill('Create failure');
  await page
    .getByRole('textbox', { name: 'Message' })
    .fill('Show the backend detail for this failed creation.');
  await page.getByRole('button', { name: 'Send', exact: true }).click();
  await expect(page.getByText('Create detail from Upstream Bot', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: /Existing browser ticket/ }).click();
  const reply = page.getByPlaceholder('Type your reply...');
  await reply.fill('Show the backend detail for this failed reply.');
  await reply.locator('xpath=ancestor::form').locator('button[type="submit"]').click();
  await expect(page.getByText('Reply detail from Upstream Bot', { exact: true })).toBeVisible();

  expect(writes).toEqual([
    {
      method: 'POST',
      path: '/api/cabinet/tickets',
      body: {
        title: 'Create failure',
        message: 'Show the backend detail for this failed creation.',
      },
    },
    {
      method: 'POST',
      path: '/api/cabinet/tickets/42/messages',
      body: { message: 'Show the backend detail for this failed reply.' },
    },
  ]);
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('keeps long URL and base64 user messages within 320px and 375px viewports @desktop-flow', async ({
  page,
}) => {
  const longUrl = `https://support.example.test/${'u'.repeat(900)}`;
  const base64 = `data:application/octet-stream;base64,${'A'.repeat(1600)}`;
  const ticket = makeTicket(77, 'Long user message', `Long URL: ${longUrl}\nBase64: ${base64}`);
  await page.setViewportSize({ width: 320, height: 720 });
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
    responses: supportResponses(ticket),
  });

  await page.goto('/support');
  await page.getByRole('button', { name: /Long user message/ }).click();
  await expect(page.getByRole('link', { name: longUrl, exact: true })).toBeVisible();
  await expect(
    page.getByText('Base64: data:application/octet-stream;base64,', { exact: false }),
  ).toBeVisible();

  for (const width of [320, 375]) {
    await page.setViewportSize({ width, height: 812 });
    const dimensions = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(dimensions.scrollWidth, `Support page overflows at ${width}px`).toBeLessThanOrEqual(
      dimensions.innerWidth,
    );
  }

  expect([...unexpectedApiRequests]).toEqual([]);
});
