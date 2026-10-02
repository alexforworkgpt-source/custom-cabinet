// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReminderResponse } from '@/api/adminReminders';
import { usePermissionStore } from '@/store/permissions';

const { api } = vi.hoisted(() => ({
  api: {
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    audience: vi.fn(),
    test: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'ru' } }),
}));
vi.mock('@/api/adminReminders', () => ({ adminRemindersApi: api }));

import AdminReminderEdit from './AdminReminderEdit';

function renderAt(path: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return {
    client,
    ...render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[path]}>
          <Routes>
            <Route path="/admin/reminders/create" element={<AdminReminderEdit />} />
            <Route path="/admin/reminders/:id/edit" element={<AdminReminderEdit />} />
            <Route path="/admin/reminders" element={<div>list</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  };
}

const baseReminder: ReminderResponse = {
  id: 5,
  name: 'Существующее',
  channels: 'both',
  category: 'service',
  conditions: {},
  repeat_every_days: 7,
  max_sends: 1,
  texts: { ru: { title: 'Заголовок', body: 'Текст', button: null } },
  button_kind: 'none',
  button_target: null,
  is_active: true,
  is_builtin: false,
  created_at: null,
  updated_at: null,
  stats: { sent_total: 0, dismissed_total: 0, audience_bot: null, audience_cabinet: null },
};

function fillRequiredCreateFields(name = 'X') {
  fireEvent.change(screen.getByLabelText('admin.reminders.form.name'), {
    target: { value: name },
  });
  fireEvent.change(screen.getByLabelText('admin.reminders.form.title'), {
    target: { value: 'Заголовок' },
  });
  fireEvent.change(screen.getByLabelText('admin.reminders.form.body'), {
    target: { value: 'Текст' },
  });
}

