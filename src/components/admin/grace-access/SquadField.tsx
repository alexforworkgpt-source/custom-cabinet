import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { GraceSquadOption } from '@/api/adminGraceAccess';

export function SquadField({
  id,
  label,
  description,
  value,
  onChange,
  squads,
  squadsAvailable,
  disabled,
  invalid,
}: {
  id: string;
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  squads: GraceSquadOption[];
  squadsAvailable: boolean;
  disabled: boolean;
  invalid: boolean;
}) {
  const { t } = useTranslation();
  const [manualOverride, setManualOverride] = useState(false);

  const listed = squads.some((squad) => squad.uuid === value);
  // Derived, not synchronised: the squad list arrives after the first render, and
  // a state seeded from the empty list would leave a configured-but-unlisted UUID
  // showing as "not chosen" — one save away from being dropped.
  const manual = manualOverride || (!listed && value.trim() !== '');
  const usePicker = squadsAvailable && squads.length > 0 && !manual;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-dark-300">
        {label}
      </label>
      {usePicker ? (
        <select
          id={id}
          className={`input ${invalid ? 'border-error-500/50' : ''}`}
          value={listed ? value : ''}
          disabled={disabled}
          onChange={(event) => {
            if (event.target.value === '__manual__') {
              setManualOverride(true);
              return;
            }
            onChange(event.target.value);
          }}
        >
          <option value="">{t('admin.graceAccess.squads.choose')}</option>
          {squads.map((squad) => (
            <option key={squad.uuid} value={squad.uuid}>
              {squad.name} · {t('admin.graceAccess.squads.members', { n: squad.members_count })}
            </option>
          ))}
          <option value="__manual__">{t('admin.graceAccess.squads.manual')}</option>
        </select>
      ) : (
        <input
          id={id}
          type="text"
          className={`input font-mono text-xs ${invalid ? 'border-error-500/50' : ''}`}
          placeholder="00000000-0000-0000-0000-000000000000"
          value={value}
          disabled={disabled}
          onChange={(event) => {
            // Clearing the box is the way back to the list; without it a manual
            // entry is a one-way door.
            if (event.target.value === '') setManualOverride(false);
            onChange(event.target.value);
          }}
        />
      )}
      <p className="mt-1 text-xs text-dark-500">{description}</p>
      {!squadsAvailable && (
        <p className="mt-1 text-xs text-warning-400">{t('admin.graceAccess.squads.unavailable')}</p>
      )}
    </div>
  );
}
