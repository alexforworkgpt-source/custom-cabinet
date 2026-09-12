// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlatformProvider } from '@/platform/PlatformProvider';

import ruLocale from '@/locales/ru.json';

function resolveRu(key: string): string | undefined {
  const value = key
    .split('.')
    .reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], ruLocale);
  return typeof value === 'string' ? value : undefined;
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      (resolveRu(key) ?? key).replace(/{{(\w+)}}/g, (_match, name) =>
        String(options?.[name] ?? ''),
      ),
    i18n: { language: 'ru', changeLanguage: () => Promise.resolve() },
  }),
  Trans: ({ children }: { children?: unknown }) => children ?? null,
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

const apiMocks = vi.hoisted(() => ({
  getPartnerSettings: vi.fn(),
  updatePartnerSettings: vi.fn(),
  getTicketSettings: vi.fn(),
  updateTicketSettings: vi.fn(),
}));

vi.mock('@/api/partners', () => ({
  partnerApi: {
    getPartnerSettings: apiMocks.getPartnerSettings,
    updatePartnerSettings: apiMocks.updatePartnerSettings,
  },
}));

vi.mock('@/api/admin', () => ({
  adminApi: {
    getTicketSettings: apiMocks.getTicketSettings,
    updateTicketSettings: apiMocks.updateTicketSettings,
  },
}));

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

(globalThis as Record<string, unknown>).__APP_VERSION__ ??= '0.0.0-test';

afterEach(() => {
  cleanup();
  apiMocks.getPartnerSettings.mockReset();
  apiMocks.updatePartnerSettings.mockReset();
  apiMocks.getTicketSettings.mockReset();
  apiMocks.updateTicketSettings.mockReset();
});

async function renderPage(path: string, load: () => Promise<{ default: React.ComponentType }>) {
  const Page = (await load()).default;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <PlatformProvider>
        <MemoryRouter initialEntries={[path]}>
          <Page />
        </MemoryRouter>
      </PlatformProvider>
    </QueryClientProvider>,
  );
  return client;
}

