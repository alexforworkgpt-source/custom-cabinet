/** Display-only estimate; the existing API remains authoritative on confirmation. */
export function previewRenewalEndDate(
  currentEndDate: string | null | undefined,
  periodDays: number,
  now = Date.now(),
): string | null {
  if (
    !currentEndDate ||
    !Number.isSafeInteger(periodDays) ||
    periodDays < 1 ||
    !Number.isFinite(now)
  )
    return null;
  const current = Date.parse(currentEndDate);
  if (!Number.isFinite(current)) return null;
  const result = new Date(Math.max(current, now) + periodDays * 86400000);
  return Number.isFinite(result.getTime()) ? result.toISOString() : null;
}
