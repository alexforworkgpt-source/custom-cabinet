// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import AdminUsers from './AdminUsers';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('../hooks/useCurrency', () => ({
  useCurrency: () => ({ formatWithCurrency: (value: number) => String(value) }),
}));

vi.mock('../platform/hooks/usePlatform', () => ({
  usePlatform: () => ({ capabilities: { hasBackButton: true } }),
}));

vi.mock('../api/adminUsers', () => ({
  adminUsersApi: {
    getUsers: () => Promise.resolve({ users: [], total: 0, offset: 0, limit: 20 }),
    getStats: () =>
      Promise.resolve({
        total_users: 100,
        active_users: 70,
        blocked_users: 16,
        deleted_users: 14,
        new_today: 2,
        new_week: 5,
        new_month: 10,
        users_with_subscription: 50,
        users_with_active_subscription: 45,
        users_with_trial: 3,
        users_with_expired_subscription: 2,
        total_balance_kopeks: 0,
        total_balance_rubles: 0,
        avg_balance_kopeks: 0,
        active_today: 20,
        active_week: 40,
      }),
  },
}));

afterEach(cleanup);

describe('сводка пользователей', () => {
  it('показывает удалённых отдельно от заблокированных', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });

    render(
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <AdminUsers />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const deletedLabel = await screen.findByText('admin.users.stats.deleted');
    expect(deletedLabel.parentElement?.parentElement?.textContent).toContain('14');
  });
});
