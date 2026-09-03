import { expect, test } from '@playwright/test';
import { prepareAuthenticatedPage } from './cabinetTestHarness';

const supportConfig = {
  tickets_enabled: true,
  support_type: 'tickets',
  support_url: null,
  support_username: null,
};

const responses = {
  '/api/cabinet/info/support-config': supportConfig,
  '/api/cabinet/tickets': { items: [], total: 0, page: 1, per_page: 20, pages: 0 },
};

test('places instructions below New Ticket and returns from an article to Support', async ({
  page,
}) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, { responses });
  await page.goto('/support');
  const instructions = page.getByRole('link', { name: 'Open instructions', exact: true });
  const newTicket = page.getByRole('button', { name: 'New Ticket', exact: true });
  await expect(instructions).toHaveAttribute('href', '/instructions');
  // Wait for stable layout after the entrance animation without opening the form.
  await newTicket.click({ trial: true });
  const instructionsBox = await page
    .getByRole('region', { name: 'Instructions and setup', exact: true })
    .boundingBox();
  const newTicketBox = await newTicket.boundingBox();
  if (!instructionsBox || !newTicketBox) throw new Error('Both support actions must be visible');
  expect(newTicketBox.y + newTicketBox.height).toBeLessThanOrEqual(instructionsBox.y);
  const headingBox = await page.getByRole('heading', { name: 'Support', level: 1 }).boundingBox();
  if (!headingBox) throw new Error('The support heading must be visible');
  if ((page.viewportSize()?.width ?? 0) >= 640) {
    expect(newTicketBox.x).toBeGreaterThanOrEqual(headingBox.x + headingBox.width);
    expect(
      Math.abs(newTicketBox.y + newTicketBox.height / 2 - (headingBox.y + headingBox.height / 2)),
    ).toBeLessThanOrEqual(1);
  } else {
    expect(newTicketBox.y).toBeGreaterThanOrEqual(headingBox.y + headingBox.height);
    expect(Math.abs(newTicketBox.width - instructionsBox.width)).toBeLessThanOrEqual(1);
  }

  await instructions.click();
  await expect(page).toHaveURL('/instructions');
  await expect(page.getByRole('link', { name: 'Back to support', exact: true })).toBeVisible();
  await page
    .getByRole('link')
    .filter({
      has: page.getByRole('heading', { name: 'Как настроить VPN на Android', exact: true }),
    })
    .click();
  await expect(page).toHaveURL('/instructions/connect-android');
  await page.reload();
  await expect(page.getByRole('link', { name: 'Back to support', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Back to all instructions', exact: true }).click();
  await expect(page).toHaveURL('/instructions');
  await page.getByRole('link', { name: 'Back to support', exact: true }).click();
  await expect(page).toHaveURL('/support');
  await expect(newTicket).toBeVisible();
  expect([...unexpectedApiRequests]).toEqual([]);
});

for (const mode of [
  { type: 'url', tickets: false, contact: 'Open Support' },
  { type: 'profile', tickets: false, contact: 'Contact Support' },
  { type: 'both', tickets: true, contact: 'Message' },
]) {
  test(`offers instructions before contacting ${mode.type} support`, async ({ page }) => {
    const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
      responses: {
        ...responses,
        '/api/cabinet/info/support-config': {
          tickets_enabled: mode.tickets,
          support_type: mode.type,
          support_url: 'https://example.test/support',
          support_username: '@test_support',
        },
      },
    });
    await page.goto('/support');
    const instructions = page.getByRole('link', { name: 'Open instructions', exact: true });
    const contact = page.getByRole('button', { name: mode.contact, exact: true });
    await expect(instructions).toBeVisible();
    await expect(contact).toBeVisible();
    const instructionsBox = await instructions.boundingBox();
    const contactBox = await contact.boundingBox();
    if (!instructionsBox || !contactBox) throw new Error('Both support actions must be visible');
    expect(instructionsBox.y + instructionsBox.height).toBeLessThanOrEqual(contactBox.y);
    await instructions.click();
    await expect(page).toHaveURL('/instructions');
    await page.goBack();
    await expect(page).toHaveURL('/support');
    await expect(contact).toBeVisible();
    expect([...unexpectedApiRequests]).toEqual([]);
  });
}

test('does not place an instructions exit beside an in-progress ticket draft', async ({ page }) => {
  await prepareAuthenticatedPage(page, { responses });
  await page.goto('/support');
  await page.getByRole('button', { name: 'New Ticket', exact: true }).click();
  await page.getByRole('textbox', { name: 'Subject', exact: true }).fill('Connection question');
  await page
    .getByRole('textbox', { name: 'Message', exact: true })
    .fill('I still need help with setup.');
  await expect(page.getByRole('link', { name: 'Open instructions', exact: true })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Subject', exact: true })).toHaveValue(
    'Connection question',
  );
  await expect(page.getByRole('textbox', { name: 'Message', exact: true })).toHaveValue(
    'I still need help with setup.',
  );
});

test('does not add a Support return to a direct instructions visit', async ({ page }) => {
  await prepareAuthenticatedPage(page);
  await page.goto('/instructions');
  await expect(
    page.getByRole('heading', { name: 'Instructions and setup', level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to support', exact: true })).toHaveCount(0);
});

for (const colorScheme of ['dark', 'light'] as const) {
  test(`keeps the Russian support prompt readable in ${colorScheme} theme`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await prepareAuthenticatedPage(page, { responses, language: 'ru' });
    await page.goto('/support');
    const instructions = page.getByRole('link', { name: 'Открыть инструкции', exact: true });
    await expect(instructions).toBeVisible();
    await expect
      .poll(() =>
        instructions.evaluate((link) => {
          let element: Element | null = link;
          while (element) {
            if (getComputedStyle(element).opacity !== '1') return false;
            element = element.parentElement;
          }
          return true;
        }),
      )
      .toBe(true);
    await page.evaluate(() => document.fonts.ready);
    const box = await instructions.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth),
    ).toBe(false);
    await page.screenshot({ path: testInfo.outputPath(`support-instructions-${colorScheme}.png`) });
  });
}
