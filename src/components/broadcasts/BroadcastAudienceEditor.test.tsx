// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { PlatformProvider } from '@/platform/PlatformProvider';
import { usePermissionStore } from '@/store/permissions';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, fallback?: string) => fallback ?? key }),
}));
const api = vi.hoisted(() => ({ previewAudience: vi.fn(), searchAudienceUsers: vi.fn() }));
vi.mock('../../api/adminBroadcasts', () => ({ adminBroadcastsApi: api }));
import { BroadcastAudienceEditor } from './BroadcastAudienceEditor';

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

it('shows the server audience count without exposing people when users:read is absent', async () => {
  usePermissionStore.setState({
    permissions: ['broadcasts:read'],
    isLoaded: true,
    roles: [],
    roleLevel: 0,
  });
  api.previewAudience.mockResolvedValue({ count: 12, offset: 0, limit: 50, users: [] });
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <PlatformProvider>
        <MemoryRouter>
          <BroadcastAudienceEditor
            channel="telegram"
            category="system"
            audience={{
              conditions: [{ field: 'basic', value: 'all', operator: 'eq', join: null }],
            }}
            onChange={() => {}}
            filters={[]}
            isLoading={false}
          />
        </MemoryRouter>
      </PlatformProvider>
    </QueryClientProvider>,
  );
  expect(await screen.findByText('12')).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Посмотреть список' })).toBeNull();
  expect(api.searchAudienceUsers).not.toHaveBeenCalled();
});
