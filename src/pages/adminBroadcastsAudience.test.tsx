// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlatformProvider } from '@/platform/PlatformProvider';

const { api } = vi.hoisted(() => ({
  api: {
    list: vi.fn(),
    getFilters: vi.fn(),
    getEmailFilters: vi.fn(),
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      key === 'admin.broadcasts.singleUser' ? `Only ${options?.name}` : key,
  }),
}));
vi.mock('@/api/adminBroadcasts', () => ({ adminBroadcastsApi: api }));

import AdminBroadcasts from './AdminBroadcasts';

const broadcast = (id: number, target_type: string) => ({
  id,
  target_type,
  message_text: `message-${id}`,
  has_media: false,
  media_type: null,
  media_file_id: null,
  media_caption: null,
  total_count: 1,
  sent_count: 1,
  failed_count: 0,
  blocked_count: 0,
  status: 'completed',
  admin_id: null,
  admin_name: null,
  created_at: '2026-09-24T12:00:00Z',
  completed_at: '2026-09-24T12:00:01Z',
  progress_percent: 100,
});

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <PlatformProvider>
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <AdminBroadcasts />
        </MemoryRouter>
      </QueryClientProvider>
    </PlatformProvider>,
  );
}

describe('AdminBroadcasts audience labels', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('shows promo-group and direct-user labels instead of raw target keys', async () => {
    api.list.mockResolvedValue({
      items: [broadcast(1, 'promo_group_7'), broadcast(2, 'user_42')],
      total: 2,
      limit: 20,
      offset: 0,
    });
    api.getEmailFilters.mockResolvedValue({
      filters: [],
      promo_group_filters: [
        { key: 'promo_group_7', label: 'VIP promo group', count: 12, group: 'promo_group' },
      ],
    });
    api.getFilters.mockResolvedValue({ filters: [], tariff_filters: [], custom_filters: [] });

    renderPage();

    expect(await screen.findByText('VIP promo group')).toBeTruthy();
    expect(screen.getByText('Only #42')).toBeTruthy();
    expect(screen.queryByText('promo_group_7')).toBeNull();
    expect(screen.queryByText('user_42')).toBeNull();
  });
});
