// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, expect, it, vi } from 'vitest';
import { EmailPreview } from './BroadcastPreview';

const request = vi.hoisted(() =>
  vi.fn(async () => ({
    subject: 'Preview subject',
    body_html: '<main>Operator wrapper and content</main>',
  })),
);
vi.mock('../../api/adminBroadcasts', () => ({ adminBroadcastsApi: { renderEmail: request } }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'ru' } }),
}));
afterEach(cleanup);

it('previews the backend-rendered email inside a sandboxed frame', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <EmailPreview
        open
        onClose={() => {}}
        subject="Preview subject"
        htmlContent="<p>Content</p>"
      />
    </QueryClientProvider>,
  );
  const frame = screen.getByTitle('email preview');
  await waitFor(() => expect(frame.getAttribute('srcdoc')).toContain('Operator wrapper'));
  expect(request).toHaveBeenCalledWith({
    subject: 'Preview subject',
    html_content: '<p>Content</p>',
    language: 'ru',
  });
  expect(frame.getAttribute('sandbox')).toBe('');
});
