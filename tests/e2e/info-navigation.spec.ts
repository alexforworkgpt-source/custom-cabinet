import { expect, test } from '@playwright/test';
import { baseApiResponses, prepareAuthenticatedPage } from './cabinetTestHarness';

const responses = {
  '/api/cabinet/info-pages/tab-replacements': {
    faq: null,
    rules: null,
    privacy: null,
    offer: null,
  },
  '/api/cabinet/info-pages': [
    {
      id: 1,
      slug: 'useful-materials',
      title: { en: 'Useful materials', ru: 'Полезные материалы' },
      icon: '📖',
      replaces_tab: null,
    },
  ],
  '/api/cabinet/info/visibility': {
    faq: true,
    rules: true,
    privacy: true,
    offer: true,
    recurrent: true,
  },
  '/api/cabinet/info/faq': [
    { id: 1, title: 'How to connect?', content: '<p>Existing FAQ answer</p>', order: 0 },
  ],
  '/api/cabinet/info/rules': { content: '<p>Existing service rules</p>', updated_at: null },
  '/api/cabinet/info/recurrent-payments': {
    content: '<p>Existing recurring terms</p>',
    updated_at: null,
  },
  '/api/cabinet/info-pages/useful-materials': {
    slug: 'useful-materials',
    title: { en: 'Useful materials', ru: 'Полезные материалы' },
    content: { en: '<p>Existing custom document</p>' },
    page_type: 'page',
    icon: '📖',
  },
};

test('opens mobile Information sections and returns with page and browser back', async ({
  page,
}, testInfo) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 768, 'Mobile section navigation');
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, { responses });
  await page.goto('/info');
  const sections = page.getByRole('navigation', { name: 'Information', exact: true });
  await expect(sections).toBeVisible();
  await expect(sections.getByRole('link')).toHaveCount(7);
  await expect(page.getByText('How to connect?', { exact: true })).not.toBeVisible();

  const rows = await sections.getByRole('link').all();
  for (const row of rows) {
    const box = await row.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({ path: testInfo.outputPath('information-menu.png'), fullPage: true });

  await sections.getByRole('link', { name: 'FAQ', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(sections).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'FAQ', level: 1 })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button', { name: 'How to connect?', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText('Existing FAQ answer')).toBeVisible();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Back', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(sections).toBeVisible();
  await expect(sections.getByRole('link', { name: 'FAQ', exact: true })).toBeFocused();

  await sections.getByRole('link', { name: 'FAQ', exact: true }).click();
  await expect(page.getByText('Existing FAQ answer')).toBeVisible();
  await page.goBack();
  await sections.getByRole('link', { name: 'Rules', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Rules', level: 1 })).toBeVisible();
  await expect(page.getByText('Existing service rules')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('information-section.png'), fullPage: true });
  await page.goBack();
  await expect(sections).toBeVisible();

  await sections.getByRole('link', { name: 'Useful materials', exact: true }).click();
  await expect(page.getByText('Existing custom document')).toBeVisible();
  await page.reload();
  await expect(page.getByText('Existing custom document')).toBeVisible();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(sections).toBeVisible();
  await expect(page).toHaveURL('/info');
  const profileBack = page.getByRole('main').getByRole('link', { name: 'Back', exact: true });
  await expect(profileBack).toHaveAttribute('href', '/profile');
  await profileBack.click();
  await expect(page).toHaveURL('/profile');
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('preserves replaced FAQ and document visibility in Information', async ({ page }) => {
  const { unexpectedApiRequests, apiRequests } = await prepareAuthenticatedPage(page, {
    responses: {
      ...responses,
      '/api/cabinet/info-pages/tab-replacements': {
        ...responses['/api/cabinet/info-pages/tab-replacements'],
        faq: 'replacement-faq',
      },
      '/api/cabinet/info/visibility': {
        ...responses['/api/cabinet/info/visibility'],
        faq: false,
        recurrent: false,
      },
      '/api/cabinet/info-pages/replacement-faq': {
        slug: 'replacement-faq',
        page_type: 'faq',
        title: { en: 'FAQ' },
        content: { en: JSON.stringify([{ q: 'Custom question?', a: '<p>Custom answer</p>' }]) },
      },
    },
  });
  await page.goto('/info');
  if ((page.viewportSize()?.width ?? 0) < 768) {
    const sections = page.getByRole('navigation', { name: 'Information', exact: true });
    await expect(sections.getByRole('link', { name: 'Recurring Payments' })).toHaveCount(0);
    await sections.getByRole('link', { name: 'FAQ', exact: true }).click();
  } else {
    await expect(page.getByRole('button', { name: 'Recurring Payments' })).toHaveCount(0);
  }
  const question = page.getByRole('button', { name: 'Custom question?', exact: true });
  await question.click();
  await expect(question).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('Custom answer')).toBeVisible();
  expect(apiRequests).not.toContain('GET /api/cabinet/info/faq');
  expect(apiRequests).not.toContain('GET /api/cabinet/info/recurrent-payments');
  expect([...unexpectedApiRequests]).toEqual([]);
});

test('keeps Information tabs on wide screens', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) < 768, 'Desktop tabs');
  const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, { responses });
  await page.goto('/info');
  await expect(
    page.getByRole('navigation', { name: 'Information', exact: true }),
  ).not.toBeVisible();
  await page.getByRole('button', { name: 'Rules', exact: true }).click();
  await expect(page.getByText('Existing service rules')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back', exact: true })).not.toBeVisible();
  await expect(
    page.getByRole('main').getByRole('link', { name: 'Back', exact: true }),
  ).toHaveAttribute('href', '/profile');
  await expect(page).toHaveURL('/info');
  expect([...unexpectedApiRequests]).toEqual([]);
});

for (const variant of [
  { language: 'ru', theme: 'light' },
  { language: 'fa', theme: 'dark' },
]) {
  test(`fits mobile Information in ${variant.language} and ${variant.theme} theme`, async ({
    page,
  }, testInfo) => {
    test.skip((page.viewportSize()?.width ?? 0) >= 768, 'Mobile layout');
    const { unexpectedApiRequests } = await prepareAuthenticatedPage(page, {
      language: variant.language,
      responses: {
        ...responses,
        '/api/cabinet/branding/colors': {
          ...(baseApiResponses['/api/cabinet/branding/colors'] as Record<string, unknown>),
          accent: '#d946ef',
        },
      },
    });
    await page.addInitScript(
      (theme) => localStorage.setItem('cabinet-theme', theme),
      variant.theme,
    );
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/info');
    const sections = page.getByRole('main').getByRole('navigation');
    await expect(sections.getByRole('link')).toHaveCount(7);
    await expect(sections.getByRole('link').last()).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    if (variant.language === 'fa') {
      await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    }
    await page.screenshot({
      path: testInfo.outputPath('information-localized.png'),
      fullPage: true,
    });
    expect([...unexpectedApiRequests]).toEqual([]);
  });
}
