import type { Page } from '@playwright/test';
import type { User } from '../../src/types';
import { browserTestUser, prepareAuthenticatedPage } from './cabinetTestHarness';

export const avatarUser: User = {
  ...browserTestUser,
  telegram_id: 123456,
  first_name: 'Dmitry',
  last_name: 'Ivanov',
  username: 'dmitry',
  auth_type: 'telegram',
};

export const avatarImage =
  '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="#3b82f6"/><circle cx="32" cy="23" r="12" fill="#dbeafe"/><path d="M8 64v-8a24 24 0 0 1 48 0v8" fill="#dbeafe"/></svg>';

export async function prepareAvatarPage(
  page: Page,
  options: { user?: User; photoUrl?: string | null; status?: number } = {},
) {
  const fixture = await prepareAuthenticatedPage(page, {
    user: options.user ?? avatarUser,
    responses: {
      '/api/cabinet/auth/me/avatar': {
        photo_url:
          options.photoUrl === undefined ? '/profile-avatar-fixture.svg' : options.photoUrl,
      },
    },
    responseStatuses: { '/api/cabinet/auth/me/avatar': options.status ?? 200 },
  });
  await page.route('**/profile-avatar-fixture.svg', (route) =>
    route.fulfill({ contentType: 'image/svg+xml', body: avatarImage }),
  );
  return fixture;
}
