import { safeLocal } from './safeStorage';

export interface RenewalSnapshot {
  userId: number | undefined;
  endDate: string;
}

export function renewalOperationId(
  subscriptionId: number,
  periodDays: number,
  snapshot: RenewalSnapshot,
): string {
  const key = `cabinet:renewal:${snapshot.userId}:${subscriptionId}:${periodDays}:${snapshot.endDate}`;
  const stored = safeLocal.getItem(key);
  if (stored && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(stored)) {
    return stored;
  }
  const id = crypto.randomUUID();
  safeLocal.setItem(key, id);
  return id;
}

export function isValidRenewalSnapshot(snapshot?: RenewalSnapshot): snapshot is RenewalSnapshot {
  return Boolean(
    snapshot?.userId &&
      /(?:Z|[+-]\d{2}:\d{2})$/i.test(snapshot.endDate) &&
      Number.isFinite(Date.parse(snapshot.endDate)),
  );
}
