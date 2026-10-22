import type { Subscription, SubscriptionListItem, PurchaseOptions } from '../types';
import {
  canRenewSubscription,
  needsTariff,
  tariffSelectionPath,
  type RenewableSubscription,
} from './legacySubscription';

export interface DiscountNavigationContext {
  subscriptions: ReadonlyArray<Pick<SubscriptionListItem, 'id' | 'is_trial'>> | undefined;
  selectedSubscriptionId?: number;
  subscription: (RenewableSubscription & Pick<Subscription, 'id'>) | null;
  listError?: boolean;
  subscriptionError?: boolean;
}

export type DiscountDestination = {
  kind: 'purchase' | 'renew' | 'manage' | 'choose';
  path: string;
  labelKey: string;
};
export type DiscountAction =
  | DiscountDestination
  | { kind: 'loading'; subscriptionId?: number }
  | { kind: 'needs-mode'; subscriptionId: number }
  | { kind: 'retry' };

/** One read-only navigation policy. Ownership and supported actions precede routing. */
export function resolveDiscountAction(
  context: DiscountNavigationContext,
  mode?: PurchaseOptions['sales_mode'],
): DiscountAction {
  const { subscriptions, selectedSubscriptionId, subscription } = context;
  if (context.listError) return { kind: 'retry' };
  if (!subscriptions) return { kind: 'loading' };
  const choose: DiscountDestination = {
    kind: 'choose',
    path: '/subscriptions',
    labelKey: 'promo.actions.chooseSubscription',
  };
  if (
    selectedSubscriptionId !== undefined &&
    !subscriptions.some((sub) => sub.id === selectedSubscriptionId)
  )
    return choose;
  if (subscriptions.length === 0)
    return {
      kind: 'purchase',
      path: '/subscription/purchase',
      labelKey: 'subscriptions.chooseTariff',
    };
  if (subscriptions.length > 1 && selectedSubscriptionId === undefined) return choose;
  const id = selectedSubscriptionId ?? subscriptions[0].id;
  if (context.subscriptionError) return { kind: 'retry' };
  if (!subscription || subscription.id !== id) return { kind: 'loading', subscriptionId: id };
  const manage: DiscountDestination = {
    kind: 'manage',
    path: `/subscriptions/${id}`,
    labelKey: 'dashboard.manageSubscription',
  };
  const purchase: DiscountDestination = {
    kind: 'purchase',
    path: tariffSelectionPath(id),
    labelKey: 'subscriptions.chooseTariff',
  };
  if (needsTariff(subscription)) return purchase;
  if (subscription.is_trial) {
    if (subscriptions.some((sub) => !sub.is_trial)) {
      if (!mode) return { kind: 'needs-mode', subscriptionId: id };
      if (mode === 'classic') return manage;
    }
    return purchase;
  }
  if (
    subscription.is_daily ||
    subscription.is_limited ||
    !['active', 'expired'].includes(subscription.status)
  )
    return manage;
  if (!subscription.tariff_id && !mode) return { kind: 'needs-mode', subscriptionId: id };
  if (canRenewSubscription(subscription, mode === 'classic')) {
    return { kind: 'renew', path: `/subscriptions/${id}/renew`, labelKey: 'subscription.extend' };
  }
  return manage;
}
