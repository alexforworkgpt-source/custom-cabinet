// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { UserListItem } from '@/api/adminUsers';
import { PlatformProvider } from '@/platform/PlatformProvider';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ru' },
  }),
}));

vi.mock('../hooks/useCurrency', () => ({
  useCurrency: () => ({ formatWithCurrency: (amount: number) => `${amount} ₽` }),
}));

const getUsers = vi.fn();
vi.mock('@/api/adminUsers', () => ({
  adminUsersApi: {
    getUsers: (params: unknown) => getUsers(params),
    getStats: () =>
      Promise.resolve({
        total_users: 120,
        active_users: 100,
        users_with_active_subscription: 60,
        new_today: 3,
        blocked_users: 2,
        deleted_users: 1,
      }),
  },
}));
vi.mock('@/api/promocodes', () => ({
  promocodesApi: {
    getPromoGroups: () => Promise.resolve({ items: [], total: 0, limit: 100, offset: 0 }),
  },
}));
vi.mock('@/api/campaigns', () => ({
  campaignsApi: { getCampaigns: () => Promise.resolve({ campaigns: [], total: 0 }) },
}));
vi.mock('@/api/tariffs', () => ({
  tariffsApi: { getTariffs: () => Promise.resolve({ tariffs: [], total: 0 }) },
}));

const user = (id: number, extra: Partial<UserListItem> = {}): UserListItem => ({
  id,
  telegram_id: 1000 + id,
  username: `u${id}`,
  first_name: `Имя${id}`,
  last_name: null,
  full_name: `Имя${id}`,
  status: 'active',
  balance_kopeks: 0,
  balance_rubles: 0,
  created_at: '2026-08-01T00:00:00Z',
  last_activity: new Date().toISOString(),
  has_subscription: true,
  subscription_status: 'active',
  subscription_is_trial: false,
  subscription_end_date: '2026-10-01T00:00:00Z',
  tariff_id: 3,
  tariff_name: 'Командный',
  traffic_used_gb: 10,
  traffic_limit_gb: 100,
  device_limit: 3,
  days_remaining: 17,
  promo_group_id: null,
  promo_group_name: null,
  total_spent_kopeks: 0,
  purchase_count: 0,
  has_restrictions: false,
  restriction_topup: false,
  restriction_subscription: false,
  ...extra,
});

const page = (users: UserListItem[], total: number, offset = 0) => ({
  users,
  total,
  offset,
  limit: 50,
});

let observerCallback: IntersectionObserverCallback | null = null;
let lastSearch = '';

function LocationProbe() {
  lastSearch = useLocation().search;
  return null;
}

beforeEach(() => {
  getUsers.mockReset();
  observerCallback = null;
  window.localStorage.clear();
  (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver = class {
    constructor(callback: IntersectionObserverCallback) {
      observerCallback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof IntersectionObserver;
});

afterEach(cleanup);

async function renderPage(initial = '/admin/users') {
  const AdminUsers = (await import('./AdminUsers')).default;
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <PlatformProvider>
        <MemoryRouter initialEntries={[initial]}>
          <LocationProbe />
          <Routes>
            <Route path="/admin/users" element={<AdminUsers />} />
          </Routes>
        </MemoryRouter>
      </PlatformProvider>
    </QueryClientProvider>,
  );
}

describe('AdminUsers v1.79 behavior', () => {
  it('reads list state from URL and sends it to the API', async () => {
    getUsers.mockResolvedValue(page([user(1)], 1));
    await renderPage('/admin/users?q=%40olga&sub=expired&sort=balance&dir=asc');

    await waitFor(() =>
      expect(getUsers).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'olga',
          subscription_status: 'expired',
          sort_by: 'balance',
          sort_order: 'asc',
          offset: 0,
          limit: 50,
        }),
      ),
    );
  });

  it('uses one search field for email and stores it in URL on Enter', async () => {
    getUsers.mockResolvedValue(page([], 0));
    await renderPage();

    const input = screen.getByRole('searchbox');
    fireEvent.change(input, { target: { value: 'a@b.cc' } });
    fireEvent.keyDown(input, { key: 'Enter' });

    await waitFor(() => expect(lastSearch).toContain('q=a%40b.cc'));
    await waitFor(() =>
      expect(getUsers).toHaveBeenLastCalledWith(expect.objectContaining({ email: 'a@b.cc' })),
    );
  });

  it('loads the next chunk without replacing already visible users', async () => {
    getUsers
      .mockResolvedValueOnce(
        page(
          Array.from({ length: 50 }, (_, index) => user(index + 1)),
          60,
        ),
      )
      .mockResolvedValueOnce(
        page(
          Array.from({ length: 10 }, (_, index) => user(index + 51)),
          60,
          50,
        ),
      );
    await renderPage();
    await screen.findByText('Имя50');
    await waitFor(() => expect(observerCallback).not.toBeNull());

    observerCallback?.(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    );

    expect(await screen.findByText('Имя60')).toBeTruthy();
    expect(screen.getByText('Имя1')).toBeTruthy();
    expect(getUsers.mock.calls[1][0]).toMatchObject({ offset: 50 });
  });

  it('marks grace, tariff count and only a fresh VPN online timestamp', async () => {
    getUsers.mockResolvedValue(
      page(
        [
          user(1, {
            online_at: new Date(Date.now() - 5_000).toISOString(),
            grace_until: '2026-10-02T00:00:00Z',
            subscriptions: [
              { id: 1, tariff_name: 'A' },
              { id: 2, tariff_name: 'B' },
            ] as UserListItem['subscriptions'],
          }),
          user(2, { online_at: new Date(Date.now() - 120_000).toISOString() }),
        ],
        2,
      ),
    );
    await renderPage();

    await screen.findByText('Имя1');
    expect(screen.getByText('admin.users.connectedNow')).toBeTruthy();
    expect(screen.getByText('admin.users.subscriptionChips.graceUntil')).toBeTruthy();
    expect(screen.getByText('admin.users.moreTariffs')).toBeTruthy();
  });
});
