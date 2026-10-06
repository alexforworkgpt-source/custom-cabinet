import { expect, test } from '@playwright/test';
import { browserTestUser, prepareAuthenticatedPage } from './cabinetTestHarness';

for (const verified of [true, false]) {
  test(`account actions stay centered and email change works, verified=${verified}`, async ({
    page,
  }) => {
    const email = 'account@example.test';
    await prepareAuthenticatedPage(page, {
      language: 'ru',
      user: { ...browserTestUser, email, email_verified: verified },
      responses: {
        '/api/cabinet/auth/account/linked-providers': {
          providers: [
            { provider: 'email', linked: true, identifier: email },
            { provider: 'google', linked: true, identifier: 'google@example.test' },
          ],
        },
        '/api/cabinet/branding/email-auth': { enabled: true, verification_enabled: true },
      },
    });
    await page.addInitScript(
      (theme) => localStorage.setItem('cabinet-theme', theme),
      verified ? 'dark' : 'light',
    );
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/profile/accounts');
    const changeEmail = page.getByRole('button', { name: 'Сменить почту', exact: true });
    await expect(changeEmail).toBeVisible();
    await expect(page.getByText('Привязан', { exact: true })).toHaveCount(0);
    const emailRow = page.getByText(email, { exact: true }).locator('../../..');
    const googleRow = page.getByText('google@example.test', { exact: true }).locator('../../..');
    await expect(emailRow.getByRole('button', { name: 'Сменить почту', exact: true })).toHaveCount(
      1,
    );
    for (const [row, action] of [
      [emailRow, changeEmail],
      [googleRow, googleRow.getByRole('button', { name: 'Отвязать', exact: true })],
    ]) {
      const [rowBox, actionBox] = await Promise.all([row.boundingBox(), action.boundingBox()]);
      if (!rowBox || !actionBox) throw new Error('Account action must have visible bounds');
      expect(
        Math.abs(rowBox.y + rowBox.height / 2 - actionBox.y - actionBox.height / 2),
      ).toBeLessThan(1);
    }
    await expect(
      page.getByText('Подтвердите email для использования входа по почте.', { exact: true }),
    ).toHaveCount(verified ? 0 : 1);
    await changeEmail.click();
    await expect(page.getByLabel('Новый email', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Отмена', exact: true }).click();
    await expect(changeEmail).toBeVisible();
    await expect(page.getByLabel('Новый email', { exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}
