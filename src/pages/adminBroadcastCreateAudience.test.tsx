// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PlatformProvider } from '@/platform/PlatformProvider';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: unknown) =>
      options && typeof options === 'object' && 'name' in options
        ? `${key}:${String((options as { name: unknown }).name)}`
        : key,
    i18n: { language: 'ru' },
  }),
}));

const api = vi.hoisted(() => ({
  getFilters: vi.fn(),
  getEmailFilters: vi.fn(),
  getButtons: vi.fn(),
  preview: vi.fn(),
  previewEmail: vi.fn(),
  previewAudience: vi.fn(),
  searchAudienceUsers: vi.fn(),
  getTariffs: vi.fn(),
  createCombined: vi.fn(),
}));

vi.mock('../api/adminBroadcasts', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/adminBroadcasts')>();
  return { ...actual, adminBroadcastsApi: { ...actual.adminBroadcastsApi, ...api } };
});

beforeEach(() => {
  for (const fn of Object.values(api)) fn.mockReset();
  api.getFilters.mockResolvedValue({ filters: [], tariff_filters: [], custom_filters: [] });
  api.getButtons.mockResolvedValue({ buttons: [] });
  api.getEmailFilters.mockResolvedValue({
    filters: [{ key: 'all_email', label: 'Все с email', count: 10, group: 'basic' }],
    promo_group_filters: [
      { key: 'promo_group_7', label: 'Продвинутый', count: 3, group: 'promo_group' },
    ],
  });
  api.previewEmail.mockImplementation(async (target: string) => ({
    target,
    count: target === 'user_42' ? 0 : 3,
  }));
  api.createCombined.mockResolvedValue({ id: 900 });
  api.getTariffs.mockResolvedValue({ tariffs: [] });
  api.previewAudience.mockImplementation(async ({ audience }) => ({
    count: audience.conditions[0]?.value === '42' ? 0 : 3,
    offset: 0,
    limit: 50,
    users: [],
  }));
});

afterEach(cleanup);

async function renderPage(entry: string | { pathname: string; search: string; state: unknown }) {
  const AdminBroadcastCreate = (await import('./AdminBroadcastCreate')).default;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <PlatformProvider>
        <MemoryRouter initialEntries={[entry]}>
          <Routes>
            <Route path="/admin/broadcasts/create" element={<AdminBroadcastCreate />} />
            <Route path="/admin/broadcasts/:id" element={<div>detail</div>} />
          </Routes>
        </MemoryRouter>
      </PlatformProvider>
    </QueryClientProvider>,
  );
}

describe('AdminBroadcastCreate email audiences', () => {
  it('keeps the accepted Telegram job identifiable and retries only Email after a partial failure', async () => {
    api.createCombined
      .mockResolvedValueOnce({ id: 900 })
      .mockRejectedValueOnce({ response: { data: { detail: 'Email failed' } } })
      .mockResolvedValueOnce({ id: 901 });
    await renderPage('/admin/broadcasts/create');
    fireEvent.click(screen.getByText('admin.broadcasts.enableEmail'));
    await screen.findByRole('option', { name: 'admin.broadcasts.filterGroups.promo_group' });
    for (const field of screen.getAllByRole('combobox', {
      name: 'admin.broadcasts.audience.field',
    })) {
      fireEvent.change(field, { target: { value: 'basic' } });
    }
    fireEvent.change(screen.getByPlaceholderText('admin.broadcasts.messageTextPlaceholder'), {
      target: { value: 'Hello' },
    });
    fireEvent.change(screen.getByPlaceholderText('admin.broadcasts.emailSubjectPlaceholder'), {
      target: { value: 'Subject' },
    });
    fireEvent.change(screen.getByPlaceholderText('admin.broadcasts.emailContentPlaceholder'), {
      target: { value: '<p>Hello</p>' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'admin.broadcasts.send' }));
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.getByRole('link', { name: /900/ }).getAttribute('href')).toBe(
      '/admin/broadcasts/900',
    );
    expect(api.createCombined).toHaveBeenCalledTimes(2);
    fireEvent.click(screen.getByRole('button', { name: 'admin.broadcasts.send' }));
    await waitFor(() => expect(api.createCombined).toHaveBeenCalledTimes(3));
    expect(api.createCombined.mock.calls.map(([request]) => request.channel)).toEqual([
      'telegram',
      'email',
      'email',
    ]);
  });
  it('opens a direct-user email preset and sends its stable internal ID as an audience rule', async () => {
    await renderPage({
      pathname: '/admin/broadcasts/create',
      search: '?email_user=42',
      state: { emailUserLabel: 'egor@example.com' },
    });

    await waitFor(() =>
      expect(api.previewAudience).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'email',
          audience: { conditions: [expect.objectContaining({ field: 'email_user', value: '42' })] },
        }),
      ),
    );
    expect(await screen.findByDisplayValue('egor@example.com')).toBeTruthy();
    expect(await screen.findByText('0')).toBeTruthy();

    fireEvent.change(screen.getByPlaceholderText('admin.broadcasts.emailSubjectPlaceholder'), {
      target: { value: 'Тема' },
    });
    fireEvent.change(screen.getByPlaceholderText('admin.broadcasts.emailContentPlaceholder'), {
      target: { value: '<p>Привет</p>' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'admin.broadcasts.send' }));

    await waitFor(() =>
      expect(api.createCombined).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'email',
          audience: {
            conditions: [
              expect.objectContaining({
                field: 'email_user',
                value: '42',
                operator: 'eq',
                join: null,
              }),
            ],
          },
        }),
        expect.anything(),
      ),
    );
  });

  it('keeps a direct-user target identifiable after reload without router state', async () => {
    await renderPage('/admin/broadcasts/create?email_user=42');

    expect(await screen.findByDisplayValue('#42')).toBeTruthy();
  });

  it('offers promo_group_<id> through the email audience rule editor', async () => {
    await renderPage('/admin/broadcasts/create');
    fireEvent.click(screen.getByText('admin.broadcasts.enableEmail'));
    fireEvent.click(screen.getByText('admin.broadcasts.enableTelegram'));

    await screen.findByRole('option', { name: 'admin.broadcasts.filterGroups.promo_group' });
    fireEvent.change(screen.getByRole('combobox', { name: 'admin.broadcasts.audience.field' }), {
      target: { value: 'promo_group' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'admin.broadcasts.audience.value' }), {
      target: { value: 'promo_group_7' },
    });

    await waitFor(() =>
      expect(api.previewAudience).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: 'email',
          audience: {
            conditions: [expect.objectContaining({ field: 'promo_group', value: 'promo_group_7' })],
          },
        }),
      ),
    );
  });

  it('ignores an invalid email_user query parameter', async () => {
    await renderPage('/admin/broadcasts/create?email_user=abc');

    expect(screen.queryByText(/admin\.broadcasts\.singleUser/)).toBeNull();
    expect(api.previewEmail).not.toHaveBeenCalled();
  });
});
