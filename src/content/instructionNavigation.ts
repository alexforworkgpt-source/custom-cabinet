export type InstructionActionId = 'connection' | 'subscriptions' | 'balance' | 'accounts';

export interface InstructionNavigation {
  action: InstructionActionId;
  relatedSlugs: string[];
}

const instructionNavigation: Record<string, InstructionNavigation> = {
  'connect-android': {
    action: 'connection',
    relatedSlugs: ['connect-ios', 'connect-windows'],
  },
  'connect-ios': {
    action: 'connection',
    relatedSlugs: ['connect-windows', 'connect-macos'],
  },
  'connect-windows': {
    action: 'connection',
    relatedSlugs: ['connect-macos', 'connect-android-tv'],
  },
  'connect-macos': {
    action: 'connection',
    relatedSlugs: ['connect-android-tv', 'connect-apple-tv'],
  },
  'connect-android-tv': {
    action: 'connection',
    relatedSlugs: ['connect-apple-tv', 'manage-devices'],
  },
  'connect-apple-tv': {
    action: 'connection',
    relatedSlugs: ['manage-devices', 'manage-subscription'],
  },
  'renew-subscription': {
    action: 'subscriptions',
    relatedSlugs: ['manage-devices', 'manage-subscription'],
  },
  'manage-devices': {
    action: 'subscriptions',
    relatedSlugs: ['manage-subscription', 'delete-device'],
  },
  'manage-subscription': {
    action: 'subscriptions',
    relatedSlugs: ['delete-device', 'share-subscription'],
  },
  'delete-device': {
    action: 'subscriptions',
    relatedSlugs: ['share-subscription', 'balance-overview'],
  },
  'share-subscription': {
    action: 'subscriptions',
    relatedSlugs: ['balance-overview', 'secure-account'],
  },
  'balance-overview': {
    action: 'balance',
    relatedSlugs: ['secure-account'],
  },
  'secure-account': {
    action: 'accounts',
    relatedSlugs: [],
  },
};

const actionRoutes: Record<InstructionActionId, string> = {
  connection: '/connection',
  subscriptions: '/subscriptions',
  balance: '/balance',
  accounts: '/profile/accounts',
};

export const getInstructionNavigation = (slug: string): InstructionNavigation | undefined =>
  instructionNavigation[slug];

export const resolveInstructionActionRoute = (action: InstructionActionId): string =>
  actionRoutes[action];
