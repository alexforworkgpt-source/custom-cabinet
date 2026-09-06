// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { PlatformProvider } from '@/platform/PlatformProvider';
import { ToastProvider } from '@/components/Toast';
import AdminEmailTemplates from './AdminEmailTemplates';

const state = vi.hoisted(() => ({
  type: 'renewal',
  canDisable: true,
  setEnabled: vi.fn(async () => ({ status: 'ok', enabled: false })),
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'ru' } }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));
vi.mock('../api/adminEmailTemplates', () => ({
  adminEmailTemplatesApi: {
    getTemplateTypes: async () => ({
      items: [
        {
          type: state.type,
          label: { ru: 'Test template' },
          description: {},
          languages: { ru: { has_custom: false } },
          context_vars: [],
        },
      ],
    }),
    getTemplate: async () => ({
      notification_type: state.type,
      label: { ru: 'Test template' },
      description: {},
      context_vars: [],
      enabled: true,
      can_disable: state.canDisable,
      languages: {
        ru: {
          subject: 'Subject',
          is_default: true,
          body_html:
            '<html><div class="content">{content}</div><div class="footer">Footer</div></html>',
          default_subject: 'Subject',
          default_body_html: '<html>{content}</html>',
        },
      },
    }),
    setEnabled: state.setEnabled,
  },
}));
afterEach(() => {
  cleanup();
  state.type = 'renewal';
  state.canDisable = true;
  state.setEnabled.mockClear();
});

async function openEditor() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <PlatformProvider>
        <MemoryRouter>
          <ToastProvider>
            <AdminEmailTemplates />
          </ToastProvider>
        </MemoryRouter>
      </PlatformProvider>
    </QueryClientProvider>,
  );
  fireEvent.click(await screen.findByText('Test template'));
  await screen.findByRole('button', { name: 'admin.emailTemplates.sendTest' });
}

it('changes sending only through the explicit template switch', async () => {
  await openEditor();
  expect(state.setEnabled).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('switch', { name: 'admin.emailTemplates.sendingToggle' }));
  await waitFor(() => expect(state.setEnabled).toHaveBeenCalledWith('renewal', false));
});

it('keeps required email types enabled', async () => {
  state.canDisable = false;
  await openEditor();
  const toggle = screen.getByRole('switch', { name: 'admin.emailTemplates.sendingToggle' });
  expect(toggle.hasAttribute('disabled')).toBe(true);
  fireEvent.click(toggle);
  expect(state.setEnabled).not.toHaveBeenCalled();
});

it('edits the whole shared layout without a sending switch', async () => {
  state.type = 'email_layout';
  await openEditor();
  expect(screen.queryByRole('switch')).toBeNull();
  expect(screen.queryByPlaceholderText('admin.emailTemplates.subjectPlaceholder')).toBeNull();
  const editor = screen.getByDisplayValue(/<html><div class="content">/);
  expect(editor.tagName).toBe('TEXTAREA');
});
