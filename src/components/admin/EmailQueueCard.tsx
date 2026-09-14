import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { adminEmailQueueApi, type EmailQueueItem } from '@/api/adminEmailQueue';
import { ClockIcon, TrashIcon, WarningIcon } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { useNotify } from '@/platform';
import { useNativeDialog } from '@/platform/hooks/useNativeDialog';
import { usePermissionStore } from '@/store/permissions';
import { getApiErrorMessage } from '@/utils/api-error';

const MAX_VISIBLE_ITEMS = 8;

function withCount(template: string, count: number): string {
  return template.replace('{{count}}', String(count));
}

function formatMoment(value: string | null, locale: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function humanReason(item: EmailQueueItem, t: (key: string, fallback: string) => string) {
  if (item.status === 'sent') return null;
  const raw = item.last_error ?? '';
  if (raw.includes('SMTP')) {
    return t('admin.emailQueue.reasonNoSmtp', 'Почтовый сервер не настроен');
  }
  if (raw.includes('срок годности')) {
    return t('admin.emailQueue.reasonExpired', 'Содержимое письма устарело');
  }
  if (item.status === 'dead') {
    return t('admin.emailQueue.reasonFailed', 'Отправить не удалось');
  }
  return null;
}

function StatusPill({ item }: { item: EmailQueueItem }) {
  const { t } = useTranslation();
  const styles: Record<EmailQueueItem['status'], string> = {
    pending: 'bg-warning-500/10 text-warning-400',
    sent: 'bg-success-500/10 text-success-400',
    dead: 'bg-error-500/10 text-error-400',
  };
  const labels: Record<EmailQueueItem['status'], string> = {
    pending: t('admin.emailQueue.statusPending', 'Ждёт повтора'),
    sent: t('admin.emailQueue.statusSent', 'Доставлено повтором'),
    dead: t('admin.emailQueue.statusDead', 'Не доставлено'),
  };
  return (
    <span className={`shrink-0 rounded-lg px-2 py-0.5 text-xs font-medium ${styles[item.status]}`}>
      {labels[item.status]}
    </span>
  );
}

export function EmailQueueCard() {
  const { t, i18n } = useTranslation();
  const notify = useNotify();
  const dialog = useNativeDialog();
  const queryClient = useQueryClient();
  const canRead = usePermissionStore((state) => state.hasPermission('email_templates:read'));
  const canEdit = usePermissionStore((state) => state.hasPermission('email_templates:edit'));
  const clearActionRef = useRef(false);
  const [clearLocked, setClearLocked] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin', 'email-queue'],
    queryFn: adminEmailQueueApi.getQueue,
    enabled: canRead,
    refetchInterval: 60_000,
  });

  const clearMutation = useMutation({
    mutationFn: (pendingOnly: boolean) => adminEmailQueueApi.clearQueue(pendingOnly),
    onSuccess: async (result) => {
      notify.success(
        withCount(t('admin.emailQueue.cleared', 'Очередь очищена: {{count}}'), result.removed),
      );
      await queryClient.invalidateQueries({ queryKey: ['admin', 'email-queue'] });
    },
    onError: (error) => {
      notify.error(
        getApiErrorMessage(
          error,
          t('admin.emailQueue.clearFailed', 'Не удалось очистить очередь писем'),
        ),
      );
    },
  });

  const handleClear = async (pendingOnly: boolean) => {
    if (clearActionRef.current) return;
    clearActionRef.current = true;
    setClearLocked(true);
    try {
      const message = pendingOnly
        ? t('admin.emailQueue.confirmPending', 'Убрать письма, ожидающие отправки?')
        : t('admin.emailQueue.confirmAll', 'Очистить очередь целиком, вместе с историей?');
      if (!(await dialog.confirm(message))) return;
      await clearMutation.mutateAsync(pendingOnly);
    } catch {
      // The mutation displays the localized error notification.
    } finally {
      clearActionRef.current = false;
      setClearLocked(false);
    }
  };

  if (!canRead) return null;

  if (isLoading) {
    return (
      <div className="rounded-xl border border-dark-700 bg-dark-800 p-3 sm:p-4">
        <Skeleton className="h-5 w-40" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-dark-700 bg-dark-800 p-3 text-xs text-dark-400 sm:p-4"
      >
        {t(
          'admin.emailQueue.unavailable',
          'Состояние очереди писем недоступно. Возможно, бот ещё не обновлён.',
        )}
      </div>
    );
  }

  const stats = [
    [data.pending, t('admin.emailQueue.captionPending', 'в ожидании')],
    [data.sent, t('admin.emailQueue.captionSent', 'доставлены')],
    [data.dead, t('admin.emailQueue.captionDead', 'не дошли')],
  ] as const;
  const total = data.pending + data.sent + data.dead;
  const visibleItems = data.items.slice(0, MAX_VISIBLE_ITEMS);

  return (
    <section className="rounded-xl border border-dark-700 bg-dark-800 p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <ClockIcon className="h-5 w-5 shrink-0 text-dark-400" />
        <h2 className="text-sm font-semibold text-dark-100">
          {t('admin.emailQueue.title', 'Очередь писем')}
        </h2>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {stats.map(([value, caption]) => (
          <div key={caption} className="rounded-lg bg-dark-900/50 px-2 py-1.5 text-center">
            <p className="text-base font-semibold tabular-nums text-dark-100">{value}</p>
            <p className="text-[10px] leading-tight text-dark-400">{caption}</p>
          </div>
        ))}
      </div>

      <p className="mt-2 text-[11px] leading-snug text-dark-500">
        {t('admin.emailQueue.hint', 'Только письма, не ушедшие с первого раза')}
      </p>

      {canEdit && total > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {data.pending > 0 && (
            <button
              type="button"
              onClick={() => void handleClear(true)}
              disabled={clearLocked}
              className="flex-1 rounded-lg border border-dark-700 px-2 py-1.5 text-xs text-dark-300 transition-colors hover:bg-dark-700 disabled:opacity-50"
            >
              {t('admin.emailQueue.clearPending', 'Убрать ожидающие')}
            </button>
          )}
          <button
            type="button"
            onClick={() => void handleClear(false)}
            disabled={clearLocked}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-dark-700 px-2 py-1.5 text-xs text-dark-300 transition-colors hover:bg-dark-700 disabled:opacity-50"
          >
            <TrashIcon aria-hidden="true" className="h-3.5 w-3.5" />
            {t('admin.emailQueue.clearAll', 'Очистить')}
          </button>
        </div>
      )}

      {!data.smtp_configured && (
        <div className="mt-3 flex items-start gap-2 rounded-lg bg-warning-500/10 p-2.5">
          <WarningIcon className="mt-0.5 h-4 w-4 shrink-0 text-warning-400" />
          <p className="text-xs text-warning-200">
            {t(
              'admin.emailQueue.noSmtp',
              'Почтовый сервер не настроен, письма не отправляются. Адрес сервера задаётся в настройках, раздел SMTP.',
            )}
          </p>
        </div>
      )}

      {visibleItems.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {visibleItems.map((item) => {
            const reason = humanReason(item, t);
            return (
              <li key={item.id} className="rounded-lg bg-dark-900/50 px-2.5 py-1.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-dark-200">{item.to_email}</p>
                  <StatusPill item={item} />
                </div>
                <div className="mt-0.5 flex items-baseline justify-between gap-2 text-[11px]">
                  <p className="truncate text-dark-400">
                    {item.subject}
                    {reason ? ` · ${reason}` : ''}
                  </p>
                  <span className="shrink-0 text-dark-500">
                    {formatMoment(item.sent_at || item.created_at, i18n.language || 'ru')}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {data.items.length > MAX_VISIBLE_ITEMS && (
        <p className="mt-2 text-[11px] text-dark-500">
          {withCount(
            t('admin.emailQueue.more', 'И ещё {{count}}'),
            data.items.length - MAX_VISIBLE_ITEMS,
          )}
        </p>
      )}
    </section>
  );
}
