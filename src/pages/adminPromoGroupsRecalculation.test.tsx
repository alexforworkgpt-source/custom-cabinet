// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ruLocale from '@/locales/ru.json';
import { PlatformProvider } from '@/platform/PlatformProvider';
import { usePermissionStore } from '@/store/permissions';

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
  }),
}));

vi.mock('./adminPromoGroups/recalculationConfig', () => ({
  RECALCULATION_POLL_MS: 10,
  RECALCULATION_MAX_POLLS: 3,
}));

type Status = {
  running: boolean;
  queued: boolean;
  reason: string | null;
  started: boolean;
  last: {
    reason: string;
    checked: number;
    changed: number;
    failed: number;
    started_at: string | null;
    finished_at: string | null;
    error: string | null;
  } | null;
};

const idle: Status = {
  running: false,
  queued: false,
  reason: null,
  started: false,
  last: null,
};

const api = vi.hoisted(() => ({
  listCalls: 0,
  startCalls: 0,
  statusCalls: 0,
  statuses: [] as Status[],
  startStatus: null as Status | null,
}));

vi.mock('@/api/promocodes', () => ({
  promocodesApi: {
    getPromoGroups: () => {
      api.listCalls += 1;
      return Promise.resolve({
        items: [
          {
            id: 1,
            name: 'Путник',
            server_discount_percent: 0,
            traffic_discount_percent: 0,
            device_discount_percent: 0,
            period_discounts: {},
            auto_assign_total_spent_kopeks: null,
            apply_discounts_to_addons: true,
            is_default: true,
            members_count: 5913,
            created_at: null,
            updated_at: null,
          },
        ],
        total: 1,
        limit: 100,
        offset: 0,
      });
    },
    getPromoGroupRecalculation: () => {
      api.statusCalls += 1;
      const next = api.statuses.length > 1 ? api.statuses.shift() : api.statuses[0];
      return Promise.resolve(next ?? idle);
    },
    recalculatePromoGroups: () => {
      api.startCalls += 1;
      return Promise.resolve(api.startStatus ?? idle);
    },
    deletePromoGroup: () => Promise.resolve(),
  },
}));

import AdminPromoGroups from './AdminPromoGroups';

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <PlatformProvider>
      <QueryClientProvider client={client}>
        <MemoryRouter>
          <AdminPromoGroups />
        </MemoryRouter>
      </QueryClientProvider>
    </PlatformProvider>,
  );
}

beforeEach(() => {
  api.listCalls = 0;
  api.startCalls = 0;
  api.statusCalls = 0;
  api.statuses = [idle];
  api.startStatus = null;
  usePermissionStore.setState({
    permissions: ['promo_groups:read', 'promo_groups:edit'],
    roles: [],
    roleLevel: 10,
    isLoaded: true,
  });
});

afterEach(cleanup);

describe('AdminPromoGroups recalculation', () => {
  it('shows queued work, polls through completion, refreshes member counts and keeps the last result visible', async () => {
    const queued = { ...idle, running: true, queued: true, reason: 'started from cabinet' };
    const finished = {
      ...idle,
      last: {
        reason: 'started from cabinet',
        checked: 5913,
        changed: 42,
        failed: 0,
        started_at: '2026-09-24T08:00:00Z',
        finished_at: '2026-09-24T08:00:14Z',
        error: null,
      },
    };
    api.statuses = [queued, finished];

    renderPage();

    expect(
      await screen.findByText(resolveRu('admin.promoGroups.recalculationQueued') as string),
    ).toBeTruthy();
    expect(await screen.findByText(/проверено 5913, переназначено 42/i)).toBeTruthy();
    await waitFor(() => expect(api.listCalls).toBeGreaterThanOrEqual(2));
  });

  it('starts a pass only for an editor and exposes a queued response', async () => {
    api.startStatus = { ...idle, running: true, queued: true, reason: 'started from cabinet' };
    api.statuses = [idle];
    renderPage();

    const button = await screen.findByRole('button', {
      name: resolveRu('admin.promoGroups.recalculate') as string,
    });
    await waitFor(() => expect((button as HTMLButtonElement).disabled).toBe(false));
    fireEvent.click(button);

    await waitFor(() => expect(api.startCalls).toBe(1));
    expect(
      await screen.findByText(resolveRu('admin.promoGroups.recalculationQueued') as string),
    ).toBeTruthy();
    cleanup();

    usePermissionStore.setState({
      permissions: ['promo_groups:read'],
      roles: [],
      roleLevel: 10,
      isLoaded: true,
    });
    renderPage();
    await screen.findByText('Путник');
    expect(
      screen.queryByRole('button', {
        name: resolveRu('admin.promoGroups.recalculate') as string,
      }),
    ).toBeNull();
  });

  it('shows a failed last result without starting another pass', async () => {
    api.statuses = [
      {
        ...idle,
        last: {
          reason: 'deleted group',
          checked: 10,
          changed: 0,
          failed: 1,
          started_at: null,
          finished_at: null,
          error: 'database unavailable',
        },
      },
    ];

    renderPage();

    expect(
      await screen.findByText(resolveRu('admin.promoGroups.recalculateFailed') as string),
    ).toBeTruthy();
    expect(api.startCalls).toBe(0);
  });

  it('stops automatic status requests at the configured polling limit', async () => {
    api.statuses = [{ ...idle, running: true, reason: 'started from cabinet' }];
    renderPage();

    expect(
      await screen.findByText(resolveRu('admin.promoGroups.recalculating') as string),
    ).toBeTruthy();
    expect(
      await screen.findByText(resolveRu('admin.promoGroups.recalculatePollLimit') as string),
    ).toBeTruthy();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(api.statusCalls).toBe(3);
  });
});
