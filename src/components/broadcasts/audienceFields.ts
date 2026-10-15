import type { TFunction } from 'i18next';
import type { TariffFilter } from '../../api/adminBroadcasts';
import type { Channel, FieldChoice, Filter } from './audience';

export function buildAudienceFields(
  t: TFunction,
  channel: Channel,
  filters: Filter[],
): FieldChoice[] {
  return [
    {
      field: 'basic',
      label: t('admin.broadcasts.atomic.all', 'Все пользователи'),
      kind: 'fixed',
      values: [
        {
          value: channel === 'telegram' ? 'all' : 'all_email',
          label: t('admin.broadcasts.atomic.all', 'Все пользователи'),
        },
      ],
    },
    {
      field: 'subscription_status',
      label: t('admin.broadcasts.atomic.subscriptionStatus', 'Статус подписки'),
      kind: 'select',
      values: [
        { value: 'active', label: t('admin.broadcasts.atomic.active', 'Активна') },
        { value: 'expired', label: t('admin.broadcasts.atomic.expired', 'Истекла') },
      ],
    },
    {
      field: 'subscription_type',
      label: t('admin.broadcasts.atomic.subscriptionType', 'Тип подписки'),
      kind: 'select',
      values: [
        { value: 'trial', label: t('admin.broadcasts.atomic.trial', 'Триальная') },
        { value: 'paid', label: t('admin.broadcasts.atomic.paid', 'Оплаченная') },
      ],
    },
    {
      field: 'tariff',
      label: t('admin.broadcasts.atomic.tariff', 'Тариф'),
      kind: 'select',
      values: filters
        .filter((filter): filter is TariffFilter => 'tariff_id' in filter)
        .map((filter) => ({ value: filter.key, label: filter.label })),
    },
    {
      field: 'traffic_zero',
      label: t('admin.broadcasts.atomic.trafficZero', 'Использованный трафик равен 0'),
      kind: 'fixed',
      values: [{ value: 'zero', label: `0 ${t('common.units.gb', 'ГБ')}` }],
    },
    {
      field: 'traffic_gt',
      label: t('admin.broadcasts.atomic.trafficGt', 'Использованный трафик больше'),
      kind: 'number',
    },
    {
      field: 'traffic_lt',
      label: t('admin.broadcasts.atomic.trafficLt', 'Использованный трафик меньше'),
      kind: 'number',
    },
    {
      field: 'subscription_end_preset',
      label: t('admin.broadcasts.atomic.endPreset', 'Окончание подписки: быстрый период'),
      kind: 'select',
      values: [
        { value: 'expiring', label: t('admin.broadcasts.atomic.next3Days', 'В ближайшие 3 дня') },
      ],
    },
    {
      field: 'subscription_end_date',
      label: t('admin.broadcasts.atomic.endDate', 'Окончание подписки: дата'),
      kind: 'date',
    },
    {
      field: 'registration',
      label: t('admin.broadcasts.atomic.registrationPreset', 'Регистрация: быстрый период'),
      kind: 'select',
      values: [
        { value: 'custom_today', label: t('admin.broadcasts.atomic.today', 'Сегодня') },
        { value: 'custom_week', label: t('admin.broadcasts.atomic.last7Days', 'За 7 дней') },
        { value: 'custom_month', label: t('admin.broadcasts.atomic.last30Days', 'За 30 дней') },
      ],
    },
    {
      field: 'registration_date',
      label: t('admin.broadcasts.atomic.registrationDate', 'Дата регистрации'),
      kind: 'date',
    },
    {
      field: 'activity',
      label: t('admin.broadcasts.atomic.activityPreset', 'Активность: быстрый период'),
      kind: 'select',
      values: [
        {
          value: 'custom_active_today',
          label: t('admin.broadcasts.atomic.activeToday', 'Активен сегодня'),
        },
        {
          value: 'custom_inactive_week',
          label: t('admin.broadcasts.atomic.inactive7Days', 'Неактивен 7+ дней'),
        },
        {
          value: 'custom_inactive_month',
          label: t('admin.broadcasts.atomic.inactive30Days', 'Неактивен 30+ дней'),
        },
      ],
    },
    {
      field: 'activity_date',
      label: t('admin.broadcasts.atomic.activityDate', 'Последняя активность: дата'),
      kind: 'date',
    },
    {
      field: 'source',
      label: t('admin.broadcasts.atomic.source', 'Источник регистрации'),
      kind: 'select',
      values: [
        { value: 'custom_referrals', label: t('admin.broadcasts.atomic.referral', 'По рефералу') },
        { value: 'custom_direct', label: t('admin.broadcasts.atomic.direct', 'Напрямую') },
      ],
    },
    {
      field: 'auth_type',
      label: t('admin.broadcasts.audience.authType', 'Способ регистрации'),
      kind: 'select',
      values: [
        { value: 'telegram_with_email', label: 'Telegram' },
        { value: 'email_only', label: 'Email' },
      ],
    },
    {
      field: 'paid_history',
      label: t('admin.broadcasts.atomic.paidHistory', 'Оплачивал раньше'),
      kind: 'select',
      values: [
        { value: 'yes', label: t('common.yes', 'Да') },
        { value: 'no', label: t('common.no', 'Нет') },
      ],
    },
    ...(channel === 'email' &&
    filters.some((filter) => 'group' in filter && filter.group === 'promo_group')
      ? [
          {
            field: 'promo_group',
            label: t('admin.broadcasts.filterGroups.promo_group', 'Промогруппа'),
            kind: 'select' as const,
            values: filters
              .filter((filter) => filter.key.startsWith('promo_group_'))
              .map((filter) => ({ value: filter.key, label: filter.label })),
          },
        ]
      : []),
    ...(channel === 'telegram'
      ? [
          { field: 'telegram_id', label: 'Telegram ID', kind: 'user' as const },
          {
            field: 'telegram_username',
            label: t('admin.broadcasts.atomic.telegramUsername', 'Ник Telegram'),
            kind: 'user' as const,
          },
        ]
      : [{ field: 'email_user', label: 'Email', kind: 'user' as const }]),
  ];
}
