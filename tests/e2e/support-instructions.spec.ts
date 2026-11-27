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

for (const language of ['ru', 'en'] as const) {
  test(`paints Support with Manrope on a cold ${language} visit even if Google Fonts is unavailable`, async ({
    page,
    context,
  }) => {
    await prepareAuthenticatedPage(page, { language, responses });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route(
      (url) => ['fonts.googleapis.com', 'fonts.gstatic.com'].includes(url.hostname),
      (route) => route.abort(),
    );

    const devtools = await context.newCDPSession(page);
    await devtools.send('DOM.enable');
    await devtools.send('CSS.enable');
    await page.goto('/support', { waitUntil: 'domcontentloaded' });

    const heading = page.getByRole('heading', { level: 1, name: /Support|Поддержка/ });
    await expect(heading).toBeVisible();
    const { root } = await devtools.send('DOM.getDocument');
    const readFonts = async (selector: string) => {
      const { nodeId } = await devtools.send('DOM.querySelector', {
        nodeId: root.nodeId,
        selector,
      });
      const { fonts } = await devtools.send('CSS.getPlatformFontsForNode', { nodeId });
      return fonts.filter((font) => font.glyphCount > 0).map((font) => font.familyName);
    };

    const firstFonts = await readFonts('main h1');
    expect(firstFonts.length).toBeGreaterThan(0);
    expect(firstFonts.every((family) => family.startsWith('Manrope'))).toBe(true);
    const firstHeading = await heading.boundingBox();
    await page.evaluate(() => document.fonts.ready);
    expect(await readFonts('main h1')).toEqual(firstFonts);
    expect(await heading.boundingBox()).toEqual(firstHeading);
    expect((await readFonts('main p')).join()).toContain('Manrope');
  });
}