describe('env-locked partner and ticket settings', () => {
  it('shows a mixed partner form with the env value read-only', async () => {
    apiMocks.getPartnerSettings.mockResolvedValue({
      withdrawal_enabled: true,
      withdrawal_min_amount_kopeks: 100000,
      withdrawal_cooldown_days: 30,
      withdrawal_requisites_text: '',
      partner_section_visible: true,
      referral_program_enabled: true,
      env_locked: ['partner_section_visible'],
    });

    await renderPage('/admin/partners/settings', () => import('./AdminPartnerSettings'));

    const locked = await screen.findByRole('checkbox', {
      name: /Раздел партнёрки виден в кабинете/,
    });
    expect((locked as HTMLInputElement).disabled).toBe(true);
    expect(
      (
        screen.getByRole('checkbox', {
          name: /Реферальная программа включена/,
        }) as HTMLInputElement
      ).disabled,
    ).toBe(false);
    expect(screen.getByText('Задано в .env')).toBeTruthy();
  });

  it('saves only DB-backed partner fields and rereads the backend value', async () => {
    const initial = {
      withdrawal_enabled: true,
      withdrawal_min_amount_kopeks: 100000,
      withdrawal_cooldown_days: 30,
      withdrawal_requisites_text: 'Банк',
      partner_section_visible: true,
      referral_program_enabled: true,
      env_locked: ['partner_section_visible'],
    };
    const confirmed = { ...initial, referral_program_enabled: false };
    apiMocks.getPartnerSettings.mockResolvedValueOnce(initial).mockResolvedValue(confirmed);
    apiMocks.updatePartnerSettings.mockResolvedValue(initial);

    await renderPage('/admin/partners/settings', () => import('./AdminPartnerSettings'));
    const editable = await screen.findByRole('checkbox', {
      name: /Реферальная программа включена/,
    });
    fireEvent.click(editable);
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() => expect(apiMocks.updatePartnerSettings).toHaveBeenCalledTimes(1));
    expect(apiMocks.updatePartnerSettings.mock.calls[0]?.[0]).toEqual({
      withdrawal_enabled: true,
      withdrawal_min_amount_kopeks: 100000,
      withdrawal_cooldown_days: 30,
      withdrawal_requisites_text: 'Банк',
      referral_program_enabled: false,
    });
    await waitFor(() => expect(apiMocks.getPartnerSettings).toHaveBeenCalledTimes(2));
    await waitFor(() => expect((editable as HTMLInputElement).checked).toBe(false));
  });

  it('shows a mixed ticket form with the env value read-only', async () => {
    apiMocks.getTicketSettings.mockResolvedValue({
      sla_enabled: true,
      sla_minutes: 30,
      sla_check_interval_seconds: 60,
      sla_reminder_cooldown_minutes: 15,
      support_system_mode: 'both',
      cabinet_user_notifications_enabled: true,
      cabinet_admin_notifications_enabled: true,
      env_locked: ['sla_minutes'],
    });

    await renderPage('/admin/tickets/settings', () => import('./AdminTicketSettings'));

    await screen.findByRole('heading', { name: 'Настройки' });
    expect((screen.getAllByRole('spinbutton')[0] as HTMLInputElement).disabled).toBe(true);
    expect((screen.getByRole('combobox') as HTMLSelectElement).disabled).toBe(false);
    expect(screen.getByText('Задано в .env')).toBeTruthy();
  });

  it('saves only DB-backed ticket fields and rereads the backend value', async () => {
    const initial = {
      sla_enabled: true,
      sla_minutes: 30,
      sla_check_interval_seconds: 60,
      sla_reminder_cooldown_minutes: 15,
      support_system_mode: 'both',
      cabinet_user_notifications_enabled: true,
      cabinet_admin_notifications_enabled: true,
      env_locked: ['sla_minutes'],
    };
    const confirmed = { ...initial, support_system_mode: 'contact' };
    apiMocks.getTicketSettings.mockResolvedValueOnce(initial).mockResolvedValue(confirmed);
    apiMocks.updateTicketSettings.mockResolvedValue(initial);

    await renderPage('/admin/tickets/settings', () => import('./AdminTicketSettings'));
    const mode = (await screen.findByRole('combobox')) as HTMLSelectElement;
    fireEvent.change(mode, { target: { value: 'tickets' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    await waitFor(() => expect(apiMocks.updateTicketSettings).toHaveBeenCalledTimes(1));
    expect(apiMocks.updateTicketSettings.mock.calls[0]?.[0]).toEqual({
      sla_enabled: true,
      sla_check_interval_seconds: 60,
      sla_reminder_cooldown_minutes: 15,
      support_system_mode: 'tickets',
      cabinet_user_notifications_enabled: true,
      cabinet_admin_notifications_enabled: true,
    });
    await waitFor(() => expect(apiMocks.getTicketSettings).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(mode.value).toBe('contact'));
  });

  it('keeps partner cache server-confirmed and shows the PATCH error', async () => {
    const initial = {
      withdrawal_enabled: true,
      withdrawal_min_amount_kopeks: 100000,
      withdrawal_cooldown_days: 30,
      withdrawal_requisites_text: '',
      partner_section_visible: true,
      referral_program_enabled: true,
      env_locked: ['partner_section_visible'],
    };
    apiMocks.getPartnerSettings.mockResolvedValue(initial);
    apiMocks.updatePartnerSettings.mockRejectedValue(new Error('private backend detail'));

    const client = await renderPage(
      '/admin/partners/settings',
      () => import('./AdminPartnerSettings'),
    );
    fireEvent.click(
      await screen.findByRole('checkbox', { name: /Реферальная программа включена/ }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(await screen.findByText('Не удалось сохранить настройки')).toBeTruthy();
    expect(apiMocks.getPartnerSettings).toHaveBeenCalledTimes(1);
    expect(client.getQueryData(['partner-settings'])).toEqual(initial);
    expect(screen.queryByText('private backend detail')).toBeNull();
  });

  it('keeps ticket cache server-confirmed and shows the PATCH error', async () => {
    const initial = {
      sla_enabled: true,
      sla_minutes: 30,
      sla_check_interval_seconds: 60,
      sla_reminder_cooldown_minutes: 15,
      support_system_mode: 'both',
      cabinet_user_notifications_enabled: true,
      cabinet_admin_notifications_enabled: true,
      env_locked: ['sla_minutes'],
    };
    apiMocks.getTicketSettings.mockResolvedValue(initial);
    apiMocks.updateTicketSettings.mockRejectedValue(new Error('private backend detail'));

    const client = await renderPage(
      '/admin/tickets/settings',
      () => import('./AdminTicketSettings'),
    );
    const mode = await screen.findByRole('combobox');
    fireEvent.change(mode, { target: { value: 'tickets' } });
    fireEvent.click(screen.getByRole('button', { name: 'Сохранить' }));

    expect(await screen.findByText('Ошибка сохранения настроек')).toBeTruthy();
    expect(apiMocks.getTicketSettings).toHaveBeenCalledTimes(1);
    expect(client.getQueryData(['ticket-settings'])).toEqual(initial);
    expect(screen.queryByText('private backend detail')).toBeNull();
  });
});
