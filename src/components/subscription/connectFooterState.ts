export type ConnectFooterState =
  | { kind: 'hidden' }
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'connect'; used: number; limit: number; unlimited: boolean; highlight: boolean }
  | { kind: 'full'; used: number; limit: number };

const CONNECTABLE_STATUSES = new Set(['active', 'trial', 'limited']);

export interface ConnectFooterInput {
  status: string;
  subscriptionUrl: string | null | undefined;
  deviceLimit: number;
  connected: number | undefined;
  hasError?: boolean;
}

export function connectFooterState({
  status,
  subscriptionUrl,
  deviceLimit,
  connected,
  hasError = false,
}: ConnectFooterInput): ConnectFooterState {
  if (!subscriptionUrl || !CONNECTABLE_STATUSES.has(status)) return { kind: 'hidden' };

  if (connected === undefined) return hasError ? { kind: 'error' } : { kind: 'loading' };

  const unlimited = deviceLimit === 0;
  if (!unlimited && connected >= deviceLimit) {
    return { kind: 'full', used: connected, limit: deviceLimit };
  }

  return {
    kind: 'connect',
    used: connected,
    limit: deviceLimit,
    unlimited,
    highlight: connected === 0,
  };
}