test('places instructions below New Ticket and returns from an article to Support', async ({
  page,
}) => {
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, { responses });
  await page.goto('/support', { waitUntil: 'domcontentloaded' });
  const instructions = page.getByRole('link', { name: 'Instructions and setup', exact: true });
  const newTicket = page.getByRole('button', { name: 'New Ticket', exact: true });
  await expect(instructions).toHaveAttribute('href', '/instructions');
  await expect(newTicket).toBeEnabled();
  const instructionsBox = await instructions.boundingBox();
  const newTicketBox = await newTicket.boundingBox();
  if (!instructionsBox || !newTicketBox) throw new Error('Both support actions must be visible');
  expect(newTicketBox.y + newTicketBox.height).toBeLessThanOrEqual(instructionsBox.y);
  const headingBox = await page.getByRole('heading', { name: 'Support', level: 1 }).boundingBox();
  if (!headingBox) throw new Error('The support heading must be visible');
  expect(newTicketBox.y).toBeGreaterThanOrEqual(headingBox.y + headingBox.height);
  const banner = page.getByRole('heading', { name: 'Need help?', exact: true }).locator('..');
  const bannerWidth = await banner.evaluate((element: HTMLElement) => element.offsetWidth);
  const buttonWidth = await newTicket.evaluate((element: HTMLElement) => element.offsetWidth);
  expect(buttonWidth).toBe(bannerWidth);

  await instructions.click();
  await expect(page).toHaveURL('/instructions');
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Back to support', exact: true })).toBeVisible();
  await page
    .getByRole('link')
    .filter({
      has: page.getByRole('heading', { name: 'Как настроить VPN на Android', exact: true }),
    })
    .click();
  await expect(page).toHaveURL('/instructions/connect-android');
  await expect(page.getByRole('main')).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('link', { name: 'Back to support', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Back to all instructions', exact: true }).click();
  await expect(page).toHaveURL('/instructions');
  await page.getByRole('link', { name: 'Back to support', exact: true }).click();
  await expect(page).toHaveURL('/support');
  await expect(newTicket).toBeVisible();
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('centers the instructions icon beside its copy', async ({ page }) => {
  await prepareAuthenticatedPage(page, { responses });
  await page.goto('/support', { waitUntil: 'domcontentloaded' });

  const instructions = page.getByRole('link', {
    name: 'Instructions and setup',
    exact: true,
  });
  await expect(instructions).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await expect
    .poll(async () => {
      const iconBox = await instructions.locator('svg').first().boundingBox();
      const copyBox = await instructions
        .getByText('Instructions and setup', { exact: true })
        .boundingBox();
      if (!iconBox || !copyBox) return Number.POSITIVE_INFINITY;

      return Math.abs(iconBox.y + iconBox.height / 2 - (copyBox.y + copyBox.height / 2));
    })
    .toBeLessThanOrEqual(4);
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
    await page.goto('/support', { waitUntil: 'domcontentloaded' });
    const instructions = page.getByRole('link', { name: 'Instructions and setup', exact: true });
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
  await page.goto('/support', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'New Ticket', exact: true }).click();
  await page.getByRole('textbox', { name: 'Subject', exact: true }).fill('Connection question');
  await page
    .getByRole('textbox', { name: 'Message', exact: true })
    .fill('I still need help with setup.');
  await expect(page.getByRole('link', { name: 'Instructions and setup', exact: true })).toHaveCount(
    0,
  );
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
  await expect(page.getByRole('main')).toHaveCount(1);
  await expect(
    page.getByRole('heading', { name: 'Instructions and setup', level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Back to support', exact: true })).toHaveCount(0);
});

test('keeps the Support return after selecting an instruction scenario', async ({ page }) => {
  await prepareAuthenticatedPage(page, { responses });
  await page.goto('/support', { waitUntil: 'domcontentloaded' });
  await page.getByRole('link', { name: 'Instructions and setup', exact: true }).click();
  await page
    .getByRole('link')
    .filter({
      has: page.getByRole('heading', { name: 'Как поделиться подпиской', exact: true }),
    })
    .click();

  await page.getByRole('button', { name: /Я делюсь подпиской/ }).click();
  await expect(page).toHaveURL('/instructions/share-subscription?scenario=sender');
  await expect(page.getByRole('link', { name: 'Back to support', exact: true })).toBeVisible();

  await page.getByRole('link', { name: 'Back to all instructions', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Back to support', exact: true })).toBeVisible();
});

test('shows the Russian content note on a directly opened article', async ({ page }) => {
  await prepareAuthenticatedPage(page, { language: 'en' });
  await page.goto('/instructions/connect-android');

  await expect(
    page.getByText('The guides are currently available in Russian.', { exact: true }),
  ).toBeVisible();
});

test('shows step screenshots inline and can open one larger', async ({ page }) => {
  await prepareAuthenticatedPage(page);
  await page.goto('/instructions/connect-android');

  const instructionImage = page.locator(
    'main img[src$="/instructions/connect-android/01-open-connection.png"]',
  );
  await expect(instructionImage).toBeVisible();
  const stepBox = await instructionImage.locator('xpath=ancestor::li').boundingBox();
  const imageBox = await instructionImage.boundingBox();
  if (!stepBox || !imageBox) throw new Error('The instruction step and screenshot must be visible');
  expect(
    Math.abs(imageBox.x + imageBox.width / 2 - (stepBox.x + stepBox.width / 2)),
  ).toBeLessThanOrEqual(1);

  await page.getByRole('button', { name: 'Open larger' }).first().click();
  const dialog = page.getByRole('dialog', { name: /Screenshot:/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('img', { name: /Откройте настройку VPN/ })).toBeVisible();

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('shows scenario progress and marks optional steps', async ({ page }) => {
  await prepareAuthenticatedPage(page);
  await page.goto('/instructions/share-subscription');

  await page.getByRole('button', { name: /Я делюсь подпиской/ }).click();
  await expect(page.getByLabel('Step 1 of 3')).toBeVisible();
  await expect(page.getByText('Optional', { exact: true })).toHaveCount(2);
});

test('keeps the selected instruction scenario in the URL', async ({ page }) => {
  await prepareAuthenticatedPage(page);
  await page.goto('/instructions/share-subscription?scenario=sender');

  const sender = page.getByRole('button', { name: /Я делюсь подпиской/ });
  const recipient = page.getByRole('button', { name: /Я подключаюсь к подписке/ });
  await expect(sender).toHaveAttribute('aria-expanded', 'true');

  await recipient.click();
  await expect(page).toHaveURL('/instructions/share-subscription?scenario=recipient-android');
  await expect(recipient).toHaveAttribute('aria-expanded', 'true');
  await expect(sender).toHaveAttribute('aria-expanded', 'false');

  await page.reload();
  await expect(recipient).toHaveAttribute('aria-expanded', 'true');
});

for (const colorScheme of ['dark', 'light'] as const) {
  test(`keeps the Russian support prompt readable in ${colorScheme} theme`, async ({
    page,
  }, testInfo) => {
    await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
    await prepareAuthenticatedPage(page, { responses, language: 'ru' });
    await page.goto('/support', { waitUntil: 'domcontentloaded' });
    const instructions = page.getByRole('link', { name: 'Инструкции и настройка', exact: true });
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

    const icon = instructions.locator('span[aria-hidden="true"]').first();
    await expect(icon).toHaveCSS('width', '40px');
    await expect(icon).toHaveCSS('height', '40px');
    const iconStyle = await icon.evaluate((element) => {
      const style = getComputedStyle(element);
      return { background: style.backgroundColor, radius: style.borderRadius };
    });
    expect(iconStyle.background).not.toBe('rgba(0, 0, 0, 0)');

    await instructions.click();
    const referenceIcon = page.locator('section span[aria-hidden="true"]').first();
    await expect(referenceIcon).toBeVisible();
    expect(
      await referenceIcon.evaluate((element) => {
        const style = getComputedStyle(element);
        return { background: style.backgroundColor, radius: style.borderRadius };
      }),
    ).toEqual(iconStyle);
  });
}
