import {
  EXTERNAL_KEEP,
  type GraceForm,
  type NumericField,
  type ExternalChoice,
  externalChoiceOf,
  toForm,
  graceFormIssues,
  emptyNumericFields,
  changedFields,
} from '@/components/admin/grace-access/form';
import { SquadField } from '@/components/admin/grace-access/SquadField';
import { SessionsSection } from '@/components/admin/grace-access/SessionsSection';
import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  adminGraceAccessApi,
  type GraceAccessConfig,
  type GraceAccessIssue,
  type GraceAccessMode,
  type GraceAccessOverview,
} from '@/api/adminGraceAccess';
import { AdminBackButton, Toggle } from '@/components/admin';
import { BanIcon, BoltIcon, EyeIcon, LockIcon, RestartIcon, WarningIcon } from '@/components/icons';
import { PageSkeleton, Skeleton } from '@/components/ui/skeleton';
import { getApiErrorMessage } from '@/utils/api-error';
import { usePermissionStore } from '@/store/permissions';

/**
 * Grace access: temporary restricted VPN for an expired or traffic-limited
 * subscription, so a user who forgot to pay can still reach the payment page.
 *
 * The same twelve keys are reachable from the generic settings page, one flat row
 * each. They are grouped here because they only mean anything together — and
 * because two of their failure modes are silent:
 *
 *  - `mode=true` with a missing or malformed squad UUID makes the runtime disable
 *    grace at startup and say so once, in the log;
 *  - the mode is read only while starting, so a saved value changes nothing until
 *    the bot is restarted.
 *
 * Both are stated on screen instead of being left to be discovered in production.
 */

const MODES: GraceAccessMode[] = ['false', 'observe', 'true', 'drain'];

const MODE_ICONS: Record<GraceAccessMode, ReactElement> = {
  false: <BanIcon className="h-5 w-5" />,
  observe: <EyeIcon className="h-5 w-5" />,
  true: <BoltIcon className="h-5 w-5" />,
  drain: <RestartIcon className="h-5 w-5" />,
};

function useIssueText() {
  const { t } = useTranslation();
  return (issue: GraceAccessIssue) =>
    t(`admin.graceAccess.issue.${issue.code}`, {
      field: t(`admin.graceAccess.fields.${issue.field}`),
      defaultValue: issue.code,
    });
}

// ─── Pieces ───

function StatTile({ label, value, tone }: { label: string; value: number; tone?: 'error' }) {
  const alarming = tone === 'error' && value > 0;
  return (
    <div
      className={`rounded-xl border p-3 ${
        alarming ? 'border-error-500/30 bg-error-500/10' : 'border-dark-700/40 bg-dark-800/30'
      }`}
    >
      <div className={`text-2xl font-semibold ${alarming ? 'text-error-300' : 'text-dark-100'}`}>
        {value}
      </div>
      <div className="mt-0.5 text-xs text-dark-400">{label}</div>
    </div>
  );
}

// ─── Page ───

