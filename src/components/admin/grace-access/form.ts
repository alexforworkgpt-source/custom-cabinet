import type { GraceAccessConfig, GraceAccessIssue } from '@/api/adminGraceAccess';

const NUMERIC_FIELDS = [
  'duration_hours',
  'traffic_gb',
  'reconcile_interval_seconds',
  'reconcile_batch_size',
  'candidate_lookback_minutes',
] as const;

export type NumericField = (typeof NUMERIC_FIELDS)[number];

/**
 * A number field has to be clearable to be retypeable: a strictly numeric state
 * turns an empty box back into the previous number on the next render, so the
 * first character typed lands after it.
 */
export type GraceForm = Omit<GraceAccessConfig, NumericField> & Record<NumericField, number | ''>;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 'keep' is not a UUID — it means "leave whatever external squad the user has".
 * The runtime compares it lowercased, so a stored 'Keep' is valid and must not be
 * shown as a malformed UUID.
 */
export const EXTERNAL_KEEP = 'keep';

export type ExternalChoice = 'detach' | 'keep' | 'custom';

export function externalChoiceOf(value: string): ExternalChoice {
  const normalized = value.trim().toLowerCase();
  if (normalized === '') return 'detach';
  if (normalized === EXTERNAL_KEEP) return 'keep';
  return 'custom';
}

export function toForm(config: GraceAccessConfig): GraceForm {
  return { ...config };
}

/**
 * The same rules the backend enforces, checked while typing.
 *
 * Duplicated on purpose: the server is the authority, but a form that only learns
 * its value is impossible after pressing Save teaches nothing about *which* field
 * is wrong.
 */
export function graceFormIssues(form: GraceForm): GraceAccessIssue[] {
  const issues: GraceAccessIssue[] = [];

  for (const field of ['expired_squad_uuid', 'limited_squad_uuid'] as const) {
    const value = form[field].trim();
    if (!value) {
      issues.push({ field, code: 'squad_required', severity: 'error' });
    } else if (!UUID_PATTERN.test(value)) {
      issues.push({ field, code: 'squad_invalid', severity: 'error' });
    }
  }

  const external = form.external_squad_uuid.trim();
  if (external && external.toLowerCase() !== EXTERNAL_KEEP && !UUID_PATTERN.test(external)) {
    issues.push({ field: 'external_squad_uuid', code: 'squad_invalid', severity: 'error' });
  }

  if (form.traffic_gb === '' || form.traffic_gb < 1) {
    issues.push({ field: 'traffic_gb', code: 'traffic_required', severity: 'error' });
  }

  return issues;
}

/**
 * Number boxes left empty. Saving them is impossible in any mode — unlike the
 * squad rules, which only matter once grace is switched on.
 */
export function emptyNumericFields(form: GraceForm): NumericField[] {
  return NUMERIC_FIELDS.filter((field) => form[field] === '');
}

/** Fields whose value differs from what is stored — the only ones worth sending. */
export function changedFields(
  next: GraceForm,
  stored: GraceAccessConfig,
): Partial<GraceAccessConfig> {
  const patch: Record<string, unknown> = {};
  for (const key of Object.keys(stored) as (keyof GraceAccessConfig)[]) {
    const value = next[key];
    // A half-typed number is not a value yet; save stays blocked until it is one.
    // Only numbers, though: '' is a real value for the squad fields — for the
    // external one it IS "detach", so skipping every empty string made the safe
    // default the one setting that could never be saved.
    if (value === '' && (NUMERIC_FIELDS as readonly string[]).includes(key)) continue;
    if (value !== stored[key]) patch[key] = value;
  }
  return patch as Partial<GraceAccessConfig>;
}
