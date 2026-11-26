import { expect, test, type Locator, type Page } from '@playwright/test';
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

async function measure(locator: Locator) {
  const bounds = await locator.boundingBox();
  if (!bounds) throw new Error('Expected a visible support element');
  return bounds;
}

function deferSupportResponse() {
  let release = () => {};
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { pending, release };
}

test('keeps support instructions and ticket list in place during initial loading', async ({
  page,
}) => {
  const config = deferSupportResponse();
  const list = deferSupportResponse();
  const ticket = makeTicket(42, 'One support request', 'Initial user message');
  await prepareAuthenticatedPage(page, { responses: supportResponses(ticket) });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const [path, gate] of [
    ['/api/cabinet/info/support-config', config],
    ['/api/cabinet/tickets', list],
  ] as const) {
    await page.route(
      (url) => url.pathname === path,
      async (route) => {
        await gate.pending;
        await route.fallback();
      },
    );
  }

  const instructions = page.getByRole('region', { name: 'Instructions and setup' });
  const listTitle = page.getByRole('heading', { name: 'Your Tickets' });
  const newTicket = page.getByRole('button', { name: 'New Ticket' });

  try {
    await page.goto('/support');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByRole('heading', { name: 'Support', level: 1 })).toBeVisible();
    await expect(newTicket).toHaveCount(0);
    await expect(instructions).toBeVisible();
    const first = await measure(instructions);
    const firstList = await measure(listTitle);
    config.release();

    await expect(newTicket).toBeEnabled();
    await expect(listTitle).toBeVisible();
    const loading = await measure(listTitle.locator('..'));
    const loadingTitle = await measure(listTitle);
    expect(Math.abs(firstList.y - loadingTitle.y)).toBeLessThanOrEqual(1);
    list.release();

    await expect(page.getByRole('button', { name: /One support request/ })).toBeVisible();
    const ready = await measure(listTitle.locator('..'));
    const last = await measure(instructions);
    expect(Math.abs(loading.height - ready.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(first.y - last.y)).toBeLessThanOrEqual(1);
  } finally {
    config.release();
    list.release();
  }
});

test('keeps the reply field in place while the first message loads', async ({ page }) => {
  const detail = deferSupportResponse();
  const ticket = makeTicket(42, 'One support request', 'Initial user message');
  await prepareAuthenticatedPage(page, { responses: supportResponses(ticket) });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/api/cabinet/tickets/42', async (route) => {
    await detail.pending;
    await route.fallback();
  });

  try {
    await page.goto('/support');
    await page.getByRole('button', { name: /One support request/ }).click();
    const reply = page.getByPlaceholder('Type your reply...');
    await expect(reply).toBeVisible();
    const loading = await measure(reply);
    detail.release();
    await expect(page.getByText('Initial user message', { exact: true })).toBeVisible();
    const ready = await measure(reply);
    expect(Math.abs(loading.y - ready.y)).toBeLessThanOrEqual(1);
  } finally {
    detail.release();
  }
});

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
