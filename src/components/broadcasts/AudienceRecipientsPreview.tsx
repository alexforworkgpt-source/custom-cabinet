import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import type { BroadcastAudiencePreviewResponse } from '../../api/adminBroadcasts';
import { Button } from '../primitives/Button';
import { ResponsiveOverlay } from '../primitives/ResponsiveOverlay';
import { ExternalLinkIcon } from '../icons/extended-icons';
import type { Channel } from './audience';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restoreFocusTo: HTMLElement | null;
  channel: Channel;
  data?: BroadcastAudiencePreviewResponse;
  isPending: boolean;
  isError: boolean;
  offset: number;
  pageSize: number;
  onOffsetChange: (offset: number) => void;
}

export function AudienceRecipientsPreview({
  open,
  onOpenChange,
  restoreFocusTo,
  channel,
  data,
  isPending,
  isError,
  offset,
  pageSize,
  onOffsetChange,
}: Props) {
  const { t } = useTranslation();
  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={onOpenChange}
      restoreFocusTo={restoreFocusTo}
      title={t('admin.broadcasts.audience.users', 'Получатели рассылки')}
      description={`${t('admin.broadcasts.audience.recipientCount', 'Получателей')}: ${data?.count ?? '—'}`}
    >
      <div className="max-h-[55vh] overflow-y-auto">
        {isPending && <p>{t('common.loading', 'Загрузка...')}</p>}
        {isError && (
          <p role="alert" className="text-error-400">
            {t('admin.broadcasts.audience.loadError', 'Не удалось загрузить получателей')}
          </p>
        )}
        {!isError && data?.users.length === 0 && (
          <p className="text-dark-400">{t('admin.broadcasts.audience.empty', 'Получателей нет')}</p>
        )}
        {data?.users.map((user) => (
          <Link
            key={user.id}
            to={`/admin/users/${user.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-between gap-3 rounded border-b border-dark-800 px-2 py-2 text-sm transition-colors hover:bg-dark-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-500"
          >
            <span className="min-w-0 truncate text-dark-100">
              {user.username ||
                [user.first_name, user.last_name].filter(Boolean).join(' ') ||
                `#${user.id}`}
            </span>
            <span className="flex min-w-0 items-center gap-2 text-dark-400">
              <span className="truncate">
                {channel === 'telegram' ? user.telegram_id : user.email}
              </span>
              <ExternalLinkIcon className="h-4 w-4 shrink-0" />
            </span>
          </Link>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between gap-2">
        <Button
          variant="secondary"
          disabled={offset === 0}
          onClick={() => onOffsetChange(Math.max(0, offset - pageSize))}
        >
          {t('admin.broadcasts.prev', 'Назад')}
        </Button>
        <span className="text-sm text-dark-400">
          {data && data.count > 0
            ? `${offset + 1}–${Math.min(offset + pageSize, data.count)} / ${data.count}`
            : '0'}
        </span>
        <Button
          variant="secondary"
          disabled={!data || offset + pageSize >= data.count}
          onClick={() => onOffsetChange(offset + pageSize)}
        >
          {t('admin.broadcasts.next', 'Далее')}
        </Button>
      </div>
    </ResponsiveOverlay>
  );
}
