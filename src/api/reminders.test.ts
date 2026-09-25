import { beforeEach, describe, expect, it, vi } from 'vitest';

const clientMocks = vi.hoisted(() => ({
  delete: vi.fn(),
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}));

vi.mock('./client', () => ({ default: clientMocks }));

import { adminRemindersApi, type ReminderPayload } from './adminReminders';
import { remindersApi } from './reminders';

const payload: ReminderPayload = {
  name: 'Link auth',
  channels: 'both',
  category: 'service',
  conditions: { auth: 'single_method', registered_days_min: 3 },
  repeat_every_days: 7,
  max_sends: 1,
  texts: { ru: { title: 'Заголовок', body: 'Текст' } },
  button_kind: 'cabinet',
  button_target: '/profile/accounts',
};

describe('reminders API contracts', () => {
  beforeEach(() => {
    for (const mock of Object.values(clientMocks)) mock.mockReset().mockResolvedValue({ data: {} });
  });

  it('loads localized active cards and dismisses one card', async () => {
    clientMocks.get.mockResolvedValueOnce({ data: [] });

    await remindersApi.getActive('ru');
    await remindersApi.dismiss(7);

    expect(clientMocks.get).toHaveBeenCalledWith('/cabinet/reminders/active', {
      params: { lang: 'ru' },
    });
    expect(clientMocks.post).toHaveBeenCalledWith('/cabinet/reminders/7/dismiss');
  });

  it('uses the exact admin CRUD and action paths', async () => {
    clientMocks.get.mockResolvedValue({ data: [] });

    await adminRemindersApi.list();
    await adminRemindersApi.get(7);
    await adminRemindersApi.create(payload);
    await adminRemindersApi.update(7, payload);
    await adminRemindersApi.toggle(7);
    await adminRemindersApi.remove(7);
    await adminRemindersApi.test(7);

    expect(clientMocks.get).toHaveBeenNthCalledWith(1, '/cabinet/admin/reminders');
    expect(clientMocks.get).toHaveBeenNthCalledWith(2, '/cabinet/admin/reminders/7');
    expect(clientMocks.post).toHaveBeenCalledWith('/cabinet/admin/reminders', payload);
    expect(clientMocks.put).toHaveBeenCalledWith('/cabinet/admin/reminders/7', payload);
    expect(clientMocks.post).toHaveBeenCalledWith('/cabinet/admin/reminders/7/toggle');
    expect(clientMocks.delete).toHaveBeenCalledWith('/cabinet/admin/reminders/7');
    expect(clientMocks.post).toHaveBeenCalledWith('/cabinet/admin/reminders/7/test');
  });

  it('includes category in the audience preview request', async () => {
    const request = {
      conditions: payload.conditions,
      channels: payload.channels,
      category: payload.category,
    };

    await adminRemindersApi.audience(request);

    expect(clientMocks.post).toHaveBeenCalledWith('/cabinet/admin/reminders/audience', request);
  });
});
