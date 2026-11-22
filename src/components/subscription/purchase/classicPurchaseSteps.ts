import type { ClassicPurchaseOptions, PeriodOption } from '../../../types';
import type { PurchaseStep } from '../../../utils/subscriptionHelpers';

export function getClassicDefaultPeriod(options: ClassicPurchaseOptions): PeriodOption | undefined {
  return (
    options.periods.find((period) => period.id === options.selection.period_id) ||
    options.periods[0]
  );
}

export function getClassicServers(period: PeriodOption | null | undefined, isTrial?: boolean) {
  return (period?.servers.options ?? []).filter(
    (server) => server.is_available && !(isTrial && server.name.toLowerCase().includes('trial')),
  );
}

export function getClassicPurchaseSteps(
  period: PeriodOption | null | undefined,
  isTrial?: boolean,
): PurchaseStep[] {
  const steps: PurchaseStep[] = ['period'];
  if (period?.traffic.selectable && (period.traffic.options?.length ?? 0) > 0)
    steps.push('traffic');
  if (getClassicServers(period, isTrial).length > 1) steps.push('servers');
  if (period && period.devices.max > period.devices.min) steps.push('devices');
  steps.push('confirm');
  return steps;
}
