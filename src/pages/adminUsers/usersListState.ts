import type { UsersListParams } from '@/api/adminUsers';

export type StatusFilter = '' | 'active' | 'blocked' | 'deleted';
export type SubFilter = '' | 'active' | 'trial' | 'expiring' | 'expired' | 'limited' | 'none';
export type SortKey =
  | 'expires'
  | 'grace'
  | 'activity'
  | 'created'
  | 'balance'
  | 'spent'
  | 'traffic'
  | 'purchases';
export type SortDirection = 'asc' | 'desc';
export type ViewKey = 'all' | 'expiring' | 'grace' | 'traffic' | 'nopay' | 'online' | 'blocked';

export interface UsersListState {
  q: string;
  status: StatusFilter;
  sub: SubFilter;
  tariff: string;
  group: string;
  campaign: string;
  sort: SortKey;
  dir: '' | SortDirection;
  view: ViewKey;
}

export type UsersQuery = UsersListParams;

export const STATUS_FILTERS: readonly StatusFilter[] = ['', 'active', 'blocked', 'deleted'];
export const SUB_FILTERS: readonly SubFilter[] = [
  '',
  'active',
  'trial',
  'expiring',
  'expired',
  'limited',
  'none',
];
export const SORT_KEYS: readonly SortKey[] = [
  'expires',
  'grace',
  'activity',
  'created',
  'balance',
  'spent',
  'traffic',
  'purchases',
];
export const SORT_DIRECTIONS: readonly SortDirection[] = ['asc', 'desc'];
export const VIEW_KEYS: readonly ViewKey[] = [
  'all',
  'expiring',
  'grace',
  'traffic',
  'nopay',
  'online',
  'blocked',
];

export const DEFAULT_STATE: UsersListState = {
  q: '',
  status: '',
  sub: '',
  tariff: '',
  group: '',
  campaign: '',
  sort: 'created',
  dir: '',
  view: 'all',
};

export const EXPIRING_DAYS = 7;
export const TRAFFIC_LOW_PERCENT = 80;

const SORT_TO_API: Record<SortKey, NonNullable<UsersQuery['sort_by']>> = {
  expires: 'subscription_end_date',
  grace: 'grace_until',
  activity: 'last_activity',
  created: 'created_at',
  balance: 'balance',
  spent: 'total_spent',
  traffic: 'traffic',
  purchases: 'purchase_count',
};

const NATURAL_DIRECTION: Record<SortKey, SortDirection> = {
  expires: 'asc',
  grace: 'asc',
  activity: 'desc',
  created: 'desc',
  balance: 'desc',
  spent: 'desc',
  traffic: 'desc',
  purchases: 'desc',
};

const VIEW_PRESETS: Record<ViewKey, Partial<Omit<UsersListState, 'q' | 'view'>>> = {
  all: {},
  expiring: { sub: 'expiring', sort: 'expires' },
  grace: { sort: 'grace' },
  traffic: { sort: 'traffic' },
  nopay: { sort: 'purchases' },
  online: { sort: 'activity' },
  blocked: { status: 'blocked' },
};

export function sortKeysForView(view: ViewKey): readonly SortKey[] {
  return view === 'grace' ? SORT_KEYS : SORT_KEYS.filter((key) => key !== 'grace');
}

export function naturalDirection(sort: SortKey): SortDirection {
  return NATURAL_DIRECTION[sort];
}

export function sortDirection(state: UsersListState): SortDirection {
  return state.dir || NATURAL_DIRECTION[state.sort];
}

export function withSort(
  state: UsersListState,
  sort: SortKey,
  dir: SortDirection = sort === state.sort ? sortDirection(state) : NATURAL_DIRECTION[sort],
): UsersListState {
  return { ...state, sort, dir: dir === NATURAL_DIRECTION[sort] ? '' : dir };
}

function pick<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value !== null && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function applyView(state: UsersListState, view: ViewKey): UsersListState {
  return { ...DEFAULT_STATE, q: state.q, ...VIEW_PRESETS[view], view };
}

export function parseUsersListState(params: URLSearchParams): UsersListState {
  const view = pick(params.get('view'), VIEW_KEYS, DEFAULT_STATE.view);
  const base = applyView(DEFAULT_STATE, view);
  return {
    q: params.get('q') ?? '',
    status: pick(params.get('status'), STATUS_FILTERS, base.status),
    sub: pick(params.get('sub'), SUB_FILTERS, base.sub),
    tariff: params.get('tariff') ?? '',
    group: params.get('group') ?? '',
    campaign: params.get('campaign') ?? '',
    sort: pick(params.get('sort'), sortKeysForView(view), base.sort),
    dir: pick<'' | SortDirection>(params.get('dir'), SORT_DIRECTIONS, base.dir),
    view,
  };
}

export function serializeUsersListState(state: UsersListState): URLSearchParams {
  const out = new URLSearchParams();
  for (const key of Object.keys(DEFAULT_STATE) as (keyof UsersListState)[]) {
    const value = state[key];
    if (value !== DEFAULT_STATE[key] && value !== '') out.set(key, value);
  }
  return out;
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function classifySearch(raw: string): Pick<UsersQuery, 'search' | 'email'> {
  const q = raw.trim();
  if (!q) return {};
  if (q.startsWith('@')) return q.length > 1 ? { search: q.slice(1) } : {};
  if (EMAIL_RE.test(q)) return { email: q };
  return { search: q };
}

export function buildUsersQuery(state: UsersListState): UsersQuery {
  const query: UsersQuery = { ...classifySearch(state.q), sort_by: SORT_TO_API[state.sort] };
  if (state.dir) query.sort_order = state.dir;
  if (state.status) query.status = state.status;
  if (state.sub === 'expiring') {
    query.subscription_status = 'active';
    query.expires_within_days = EXPIRING_DAYS;
  } else if (state.sub === 'none') {
    query.has_subscription = false;
  } else if (state.sub) {
    query.subscription_status = state.sub;
  }
  if (state.tariff) query.tariff_id = state.tariff;
  if (state.group) query.promo_group_id = Number(state.group);
  if (state.campaign) query.campaign_id = Number(state.campaign);
  if (state.view === 'online') query.online = true;
  if (state.view === 'grace') query.in_grace = true;
  if (state.view === 'nopay') query.purchase_count = 0;
  if (state.view === 'traffic') query.traffic_used_percent_min = TRAFFIC_LOW_PERCENT;
  return query;
}

export function hasActiveFilters(state: UsersListState): boolean {
  return Boolean(
    state.q ||
      state.status ||
      state.sub ||
      state.tariff ||
      state.group ||
      state.campaign ||
      state.view !== 'all',
  );
}
