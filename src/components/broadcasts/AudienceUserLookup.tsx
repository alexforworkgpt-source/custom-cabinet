import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { usePermissionStore } from '../../store/permissions';
import { adminBroadcastsApi, type BroadcastAudienceCondition } from '../../api/adminBroadcasts';
import type { UserField } from './audience';

export function AudienceUserLookup({
  field,
  condition,
  onSelect,
  rowIndex,
}: {
  field: UserField;
  condition: BroadcastAudienceCondition;
  onSelect: (value: string, label: string | null) => void;
  rowIndex: number;
}) {
  const { t } = useTranslation();
  // Поиск выгружает людей из базы — сервер требует users:read (у роли Marketer его нет).
  const canSearch = usePermissionStore((state) => state.hasPermission('users:read'));
  const [text, setText] = useState(condition.label || '');
  const [query, setQuery] = useState('');
  const [offset, setOffset] = useState(0);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(text.trim()), 250);
    return () => window.clearTimeout(timer);
  }, [text]);
  const searchReady = query === text.trim();
  const results = useQuery({
    queryKey: ['admin', 'broadcasts', 'audience-users', field, query, offset],
    queryFn: () => adminBroadcastsApi.searchAudienceUsers({ field, q: query, offset }),
    enabled: canSearch && open && !condition.value && query.length > 0 && searchReady,
  });
  const users = searchReady ? results.data?.users || [] : [];
  const describe = (user: (typeof users)[number]) =>
    [
      user.username ? `@${user.username.replace(/^@/, '')}` : null,
      user.telegram_id ? String(user.telegram_id) : null,
      user.email,
      [user.first_name, user.last_name].filter(Boolean).join(' '),
    ]
      .filter(Boolean)
      .join(' · ')
      .slice(0, 512) || `#${user.id}`;
  return (
    <div
      className="relative min-w-0"
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <input
        type="text"
        className="input w-full min-w-0"
        role="combobox"
        aria-label={
          field === 'telegram_id'
            ? 'Telegram ID'
            : field === 'telegram_username'
              ? t('admin.broadcasts.atomic.telegramUsername', 'Ник Telegram')
              : 'Email'
        }
        aria-expanded={open && !condition.value}
        aria-controls={`audience-users-${field}-${rowIndex}`}
        aria-autocomplete="list"
        aria-activedescendant={
          open && users[highlight]
            ? `audience-user-${field}-${rowIndex}-${users[highlight].id}`
            : undefined
        }
        placeholder={
          canSearch
            ? t('admin.broadcasts.atomic.searchUser', 'Начните вводить и выберите пользователя')
            : t(
                'admin.broadcasts.audience.noUsersPermission',
                'Нужно право на просмотр пользователей',
              )
        }
        disabled={!canSearch && !condition.value}
        value={text}
        onFocus={() => setOpen(!condition.value)}
        onChange={(event) => {
          setText(event.target.value);
          setOffset(0);
          setHighlight(0);
          setOpen(true);
          onSelect('', null);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') setOpen(false);
          if (event.key === 'ArrowDown' && users.length) {
            event.preventDefault();
            setHighlight((current) => Math.min(current + 1, users.length - 1));
          }
          if (event.key === 'ArrowUp' && users.length) {
            event.preventDefault();
            setHighlight((current) => Math.max(current - 1, 0));
          }
          if (event.key === 'Enter' && open && users[highlight]) {
            event.preventDefault();
            const user = users[highlight];
            const label = describe(user);
            setText(label);
            setOpen(false);
            onSelect(String(user.id), label);
          }
        }}
      />
      {canSearch && open && !condition.value && query && searchReady && (
        <div
          id={`audience-users-${field}-${rowIndex}`}
          role="listbox"
          className="absolute z-50 mt-1 max-h-64 w-full min-w-64 overflow-y-auto rounded-lg border border-dark-600 bg-dark-800 p-1 shadow-xl"
        >
          {results.isPending && (
            <p className="px-2 py-1 text-sm text-dark-400">{t('common.loading', 'Загрузка...')}</p>
          )}
          {results.isError && (
            <p className="px-2 py-1 text-sm text-error-400">
              {t('admin.broadcasts.audience.loadError', 'Ошибка поиска')}
            </p>
          )}
          {results.data && users.length === 0 && (
            <p className="px-2 py-1 text-sm text-dark-400">
              {t('admin.broadcasts.atomic.noUsers', 'Пользователи не найдены')}
            </p>
          )}
          {users.map((user, index) => (
            <button
              key={user.id}
              id={`audience-user-${field}-${rowIndex}-${user.id}`}
              type="button"
              role="option"
              aria-selected={highlight === index}
              className={`block min-h-11 w-full rounded px-2 py-1 text-left text-sm text-dark-100 hover:bg-dark-700 ${highlight === index ? 'bg-dark-700' : ''}`}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                const label = describe(user);
                setText(label);
                setOpen(false);
                onSelect(String(user.id), label);
              }}
            >
              {describe(user)}
            </button>
          ))}
          {results.data && results.data.count > 20 && (
            <div className="flex items-center justify-between gap-2 border-t border-dark-700 px-2 py-1 text-xs text-dark-400">
              <button
                type="button"
                disabled={offset === 0}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setOffset(Math.max(0, offset - 20));
                  setHighlight(0);
                }}
                className="disabled:opacity-40"
              >
                {t('admin.broadcasts.prev', 'Назад')}
              </button>
              <span>
                {offset + 1}–{Math.min(offset + 20, results.data.count)} / {results.data.count}
              </span>
              <button
                type="button"
                disabled={offset + 20 >= results.data.count}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  setOffset(offset + 20);
                  setHighlight(0);
                }}
                className="disabled:opacity-40"
              >
                {t('admin.broadcasts.next', 'Далее')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
