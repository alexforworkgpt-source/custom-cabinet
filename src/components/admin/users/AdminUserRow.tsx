import { useTranslation } from 'react-i18next';
import type { UserListItem } from '@/api/adminUsers';
import { ChevronRightIcon, TelegramSmallIcon as TelegramIcon } from '@/components/icons';
import { relativeTimeParts } from '@/utils/relativeTime';
import { isUserOnline } from './online';

interface Props {
  user: UserListItem;
  now: number;
  onClick: () => void;
  formatAmount: (amount: number) => string;
}

export function AdminUserRow({ user, now, onClick, formatAmount }: Props) {
  const { t } = useTranslation();
  const online = isUserOnline(user, now);
  const activity = relativeTimeParts(user.last_activity, now);
  const graceOpen = Boolean(user.grace_until && new Date(user.grace_until).getTime() > now);
  const extraTariffs = Math.max(0, (user.subscriptions?.length ?? 0) - 1);
  const statusKey =
    user.status === 'blocked' || user.status === 'deleted'
      ? user.status
      : !user.has_subscription
        ? 'noSubscription'
        : user.subscription_status === 'trial'
          ? 'trial'
          : user.subscription_status === 'limited'
            ? 'limited'
            : user.subscription_status === 'expired'
              ? 'expired'
              : 'active';

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 rounded-xl border border-dark-700 bg-dark-800/50 p-3 text-left transition-all hover:border-dark-600 hover:bg-dark-800 sm:items-center sm:gap-4 sm:p-4"
    >
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-500 to-accent-700 text-sm font-medium text-white sm:text-base">
        {user.first_name?.[0] || user.username?.[0] || '?'}
        {online && (
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-dark-800 bg-success-400" />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate font-medium text-dark-100">{user.full_name}</span>
          {user.username && (
            <span className="truncate text-xs text-dark-500">@{user.username}</span>
          )}
          {online && (
            <span className="text-xs text-success-400">{t('admin.users.connectedNow')}</span>
          )}
        </span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-dark-400">
          <span className="inline-flex items-center gap-1">
            <TelegramIcon /> {user.telegram_id}
          </span>
          <span>· {t(`common.relative.${activity.key}`, { count: activity.count })}</span>
        </span>
        <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded-full border border-dark-600 bg-dark-700/60 px-2 py-0.5 text-xs text-dark-300">
            {t(`admin.users.statuses.${statusKey}`)}
          </span>
          {graceOpen && (
            <span className="rounded-full border border-warning-500/30 bg-warning-500/15 px-2 py-0.5 text-xs text-warning-400">
              {t('admin.users.subscriptionChips.graceUntil', {
                date: new Date(user.grace_until as string).toLocaleDateString(),
              })}
            </span>
          )}
          {extraTariffs > 0 && (
            <span className="rounded-full border border-accent-500/30 bg-accent-500/10 px-2 py-0.5 text-xs text-accent-400">
              {t('admin.users.moreTariffs', { count: extraTariffs })}
            </span>
          )}
        </span>
      </span>

      <span className="shrink-0 text-right">
        <span className="block text-sm font-medium text-dark-100 sm:text-base">
          {formatAmount(user.balance_rubles)}
        </span>
        <span className="hidden text-xs text-dark-500 sm:block">
          {user.purchase_count > 0
            ? t('admin.users.purchaseCount', { count: user.purchase_count })
            : t('admin.users.noPurchases')}
        </span>
      </span>
      <ChevronRightIcon />
    </button>
  );
}
