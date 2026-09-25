import type { Subscription } from '@/types';

/**
 * A legacy subscription is identified only by the explicit Bot contract.
 * Missing tariff data alone is not enough to infer this state.
 */
export function needsTariff(
  subscription: Pick<Subscription, 'requires_tariff_selection'> | null | undefined,
): boolean {
  return subscription?.requires_tariff_selection === true;
}

export function tariffSelectionPath(subscriptionId: number): string {
  return `/subscription/purchase?subscriptionId=${subscriptionId}`;
}

export function showsAutopayToggle(
  subscription: Pick<Subscription, 'is_trial' | 'is_daily' | 'requires_tariff_selection'>,
): boolean {
  return !subscription.is_trial && !subscription.is_daily && !needsTariff(subscription);
}

export function planTitle(
  subscription: Pick<Subscription, 'tariff_name' | 'requires_tariff_selection'>,
  t: (key: string) => string,
): string {
  if (needsTariff(subscription)) return t('subscription.legacy.noTariff');
  return subscription.tariff_name || t('subscription.currentPlan');
}

export function showsAddonOptions(
  subscription: Pick<
    Subscription,
    'is_active' | 'is_limited' | 'is_trial' | 'device_limit' | 'requires_tariff_selection'
  >,
): boolean {
  return (
    (subscription.is_active || subscription.is_limited) &&
    !subscription.is_trial &&
    subscription.device_limit !== 0 &&
    !needsTariff(subscription)
  );
}

export function hasLegacySubscription(
  subscriptions: ReadonlyArray<Pick<Subscription, 'requires_tariff_selection'>> | undefined,
): boolean {
  return (subscriptions ?? []).some(needsTariff);
}
