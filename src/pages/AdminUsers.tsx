import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { campaignsApi } from '@/api/campaigns';
import { promocodesApi } from '@/api/promocodes';
import { tariffsApi } from '@/api/tariffs';
import { adminUsersApi } from '@/api/adminUsers';
import { AdminBackButton } from '@/components/admin';
import { AdminUserRow } from '@/components/admin/users/AdminUserRow';
import {
  type AdminUsersFilterOptions,
  AdminUsersToolbar,
} from '@/components/admin/users/AdminUsersToolbar';
import { ONLINE_TICK_MS } from '@/components/admin/users/online';
import { useInfiniteScroll } from '@/components/admin/users/useInfiniteScroll';
import {
  BanIcon,
  CheckCircleIcon,
  ChevronRightIcon,
  RefreshIcon,
  SubscriptionIcon,
  TrashIcon,
  UserPlusIcon,
  UsersIcon,
} from '@/components/icons';
import { StatCard } from '@/components/stats';
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton';
import { useCurrency } from '@/hooks/useCurrency';
import { useNow } from '@/hooks/useNow';
import { safeLocal, safeSession } from '@/utils/safeStorage';
import {
  type UsersListState,
  buildUsersQuery,
  hasActiveFilters,
  parseUsersListState,
  serializeUsersListState,
} from './adminUsers/usersListState';

export const PAGE_SIZE = 50;
const LAST_VIEW_KEY = 'admin-users:last-view';
const SCROLL_KEY_PREFIX = 'admin-users:scroll:';
const OPTIONS_STALE_MS = 5 * 60_000;