describe('AdminReminderEdit', () => {
  beforeEach(() => {
    usePermissionStore.setState({
      permissions: ['*:*'],
      roles: [],
      roleLevel: 100,
      isLoaded: true,
    });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('builds the audience request and saved payload from the public form', async () => {
    api.audience.mockResolvedValue({ bot: 3, cabinet: 5 });
    api.create.mockResolvedValue({ id: 1 });
    renderAt('/admin/reminders/create');

    fireEvent.change(screen.getByLabelText('admin.reminders.form.name'), {
      target: { value: 'Способ входа' },
    });
    fireEvent.change(screen.getByLabelText('admin.reminders.form.auth'), {
      target: { value: 'single_method' },
    });
    fireEvent.change(screen.getByLabelText('admin.reminders.form.registeredDays'), {
      target: { value: '3' },
    });
    fireEvent.change(screen.getByLabelText('admin.reminders.form.title'), {
      target: { value: 'Заголовок' },
    });
    fireEvent.change(screen.getByLabelText('admin.reminders.form.body'), {
      target: { value: 'Текст' },
    });
    fireEvent.change(screen.getByLabelText('admin.reminders.form.buttonKind'), {
      target: { value: 'cabinet' },
    });
    fireEvent.change(screen.getByLabelText('admin.reminders.form.buttonTarget'), {
      target: { value: '/profile/accounts' },
    });
    fireEvent.change(screen.getByLabelText('admin.reminders.form.buttonText'), {
      target: { value: 'Привязать' },
    });

    await waitFor(() =>
      expect(api.audience).toHaveBeenCalledWith({
        conditions: { auth: 'single_method', registered_days_min: 3 },
        channels: 'both',
        category: 'service',
      }),
    );
    expect(await screen.findByText(/3/)).toBeTruthy();

    fireEvent.click(screen.getByText('admin.reminders.form.save'));
    await waitFor(() => expect(api.create).toHaveBeenCalled());
    expect(api.create.mock.calls[0][0]).toEqual({
      name: 'Способ входа',
      channels: 'both',
      category: 'service',
      conditions: { auth: 'single_method', registered_days_min: 3 },
      repeat_every_days: 7,
      max_sends: 1,
      texts: { ru: { title: 'Заголовок', body: 'Текст', button: 'Привязать' } },
      button_kind: 'cabinet',
      button_target: '/profile/accounts',
    });
  });

  it('does not save without a Russian title and body', async () => {
    api.audience.mockResolvedValue({ bot: 0, cabinet: 0 });
    renderAt('/admin/reminders/create');
    fireEvent.change(screen.getByLabelText('admin.reminders.form.name'), {
      target: { value: 'X' },
    });

    fireEvent.click(screen.getByText('admin.reminders.form.save'));

    expect(await screen.findByText('admin.reminders.form.ruRequired')).toBeTruthy();
    expect(api.create).not.toHaveBeenCalled();
  });

  it('removes stored button text and target when the button is disabled', async () => {
    api.audience.mockResolvedValue({ bot: 1, cabinet: 1 });
    api.create.mockResolvedValue({ id: 2 });
    renderAt('/admin/reminders/create');
    fillRequiredCreateFields('Кнопка');
    fireEvent.change(screen.getByLabelText('admin.reminders.form.buttonKind'), {
      target: { value: 'cabinet' },
    });
    fireEvent.change(screen.getByLabelText('admin.reminders.form.buttonTarget'), {
      target: { value: '/profile/accounts' },
    });
    fireEvent.change(screen.getByLabelText('admin.reminders.form.buttonText'), {
      target: { value: 'Привязать' },
    });
    fireEvent.change(screen.getByLabelText('admin.reminders.form.buttonKind'), {
      target: { value: 'none' },
    });

    fireEvent.click(screen.getByText('admin.reminders.form.save'));
    await waitFor(() => expect(api.create).toHaveBeenCalled());

    const sent = api.create.mock.calls[0][0];
    expect(sent.texts.ru).toEqual({ title: 'Заголовок', body: 'Текст' });
    expect(sent.button_target).toBeNull();
  });

  it('does not query the audience or save while a tariff segment has no id', async () => {
    api.audience.mockResolvedValue({ bot: 1, cabinet: 1 });
    renderAt('/admin/reminders/create');
    await waitFor(() => expect(api.audience).toHaveBeenCalled());
    const callsBeforeTariff = api.audience.mock.calls.length;
    fillRequiredCreateFields('Тариф');
    fireEvent.change(screen.getByLabelText('admin.reminders.form.segment'), {
      target: { value: 'tariff' },
    });

    await new Promise((resolve) => setTimeout(resolve, 600));
    expect(api.audience).toHaveBeenCalledTimes(callsBeforeTariff);
    fireEvent.click(screen.getByText('admin.reminders.form.save'));
    expect(await screen.findByText('admin.reminders.form.tariffRequired')).toBeTruthy();
    expect(api.create).not.toHaveBeenCalled();
  });

  it.each([
    [400, 'admin.reminders.form.testNoTelegram'],
    [422, 'admin.reminders.form.testInvalidTexts'],
    [502, 'admin.reminders.form.testFailed'],
  ])('maps test-to-self HTTP %s to %s', async (status, message) => {
    api.get.mockResolvedValue(baseReminder);
    api.audience.mockResolvedValue({ bot: 0, cabinet: 0 });
    api.test.mockRejectedValueOnce({ isAxiosError: true, response: { status } });
    renderAt('/admin/reminders/5/edit');

    await screen.findByDisplayValue('Заголовок');
    fireEvent.click(screen.getByText('admin.reminders.form.sendTest'));

    expect(await screen.findByText(message)).toBeTruthy();
  });

  it('shows empty fields for a language missing from stored texts', async () => {
    api.get.mockResolvedValue(baseReminder);
    api.audience.mockResolvedValue({ bot: 0, cabinet: 0 });
    renderAt('/admin/reminders/5/edit');

    await screen.findByDisplayValue('Заголовок');
    fireEvent.click(screen.getByText('EN'));

    expect((screen.getByLabelText('admin.reminders.form.title') as HTMLInputElement).value).toBe(
      '',
    );
    expect((screen.getByLabelText('admin.reminders.form.body') as HTMLTextAreaElement).value).toBe(
      '',
    );
  });

  it('uses RTL editing direction for Farsi reminder text', async () => {
    api.audience.mockResolvedValue({ bot: 0, cabinet: 0 });
    renderAt('/admin/reminders/create');

    fireEvent.click(screen.getByText('FA'));

    expect(screen.getByLabelText('admin.reminders.form.title').getAttribute('dir')).toBe('rtl');
    expect(screen.getByLabelText('admin.reminders.form.body').getAttribute('dir')).toBe('rtl');

    fireEvent.click(screen.getByText('EN'));

    expect(screen.getByLabelText('admin.reminders.form.title').getAttribute('dir')).toBe('ltr');
    expect(screen.getByLabelText('admin.reminders.form.body').getAttribute('dir')).toBe('ltr');
  });

  it('requires a Russian button text when a button is enabled', async () => {
    api.audience.mockResolvedValue({ bot: 0, cabinet: 0 });
    renderAt('/admin/reminders/create');
    fillRequiredCreateFields('Кнопка');
    fireEvent.change(screen.getByLabelText('admin.reminders.form.buttonKind'), {
      target: { value: 'cabinet' },
    });
    fireEvent.change(screen.getByLabelText('admin.reminders.form.buttonTarget'), {
      target: { value: '/profile/accounts' },
    });

    fireEvent.click(screen.getByText('admin.reminders.form.save'));

    expect(await screen.findByText('admin.reminders.form.buttonTextRequired')).toBeTruthy();
    expect(api.create).not.toHaveBeenCalled();
  });

  it('requires both title and body for a partially filled translation', async () => {
    api.audience.mockResolvedValue({ bot: 0, cabinet: 0 });
    renderAt('/admin/reminders/create');
    fillRequiredCreateFields('Частичный язык');
    fireEvent.click(screen.getByText('EN'));
    fireEvent.change(screen.getByLabelText('admin.reminders.form.title'), {
      target: { value: 'Only title' },
    });

    fireEvent.click(screen.getByText('admin.reminders.form.save'));

    expect(await screen.findByText('admin.reminders.form.partialLanguage')).toBeTruthy();
    expect(api.create).not.toHaveBeenCalled();
  });

  it('requires an https URL for an external button', async () => {
    api.audience.mockResolvedValue({ bot: 0, cabinet: 0 });
    renderAt('/admin/reminders/create');
    fillRequiredCreateFields('Ссылка');
    fireEvent.change(screen.getByLabelText('admin.reminders.form.buttonKind'), {
      target: { value: 'url' },
    });
    fireEvent.change(screen.getByLabelText('admin.reminders.form.buttonTarget'), {
      target: { value: 'http://insecure.example' },
    });
    fireEvent.change(screen.getByLabelText('admin.reminders.form.buttonText'), {
      target: { value: 'Open' },
    });

    fireEvent.click(screen.getByText('admin.reminders.form.save'));

    expect(await screen.findByText('admin.reminders.form.httpsRequired')).toBeTruthy();
    expect(api.create).not.toHaveBeenCalled();
  });

  it('shows the backend validation message when saving fails with 422', async () => {
    api.audience.mockResolvedValue({ bot: 0, cabinet: 0 });
    api.create.mockRejectedValueOnce({
      isAxiosError: true,
      response: { status: 422, data: { detail: [{ msg: 'texts.ru is required' }] } },
    });
    renderAt('/admin/reminders/create');
    fillRequiredCreateFields();

    fireEvent.click(screen.getByText('admin.reminders.form.save'));

    expect(await screen.findByText('texts.ru is required')).toBeTruthy();
  });

  it('falls back to a generic save error without backend details', async () => {
    api.audience.mockResolvedValue({ bot: 0, cabinet: 0 });
    api.create.mockRejectedValueOnce({ isAxiosError: true, response: { status: 500 } });
    renderAt('/admin/reminders/create');
    fillRequiredCreateFields();

    fireEvent.click(screen.getByText('admin.reminders.form.save'));

    expect(await screen.findByText('admin.reminders.form.saveFailed')).toBeTruthy();
  });

  it('explains that test-to-self sends the saved version', async () => {
    api.get.mockResolvedValue(baseReminder);
    api.audience.mockResolvedValue({ bot: 0, cabinet: 0 });
    renderAt('/admin/reminders/5/edit');

    await screen.findByDisplayValue('Заголовок');
    expect(screen.getByText('admin.reminders.form.testHint')).toBeTruthy();
  });

  it('does not overwrite unsaved input when the reminder query refetches', async () => {
    api.get.mockResolvedValue(baseReminder);
    api.audience.mockResolvedValue({ bot: 0, cabinet: 0 });
    const { client } = renderAt('/admin/reminders/5/edit');
    await screen.findByDisplayValue('Заголовок');
    fireEvent.change(screen.getByLabelText('admin.reminders.form.name'), {
      target: { value: 'Печатаю новое имя' },
    });

    client.setQueryData(['admin-reminder', 5], {
      ...baseReminder,
      stats: { ...baseReminder.stats, sent_total: 7 },
    });

    await waitFor(() =>
      expect((screen.getByLabelText('admin.reminders.form.name') as HTMLInputElement).value).toBe(
        'Печатаю новое имя',
      ),
    );
  });
});