export default function AdminGraceAccess() {
  const { t } = useTranslation();
  const canEdit = usePermissionStore((state) => state.hasPermission('settings:edit'));
  const queryClient = useQueryClient();
  const issueText = useIssueText();

  const { data, isLoading, error } = useQuery<GraceAccessOverview>({
    queryKey: ['grace-access'],
    queryFn: adminGraceAccessApi.getOverview,
  });

  const { data: squads } = useQuery({
    queryKey: ['grace-access-squads'],
    queryFn: adminGraceAccessApi.getSquads,
    staleTime: 60_000,
  });

  const [form, setForm] = useState<GraceForm | null>(null);
  const [externalChoice, setExternalChoice] = useState<ExternalChoice>('detach');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showReconcile, setShowReconcile] = useState(false);

  useEffect(() => {
    if (!data) return;
    setForm(toForm(data.config));
    setExternalChoice(externalChoiceOf(data.config.external_squad_uuid));
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: (patch: Partial<GraceAccessConfig>) => adminGraceAccessApi.update(patch),
    onSuccess: (overview) => {
      setSaveError(null);
      setForm(toForm(overview.config));
      setExternalChoice(externalChoiceOf(overview.config.external_squad_uuid));
      queryClient.setQueryData(['grace-access'], overview);
      queryClient.invalidateQueries({ queryKey: ['grace-sessions'] });
    },
    onError: (mutationError: unknown) => {
      // Через общий разбор: у 422 от FastAPI detail — СПИСОК объектов, и он
      // попадал в JSX массивом, роняя экран вместо показа причины.
      setSaveError(getApiErrorMessage(mutationError, t('admin.graceAccess.saveError')));
    },
  });

  const patch = useMemo(() => (form && data ? changedFields(form, data.config) : {}), [form, data]);
  const dirty = Object.keys(patch).length > 0;

  const formIssues = form ? graceFormIssues(form) : [];
  const blockers = formIssues.filter((issue) => issue.severity === 'error');
  // Squad rules only block saving when the chosen mode needs them: an operator whose
  // config is already broken must still be able to turn grace off or drain it.
  const modeBlockers = form?.mode === 'true' ? blockers : [];
  const emptyNumbers = form ? emptyNumericFields(form) : [];
  // "Fallback squad" with an empty box silently means "detach" — the opposite of
  // what was picked, so it is refused rather than quietly reinterpreted.
  // Сравнение по обрезанной строке: сервер всё равно обрежет, и пробел прошёл бы
  // мимо обеих проверок, а сохранился бы как «Отцепить» — ровно та подмена, от
  // которой этот флаг и защищает.
  const externalIncomplete =
    externalChoice === 'custom' && (form?.external_squad_uuid ?? '').trim() === '';
  const blocksSave = modeBlockers.length > 0 || emptyNumbers.length > 0 || externalIncomplete;
  const invalidFields = new Set(blockers.map((issue) => issue.field));

  if (isLoading || (!form && !error)) {
    return (
      <PageSkeleton variant="admin" leading={2} titleWidth="w-56" className="space-y-6">
        <Skeleton variant="card" className="h-96" />
      </PageSkeleton>
    );
  }

  if (error || !data || !form) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6 flex items-center gap-3">
          <AdminBackButton to="/admin" />
          <h1 className="text-xl font-semibold text-dark-100">{t('admin.graceAccess.title')}</h1>
        </div>
        <div className="rounded-xl border border-error-500/30 bg-error-500/10 p-6 text-center">
          <p className="text-error-400">{t('admin.graceAccess.loadError')}</p>
        </div>
      </div>
    );
  }

  const locked = new Set(data.env_locked);
  const isLocked = (field: keyof GraceAccessConfig) => !canEdit || locked.has(field);
  // Пример .env долгое время отдавал все ключи grace раскомментированными, поэтому
  // у скопировавших его раздел открывается целиком нередактируемым. Двенадцать
  // мелких замков этого не объясняют — нужна одна строка о том, что делать.
  const fullyLocked = data.env_locked.length >= Object.keys(data.config).length;
  const restartOnly = new Set(data.restart_only);

  const update = <K extends keyof GraceForm>(field: K, value: GraceForm[K]) =>
    setForm((current) => (current ? { ...current, [field]: value } : current));

  const updateNumber = (field: NumericField, raw: string) => {
    if (raw === '') return update(field, '');
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) update(field, parsed);
  };

  const lockNote = (field: keyof GraceAccessConfig) =>
    locked.has(field) ? (
      <p className="mt-1 flex items-center gap-1 text-xs text-warning-400">
        <LockIcon className="h-3 w-3" />
        {t('admin.graceAccess.envLocked')}
      </p>
    ) : null;

  return (
    <div className="animate-fade-in space-y-6 pb-24">
      <div className="flex items-center gap-3">
        <AdminBackButton to="/admin" />
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-dark-100">{t('admin.graceAccess.title')}</h1>
          <p className="text-sm text-dark-500">{t('admin.graceAccess.subtitle')}</p>
        </div>
        <span
          className={`ml-auto shrink-0 rounded-full border px-3 py-1 text-xs ${
            data.runtime.running_mode === 'true'
              ? 'border-success-500/40 bg-success-500/10 text-success-300'
              : 'border-dark-700/50 bg-dark-800/40 text-dark-300'
          }`}
        >
          {t(`admin.graceAccess.badge.${data.runtime.running_mode}`, {
            defaultValue: data.runtime.running_mode,
          })}
        </span>
      </div>

      {fullyLocked && (
        <div className="rounded-xl border border-warning-500/30 bg-warning-500/10 p-4">
          <div className="flex items-center gap-2 font-medium text-warning-300">
            <LockIcon className="h-4 w-4" />
            {t('admin.graceAccess.fullyLocked.title')}
          </div>
          <p className="mt-1 text-sm text-warning-200/80">
            {t('admin.graceAccess.fullyLocked.body')}
          </p>
        </div>
      )}

      {data.runtime.restart_required && (
        <div className="rounded-xl border border-warning-500/30 bg-warning-500/10 p-4">
          <div className="flex items-center gap-2 font-medium text-warning-300">
            <RestartIcon className="h-4 w-4" />
            {t('admin.graceAccess.restart.title')}
          </div>
          <p className="mt-1 text-sm text-warning-200/80">
            {t('admin.graceAccess.restart.body', {
              running: t(`admin.graceAccess.badge.${data.runtime.running_mode}`, {
                defaultValue: data.runtime.running_mode,
              }),
              configured: t(`admin.graceAccess.badge.${data.runtime.configured_mode}`, {
                defaultValue: data.runtime.configured_mode,
              }),
            })}
          </p>
        </div>
      )}

      {data.issues.length > 0 &&
        (() => {
          // Пока grace выключен, незаполненный сквад — заметка о том, что
          // понадобится при включении, а не авария. Красная рамка на свежей
          // установке приучает не читать этот блок вовсе.
          const severe = data.issues.some((issue) => issue.severity === 'error');
          return (
            <div
              className={`rounded-xl border p-4 ${
                severe
                  ? 'border-error-500/30 bg-error-500/10'
                  : 'border-warning-500/30 bg-warning-500/10'
              }`}
            >
              <div
                className={`flex items-center gap-2 font-medium ${
                  severe ? 'text-error-300' : 'text-warning-300'
                }`}
              >
                <WarningIcon className="h-4 w-4" />
                {severe
                  ? t('admin.graceAccess.issues.title')
                  : t('admin.graceAccess.issues.titleBeforeEnabling')}
              </div>
              <ul
                className={`mt-2 space-y-1 text-sm ${
                  severe ? 'text-error-200/90' : 'text-warning-200/80'
                }`}
              >
                {data.issues.map((issue) => (
                  <li key={`${issue.field}-${issue.code}`}>· {issueText(issue)}</li>
                ))}
              </ul>
            </div>
          );
        })()}

      {/* Mode */}
      <div className="card">
        <h3 className="text-lg font-semibold text-dark-100">
          {t('admin.graceAccess.modeSection.title')}
        </h3>
        <p className="mt-1 text-sm text-dark-500">{t('admin.graceAccess.modeSection.hint')}</p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {MODES.map((mode) => {
            const selected = form.mode === mode;
            return (
              <button
                key={mode}
                type="button"
                aria-pressed={selected}
                disabled={isLocked('mode')}
                onClick={() => update('mode', mode)}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition-colors disabled:opacity-60 ${
                  selected
                    ? 'border-accent-500/50 bg-accent-500/10'
                    : 'border-dark-700/40 bg-dark-800/30 hover:border-dark-600'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    selected ? 'bg-accent-500/20 text-accent-300' : 'bg-dark-700/60 text-dark-400'
                  }`}
                >
                  {MODE_ICONS[mode]}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block text-sm font-medium ${selected ? 'text-dark-100' : 'text-dark-200'}`}
                  >
                    {t(`admin.graceAccess.modes.${mode}.label`)}
                  </span>
                  <span className="mt-0.5 block text-xs text-dark-400">
                    {t(`admin.graceAccess.modes.${mode}.desc`)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
        {restartOnly.has('mode') && (
          <p className="mt-3 text-xs text-dark-500">{t('admin.graceAccess.restartOnly')}</p>
        )}
        {lockNote('mode')}
      </div>

      {/* Health */}
      <div className="card">
        <h3 className="text-lg font-semibold text-dark-100">
          {t('admin.graceAccess.health.title')}
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <StatTile label={t('admin.graceAccess.health.open')} value={data.stats.open} />
          <StatTile
            label={t('admin.graceAccess.health.completed')}
            value={data.stats.states.completed ?? 0}
          />
          <StatTile
            label={t('admin.graceAccess.health.openErrors')}
            value={data.stats.open_errors}
            tone="error"
          />
          <StatTile
            label={t('admin.graceAccess.health.completedErrors')}
            value={data.stats.completed_errors}
            tone="error"
          />
        </div>

        {data.recent_errors.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-dark-200">
              {t('admin.graceAccess.health.recentErrors')}
            </h4>
            <ul className="mt-2 space-y-2">
              {data.recent_errors.map((row) => (
                <li
                  key={row.id}
                  className="rounded-lg border border-dark-700/40 bg-dark-800/30 p-2"
                >
                  <div className="text-xs text-dark-400">
                    {t('admin.graceAccess.health.subscription', { id: row.subscription_id })} ·{' '}
                    {t(`admin.graceAccess.sessions.states.${row.state}`, {
                      defaultValue: row.state,
                    })}
                  </div>
                  <div className="mt-0.5 break-words text-xs text-error-400">{row.last_error}</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Squads */}
      <div className="card space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-dark-100">
            {t('admin.graceAccess.squads.title')}
          </h3>
          <p className="mt-1 text-sm text-dark-500">{t('admin.graceAccess.squads.hint')}</p>
        </div>

        <SquadField
          id="grace-expired-squad"
          label={t('admin.graceAccess.fields.expired_squad_uuid')}
          description={t('admin.graceAccess.squads.expiredDesc')}
          value={form.expired_squad_uuid}
          onChange={(value) => update('expired_squad_uuid', value)}
          squads={squads?.items ?? []}
          squadsAvailable={squads?.available ?? true}
          disabled={isLocked('expired_squad_uuid')}
          invalid={invalidFields.has('expired_squad_uuid')}
        />
        {lockNote('expired_squad_uuid')}

        <SquadField
          id="grace-limited-squad"
          label={t('admin.graceAccess.fields.limited_squad_uuid')}
          description={t('admin.graceAccess.squads.limitedDesc')}
          value={form.limited_squad_uuid}
          onChange={(value) => update('limited_squad_uuid', value)}
          squads={squads?.items ?? []}
          squadsAvailable={squads?.available ?? true}
          disabled={isLocked('limited_squad_uuid')}
          invalid={invalidFields.has('limited_squad_uuid')}
        />
        {lockNote('limited_squad_uuid')}

        <div>
          <label
            htmlFor="grace-external-squad"
            className="mb-2 block text-sm font-medium text-dark-300"
          >
            {t('admin.graceAccess.fields.external_squad_uuid')}
          </label>
          <select
            id="grace-external-squad"
            className="input"
            value={externalChoice}
            disabled={isLocked('external_squad_uuid')}
            onChange={(event) => {
              const next = event.target.value as ExternalChoice;
              // The choice is its own state: "fallback squad" starts with an empty
              // box, and deriving the choice from that empty value would snap the
              // select straight back to "detach".
              setExternalChoice(next);
              if (next === 'detach') update('external_squad_uuid', '');
              if (next === 'keep') update('external_squad_uuid', EXTERNAL_KEEP);
              if (
                next === 'custom' &&
                form.external_squad_uuid.trim().toLowerCase() === EXTERNAL_KEEP
              ) {
                update('external_squad_uuid', '');
              }
            }}
          >
            <option value="detach">{t('admin.graceAccess.external.detach')}</option>
            <option value="keep">{t('admin.graceAccess.external.keep')}</option>
            <option value="custom">{t('admin.graceAccess.external.custom')}</option>
          </select>
          <p className="mt-1 text-xs text-dark-500">
            {t(`admin.graceAccess.external.${externalChoice}Desc`)}
          </p>
          {externalChoice === 'custom' && (
            <input
              id="grace-external-squad-uuid"
              type="text"
              aria-label={t('admin.graceAccess.external.custom')}
              className={`input mt-2 font-mono text-xs ${
                invalidFields.has('external_squad_uuid') || externalIncomplete
                  ? 'border-error-500/50'
                  : ''
              }`}
              placeholder="00000000-0000-0000-0000-000000000000"
              value={
                externalChoiceOf(form.external_squad_uuid) === 'keep'
                  ? ''
                  : form.external_squad_uuid
              }
              disabled={isLocked('external_squad_uuid')}
              onChange={(event) => update('external_squad_uuid', event.target.value)}
            />
          )}
          {lockNote('external_squad_uuid')}
        </div>
      </div>

      {/* Limits */}
      <div className="card">
        <h3 className="text-lg font-semibold text-dark-100">
          {t('admin.graceAccess.limits.title')}
        </h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="grace-duration"
              className="mb-2 block text-sm font-medium text-dark-300"
            >
              {t('admin.graceAccess.fields.duration_hours')}
            </label>
            <input
              id="grace-duration"
              type="number"
              min={1}
              max={8760}
              className="input"
              value={form.duration_hours}
              disabled={isLocked('duration_hours')}
              onChange={(event) => updateNumber('duration_hours', event.target.value)}
            />
            <p className="mt-1 text-xs text-dark-500">
              {t('admin.graceAccess.limits.durationDesc')}
            </p>
            {lockNote('duration_hours')}
          </div>
          <div>
            <label htmlFor="grace-traffic" className="mb-2 block text-sm font-medium text-dark-300">
              {t('admin.graceAccess.fields.traffic_gb')}
            </label>
            <input
              id="grace-traffic"
              type="number"
              min={0}
              max={1024}
              className={`input ${invalidFields.has('traffic_gb') ? 'border-error-500/50' : ''}`}
              value={form.traffic_gb}
              disabled={isLocked('traffic_gb')}
              onChange={(event) => updateNumber('traffic_gb', event.target.value)}
            />
            <p className="mt-1 text-xs text-dark-500">
              {t('admin.graceAccess.limits.trafficDesc')}
            </p>
            {lockNote('traffic_gb')}
          </div>
        </div>
      </div>

      {/* Coverage */}
      <div className="card">
        <h3 className="text-lg font-semibold text-dark-100">
          {t('admin.graceAccess.coverage.title')}
        </h3>
        <p className="mt-1 text-sm text-dark-500">{t('admin.graceAccess.coverage.hint')}</p>
        <div className="mt-4 space-y-3">
          {(['trial_enabled', 'daily_enabled', 'free_enabled'] as const).map((field) => (
            <div key={field} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-medium text-dark-100">
                  {t(`admin.graceAccess.coverage.${field}`)}
                </div>
                <div className="text-xs text-dark-500">
                  {t(`admin.graceAccess.coverage.${field}Desc`)}
                </div>
                {lockNote(field)}
              </div>
              <Toggle
                checked={form[field]}
                disabled={isLocked(field)}
                aria-label={t(`admin.graceAccess.coverage.${field}`)}
                onChange={() => update(field, !form[field])}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Reconcile */}
      <div className="card">
        <button
          type="button"
          className="flex w-full items-center justify-between text-left"
          onClick={() => setShowReconcile((current) => !current)}
          aria-expanded={showReconcile}
        >
          <span>
            <span className="block text-lg font-semibold text-dark-100">
              {t('admin.graceAccess.reconcile.title')}
            </span>
            <span className="mt-1 block text-sm text-dark-500">
              {t('admin.graceAccess.reconcile.hint')}
            </span>
          </span>
          <span className="text-sm text-accent-400">
            {showReconcile
              ? t('admin.graceAccess.reconcile.hide')
              : t('admin.graceAccess.reconcile.show')}
          </span>
        </button>

        {showReconcile && (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {(
              [
                ['reconcile_interval_seconds', 5, 86400],
                ['reconcile_batch_size', 1, 10000],
                ['candidate_lookback_minutes', 1, 10080],
              ] as const
            ).map(([field, min, max]) => (
              <div key={field}>
                <label
                  htmlFor={`grace-${field}`}
                  className="mb-2 block text-sm font-medium text-dark-300"
                >
                  {t(`admin.graceAccess.fields.${field}`)}
                </label>
                <input
                  id={`grace-${field}`}
                  type="number"
                  min={min}
                  max={max}
                  className="input"
                  value={form[field]}
                  disabled={isLocked(field)}
                  onChange={(event) => updateNumber(field, event.target.value)}
                />
                <p className="mt-1 text-xs text-dark-500">
                  {t(`admin.graceAccess.reconcile.${field}Desc`)}
                </p>
                {restartOnly.has(field) && (
                  <p className="mt-1 text-xs text-dark-500">{t('admin.graceAccess.restartOnly')}</p>
                )}
                {lockNote(field)}
              </div>
            ))}
          </div>
        )}
      </div>

      <SessionsSection />

      {/* Save */}
      <div className="sticky bottom-4 z-10">
        <div className="rounded-xl border border-dark-700/50 bg-dark-900/90 p-3 backdrop-blur">
          {(modeBlockers.length > 0 || emptyNumbers.length > 0 || externalIncomplete) && (
            <ul className="mb-2 space-y-1 text-xs text-error-400">
              {modeBlockers.map((issue) => (
                <li key={`${issue.field}-${issue.code}`}>· {issueText(issue)}</li>
              ))}
              {emptyNumbers.map((field) => (
                <li key={field}>
                  ·{' '}
                  {t('admin.graceAccess.issue.number_required', {
                    field: t(`admin.graceAccess.fields.${field}`),
                  })}
                </li>
              ))}
              {externalIncomplete && (
                <li>
                  ·{' '}
                  {t('admin.graceAccess.issue.squad_required', {
                    field: t('admin.graceAccess.fields.external_squad_uuid'),
                  })}
                </li>
              )}
            </ul>
          )}
          {saveError && <p className="mb-2 text-xs text-error-400">{saveError}</p>}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="btn-primary"
              disabled={!canEdit || !dirty || blocksSave || saveMutation.isPending}
              onClick={() => saveMutation.mutate(patch)}
            >
              {saveMutation.isPending ? t('admin.graceAccess.saving') : t('admin.graceAccess.save')}
            </button>
            <button
              type="button"
              className="btn-secondary"
              disabled={!dirty || saveMutation.isPending}
              onClick={() => {
                setSaveError(null);
                setForm(toForm(data.config));
                setExternalChoice(externalChoiceOf(data.config.external_squad_uuid));
              }}
            >
              {t('admin.graceAccess.discard')}
            </button>
            {dirty && <span className="text-xs text-dark-400">{t('admin.graceAccess.dirty')}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
