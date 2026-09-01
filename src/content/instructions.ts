export type InstructionCategory = 'connection' | 'subscription' | 'balance' | 'account';

export interface InstructionSummary {
  slug: string;
  category: InstructionCategory;
  title: string;
  summary: string;
  stepCount: number;
}

export const instructionSummaries: InstructionSummary[] = [
  {
    slug: 'connect-android',
    category: 'connection',
    title: 'Как настроить VPN на Android',
    summary: 'Выбор Android, установка приложения и добавление подписки.',
    stepCount: 6,
  },
  {
    slug: 'connect-ios',
    category: 'connection',
    title: 'Как настроить VPN на iPhone или iPad',
    summary: 'Подключение iOS-устройства через совместимое приложение.',
    stepCount: 5,
  },
  {
    slug: 'connect-windows',
    category: 'connection',
    title: 'Как настроить VPN на Windows',
    summary: 'Установка desktop-приложения и добавление подписки.',
    stepCount: 5,
  },
  {
    slug: 'connect-macos',
    category: 'connection',
    title: 'Как настроить VPN на macOS',
    summary: 'Выбор версии для Mac и настройка подключения.',
    stepCount: 5,
  },
  {
    slug: 'connect-android-tv',
    category: 'connection',
    title: 'Как настроить VPN на Android TV',
    summary: 'Установка приложения на телевизор и добавление подписки.',
    stepCount: 5,
  },
  {
    slug: 'connect-apple-tv',
    category: 'connection',
    title: 'Как настроить VPN на Apple TV',
    summary: 'Настройка Apple TV через совместимое приложение.',
    stepCount: 5,
  },
  {
    slug: 'renew-subscription',
    category: 'subscription',
    title: 'Как продлить подписку',
    summary: 'Период, устройства, итоговая сумма и безопасный переход к пополнению.',
    stepCount: 7,
  },
  {
    slug: 'manage-devices',
    category: 'subscription',
    title: 'Как посмотреть подключённые устройства',
    summary: 'Где найти список устройств и проверить занятые места.',
    stepCount: 3,
  },
  {
    slug: 'manage-subscription',
    category: 'subscription',
    title: 'Как управлять подпиской и автопродлением',
    summary: 'Основные настройки и дополнительные действия подписки.',
    stepCount: 5,
  },
  {
    slug: 'delete-device',
    category: 'subscription',
    title: 'Как удалить устройство',
    summary: 'Как выбрать нужное устройство и освободить место для нового.',
    stepCount: 3,
  },
  {
    slug: 'share-subscription',
    category: 'subscription',
    title: 'Как поделиться подпиской',
    summary: 'Передача ссылки или QR-кода и подключение получателя.',
    stepCount: 12,
  },
  {
    slug: 'balance-overview',
    category: 'balance',
    title: 'Баланс, промокод и начало пополнения',
    summary: 'Проверка баланса, промокода, истории и способов пополнения.',
    stepCount: 5,
  },
  {
    slug: 'secure-account',
    category: 'account',
    title: 'Как привязать аккаунт',
    summary: 'Проверка Telegram, Email и других способов входа.',
    stepCount: 3,
  },
];

export const instructionCategories: InstructionCategory[] = [
  'connection',
  'subscription',
  'balance',
  'account',
];

export const instructionContentPack = {
  locale: 'ru',
  sourceBatch: 'batch-r2.4-codex-0831-refresh1',
  lastReviewed: '2026-09-01',
} as const;
