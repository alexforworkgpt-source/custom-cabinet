import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminGraceAccessApi, type GraceSessionFilter } from '@/api/adminGraceAccess';
import { Skeleton } from '@/components/ui/skeleton';

const SESSION_FILTERS: GraceSessionFilter[] = [
  'open',
  'pending',
  'active',
  'restoring',
  'completed',
  'errors',
];

export function SessionsSection() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<GraceSessionFilter>('open');
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['grace-sessions', filter, page],
    queryFn: () => adminGraceAccessApi.getSessions({ state: filter, page, limit: 20 }),
  });

  const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-dark-100">
        {t('admin.graceAccess.sessions.title')}
      </h3>
      <p className="mt-1 text-sm text-dark-500">{t('admin.graceAccess.sessions.hint')}</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {SESSION_FILTERS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setFilter(value);
              setPage(1);
            }}
            aria-pressed={filter === value}
            className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
              filter === value
                ? 'border-accent-500/50 bg-accent-500/10 text-dark-100'
                : 'border-dark-700/40 bg-dark-800/30 text-dark-300 hover:border-dark-600'
            }`}
          >
            {t(`admin.graceAccess.sessions.filter.${value}`)}
          </button>
        ))}
      </div>

      {isLoading && <Skeleton variant="card" className="mt-4 h-40" />}
      {error && (
        <p className="mt-4 text-sm text-error-400">
          {/* Список — это люди, поэтому он требует ещё и users:read. Без него
              «не удалось загрузить» звучит как поломка, а не как право. */}
          {(error as { response?: { status?: number } })?.response?.status === 403
            ? t('admin.graceAccess.sessions.forbidden')
            : t('admin.graceAccess.sessions.loadError')}
        </p>
      )}

      {data && data.items.length === 0 && (
        <p className="mt-4 text-sm text-dark-400">{t('admin.graceAccess.sessions.empty')}</p>
      )}

      {data && data.items.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-dark-500">
                <th className="pb-2 pr-3 font-medium">{t('admin.graceAccess.sessions.user')}</th>
                <th className="pb-2 pr-3 font-medium">{t('admin.graceAccess.sessions.reason')}</th>
                <th className="pb-2 pr-3 font-medium">{t('admin.graceAccess.sessions.state')}</th>
                <th className="pb-2 pr-3 font-medium">{t('admin.graceAccess.sessions.until')}</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((session) => (
                <tr key={session.id} className="border-t border-dark-700/40 align-top">
                  <td className="py-2 pr-3">
                    <div className="text-dark-100">
                      {session.user?.full_name || `#${session.subscription_id}`}
                    </div>
                    <div className="text-xs text-dark-500">
                      {session.user?.username
                        ? `@${session.user.username}`
                        : session.user?.telegram_id}
                    </div>
                  </td>
                  <td className="py-2 pr-3 text-dark-300">
                    {t(`admin.graceAccess.sessions.reasons.${session.reason}`, {
                      defaultValue: session.reason,
                    })}
                  </td>
                  <td className="py-2 pr-3">
                    <div className="text-dark-200">
                      {t(`admin.graceAccess.sessions.states.${session.state}`, {
                        defaultValue: session.state,
                      })}
                    </div>
                    {session.completion_reason && (
                      <div className="text-xs text-dark-500">
                        {t(`admin.graceAccess.sessions.completion.${session.completion_reason}`, {
                          defaultValue: session.completion_reason,
                        })}
                      </div>
                    )}
                    {session.last_error && (
                      <div className="mt-1 text-xs text-error-400">{session.last_error}</div>
                    )}
                  </td>
                  <td className="py-2 pr-3 text-dark-300">
                    {new Date(session.grace_until).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {data && pages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            className="btn-secondary"
            disabled={page <= 1}
            onClick={() => setPage((current) => current - 1)}
          >
            {t('common.back')}
          </button>
          <span className="text-dark-400">
            {page} / {pages}
          </span>
          <button
            type="button"
            className="btn-secondary"
            disabled={page >= pages}
            onClick={() => setPage((current) => current + 1)}
          >
            {t('common.next')}
          </button>
        </div>
      )}
    </div>
  );
}