export default function AdminUsers() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { formatWithCurrency } = useCurrency();
  const [params, setParams] = useSearchParams();
  const state = useMemo(() => parseUsersListState(params), [params]);
  const now = useNow(ONLINE_TICK_MS);

  const restoredView = useRef(false);
  useEffect(() => {
    if (restoredView.current) return;
    restoredView.current = true;
    if (params.toString()) return;
    const saved = safeLocal.getItem(LAST_VIEW_KEY);
    if (saved) setParams(new URLSearchParams(saved), { replace: true });
  }, [params, setParams]);

  const updateState = useCallback(
    (next: UsersListState) => {
      const serialized = serializeUsersListState(next);
      safeLocal.setItem(LAST_VIEW_KEY, serialized.toString());
      setParams(serialized, { replace: true });
    },
    [setParams],
  );

  const query = useMemo(() => buildUsersQuery(state), [state]);
  const usersQuery = useInfiniteQuery({
    queryKey: ['admin-users', query] as const,
    queryFn: ({ pageParam }) =>
      adminUsersApi.getUsers({ ...query, offset: pageParam, limit: PAGE_SIZE }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.users.length, 0);
      return lastPage.users.length > 0 && loaded < lastPage.total ? loaded : undefined;
    },
  });
  const users = useMemo(
    () => usersQuery.data?.pages.flatMap((page) => page.users) ?? [],
    [usersQuery.data],
  );
  const pages = usersQuery.data?.pages ?? [];
  const total = pages.length > 0 ? pages[pages.length - 1].total : 0;

  const statsQuery = useQuery({
    queryKey: ['admin-users-stats'] as const,
    queryFn: () => adminUsersApi.getStats(),
  });
  const tariffsQuery = useQuery({
    queryKey: ['admin-users-filter-tariffs'] as const,
    queryFn: () => tariffsApi.getTariffs(true),
    staleTime: OPTIONS_STALE_MS,
  });
  const groupsQuery = useQuery({
    queryKey: ['admin-users-filter-groups'] as const,
    queryFn: () => promocodesApi.getPromoGroups({ limit: 100 }),
    staleTime: OPTIONS_STALE_MS,
  });
  const campaignsQuery = useQuery({
    queryKey: ['admin-users-filter-campaigns'] as const,
    queryFn: () => campaignsApi.getCampaigns(true, 0, 100),
    staleTime: OPTIONS_STALE_MS,
  });
  const options = useMemo<AdminUsersFilterOptions>(
    () => ({
      tariffs: (tariffsQuery.data?.tariffs ?? []).map((item) => ({
        value: String(item.id),
        label: item.name,
      })),
      groups: (groupsQuery.data?.items ?? []).map((item) => ({
        value: String(item.id),
        label: item.name,
      })),
      campaigns: (campaignsQuery.data?.campaigns ?? []).map((item) => ({
        value: String(item.id),
        label: item.name,
      })),
    }),
    [tariffsQuery.data, groupsQuery.data, campaignsQuery.data],
  );

  const loadNext = useCallback(() => {
    if (usersQuery.hasNextPage && !usersQuery.isFetchingNextPage) usersQuery.fetchNextPage();
  }, [usersQuery]);
  const sentinelRef = useInfiniteScroll(
    loadNext,
    Boolean(usersQuery.hasNextPage) && !usersQuery.isFetchingNextPage,
  );

  const listKey = serializeUsersListState(state).toString();
  const restoredScroll = useRef<string | null>(null);
  useEffect(() => {
    if (!usersQuery.isSuccess || restoredScroll.current === listKey) return;
    restoredScroll.current = listKey;
    const saved = Number(safeSession.getItem(`${SCROLL_KEY_PREFIX}${listKey}`));
    if (Number.isFinite(saved) && saved > 0) requestAnimationFrame(() => window.scrollTo(0, saved));
  }, [listKey, usersQuery.isSuccess]);
  useEffect(
    () => () => {
      safeSession.setItem(`${SCROLL_KEY_PREFIX}${listKey}`, String(window.scrollY));
    },
    [listKey],
  );

  const [showToTop, setShowToTop] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowToTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const stats = statsQuery.data;
  const openUser = (id: number) => {
    safeSession.setItem(`${SCROLL_KEY_PREFIX}${listKey}`, String(window.scrollY));
    navigate(`/admin/users/${id}`);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AdminBackButton to="/admin" />
          <div>
            <h1 className="text-xl font-bold text-dark-100">{t('admin.users.title')}</h1>
            <p className="text-sm text-dark-400">{t('admin.users.subtitle')}</p>
          </div>
        </div>
        <button
          type="button"
          aria-label={t('common.refresh')}
          onClick={() => {
            usersQuery.refetch();
            statsQuery.refetch();
          }}
          className="rounded-lg p-2 transition-colors hover:bg-dark-700"
        >
          <RefreshIcon className={usersQuery.isFetching ? 'animate-spin' : ''} />
        </button>
      </div>

      {stats && (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatCard
            label={t('admin.users.stats.total')}
            value={stats.total_users}
            icon={<UsersIcon />}
            tone="accent"
          />
          <StatCard
            label={t('admin.users.stats.active')}
            value={stats.active_users}
            icon={<CheckCircleIcon />}
            tone="success"
          />
          <StatCard
            label={t('admin.users.stats.withSubscription')}
            value={stats.users_with_active_subscription}
            icon={<SubscriptionIcon />}
            tone="accent"
          />
          <StatCard
            label={t('admin.users.stats.newToday')}
            value={stats.new_today}
            icon={<UserPlusIcon />}
            tone="warning"
          />
          <StatCard
            label={t('admin.users.stats.blocked')}
            value={stats.blocked_users}
            icon={<BanIcon />}
            tone="error"
          />
          <StatCard
            label={t('admin.users.stats.deleted')}
            value={stats.deleted_users}
            icon={<TrashIcon />}
            tone="neutral"
          />
        </div>
      )}

      <div className="sticky top-0 z-20 -mx-4 mb-4 border-b border-dark-800 bg-dark-950/95 px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:p-0">
        <AdminUsersToolbar state={state} onChange={updateState} options={options} />
      </div>

      <p className="mb-3 text-sm text-dark-400">
        {usersQuery.isLoading
          ? t('common.loading')
          : t('admin.users.shown', { shown: users.length, total })}
      </p>

      <div className="mb-4 space-y-2">
        {usersQuery.isLoading ? (
          <SkeletonGroup className="space-y-3">
            <Skeleton variant="card" count={5} className="h-20" />
          </SkeletonGroup>
        ) : usersQuery.isError ? (
          <div className="rounded-xl border border-error-500/30 bg-error-500/10 p-6 text-center text-error-400">
            {t('admin.users.loadError')}
          </div>
        ) : users.length === 0 ? (
          <div className="rounded-xl border border-dark-700 bg-dark-800/40 py-12 text-center text-dark-400">
            <p>{t('admin.users.noneFound')}</p>
            {hasActiveFilters(state) && (
              <button
                type="button"
                onClick={() => updateState(parseUsersListState(new URLSearchParams()))}
                className="btn-secondary mt-4"
              >
                {t('admin.users.reset')}
              </button>
            )}
          </div>
        ) : (
          users.map((user) => (
            <AdminUserRow
              key={user.id}
              user={user}
              now={now}
              onClick={() => openUser(user.id)}
              formatAmount={formatWithCurrency}
            />
          ))
        )}
      </div>

      {usersQuery.isFetchingNextPage && <Skeleton variant="card" className="h-20" />}
      <div ref={sentinelRef} aria-hidden="true" className="h-px" />
      {!usersQuery.isLoading && !usersQuery.hasNextPage && users.length > 0 && (
        <p className="py-6 text-center text-sm text-dark-500">
          {t('admin.users.endOfList', { count: users.length, total: users.length })}
        </p>
      )}

      {showToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="btn-primary fixed bottom-24 right-4 z-20 md:right-6"
        >
          <ChevronRightIcon className="h-4 w-4 -rotate-90" />
          {t('admin.users.toTop')}
        </button>
      )}
    </div>
  );
}
