import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SearchIcon } from '@/components/icons';
import {
  type SortDirection,
  type SortKey,
  type StatusFilter,
  type SubFilter,
  type UsersListState,
  type ViewKey,
  applyView,
  naturalDirection,
  sortDirection,
  sortKeysForView,
  withSort,
} from '@/pages/adminUsers/usersListState';

export interface FilterOption {
  value: string;
  label: string;
}

export interface AdminUsersFilterOptions {
  tariffs: FilterOption[];
  groups: FilterOption[];
  campaigns: FilterOption[];
}

interface Props {
  state: UsersListState;
  onChange: (next: UsersListState) => void;
  options: AdminUsersFilterOptions;
}

const VIEWS: readonly ViewKey[] = [
  'all',
  'expiring',
  'grace',
  'traffic',
  'nopay',
  'online',
  'blocked',
];

export function AdminUsersToolbar({ state, onChange, options }: Props) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(state.q);

  useEffect(() => setDraft(state.q), [state.q]);

  const chips = [
    state.status && state.view !== 'blocked'
      ? { key: 'status', label: t(`admin.users.statuses.${state.status}`) }
      : null,
    state.sub && state.view !== 'expiring'
      ? { key: 'sub', label: t(`admin.users.subFilters.${state.sub}`) }
      : null,
    state.tariff ? { key: 'tariff', label: state.tariff } : null,
    state.group ? { key: 'group', label: state.group } : null,
    state.campaign ? { key: 'campaign', label: state.campaign } : null,
  ].filter(Boolean) as { key: 'status' | 'sub' | 'tariff' | 'group' | 'campaign'; label: string }[];

  const selectClass =
    'rounded-xl border border-dark-700 bg-dark-800 px-3 py-2 text-sm text-dark-100 focus:border-dark-600 focus:outline-none';

  return (
    <div className="space-y-3">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          onChange({ ...state, q: draft });
        }}
        className="relative"
      >
        <input
          type="search"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter') return;
            event.preventDefault();
            onChange({ ...state, q: draft });
          }}
          placeholder={t('admin.users.search')}
          className="w-full rounded-xl border border-dark-700 bg-dark-800 py-2.5 pl-10 pr-4 text-dark-100 placeholder-dark-500 focus:border-dark-600 focus:outline-none"
        />
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
      </form>

      <div
        role="radiogroup"
        aria-label={t('admin.users.viewsLabel')}
        className="scrollbar-hide -mx-1 flex gap-2 overflow-x-auto px-1"
      >
        {VIEWS.map((view) => (
          <button
            key={view}
            type="button"
            role="radio"
            aria-checked={state.view === view}
            onClick={() => onChange(applyView(state, view))}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-sm transition-colors ${
              state.view === view
                ? 'border-accent-500/40 bg-accent-500/15 text-accent-400'
                : 'border-dark-700 bg-dark-800 text-dark-400 hover:text-dark-200'
            }`}
          >
            {t(`admin.users.views.${view}`, { days: 7 })}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
        <select
          aria-label={t('admin.users.filterLabels.status')}
          value={state.status}
          onChange={(event) =>
            onChange({ ...state, status: event.target.value as StatusFilter, view: 'all' })
          }
          className={selectClass}
        >
          <option value="">{t('admin.users.filterAny.status')}</option>
          <option value="active">{t('admin.users.statuses.active')}</option>
          <option value="blocked">{t('admin.users.statuses.blocked')}</option>
          <option value="deleted">{t('admin.users.statuses.deleted')}</option>
        </select>
        <select
          aria-label={t('admin.users.filterLabels.sub')}
          value={state.sub}
          onChange={(event) =>
            onChange({ ...state, sub: event.target.value as SubFilter, view: 'all' })
          }
          className={selectClass}
        >
          <option value="">{t('admin.users.filterAny.sub')}</option>
          {['active', 'trial', 'expiring', 'expired', 'limited', 'none'].map((value) => (
            <option key={value} value={value}>
              {t(`admin.users.subFilters.${value}`)}
            </option>
          ))}
        </select>
        <select
          aria-label={t('admin.users.filterLabels.tariff')}
          value={state.tariff}
          onChange={(event) => onChange({ ...state, tariff: event.target.value, view: 'all' })}
          className={selectClass}
        >
          <option value="">{t('admin.users.filterAny.tariff')}</option>
          {options.tariffs.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          aria-label={t('admin.users.filterLabels.group')}
          value={state.group}
          onChange={(event) => onChange({ ...state, group: event.target.value, view: 'all' })}
          className={selectClass}
        >
          <option value="">{t('admin.users.filterAny.group')}</option>
          {options.groups.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          aria-label={t('admin.users.filterLabels.campaign')}
          value={state.campaign}
          onChange={(event) => onChange({ ...state, campaign: event.target.value, view: 'all' })}
          className={selectClass}
        >
          <option value="">{t('admin.users.filterAny.campaign')}</option>
          {options.campaigns.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          aria-label={t('admin.users.sort.label')}
          value={state.sort}
          onChange={(event) => onChange(withSort(state, event.target.value as SortKey))}
          className={selectClass}
        >
          {sortKeysForView(state.view).map((key) => (
            <option key={key} value={key}>
              {t(`admin.users.sort.${key}.${sortDirection({ ...state, sort: key, dir: '' })}`)}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => {
            const next: SortDirection = sortDirection(state) === 'asc' ? 'desc' : 'asc';
            onChange(withSort(state, state.sort, next));
          }}
          className={`${selectClass} text-left`}
        >
          {t(`admin.users.sort.${state.sort}.${sortDirection(state)}`)}
          {sortDirection(state) === naturalDirection(state.sort) ? '' : ' ↕'}
        </button>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              aria-label={t('admin.users.filters.remove', { name: chip.label })}
              onClick={() => onChange({ ...state, [chip.key]: '' })}
              className="rounded-full border border-accent-500/30 bg-accent-500/10 px-3 py-1 text-xs text-accent-400"
            >
              {chip.label} ×
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
