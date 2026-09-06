export function NumberField({
  label,
  value,
  disabled,
  max,
  scale = 1,
  onCommit,
  onInvalid,
}: {
  label: string;
  value: number | string;
  disabled?: boolean;
  /** Upper bound; values above it are rejected with a message. */
  max?: number;
  /** 1 for plain integers, 100 for money entered in rubles and stored in kopeks. */
  scale?: number;
  /** Receives the parsed value, or null for "not granted". */
  onCommit: (parsed: number | null) => void;
  onInvalid: (message: string) => void;
}) {
  return (
    <label className="mb-2 block">
      <span className="mb-1 block text-xs text-dark-500">{label}</span>
      <input
        // Remounted whenever the server value changes, so a normalized or
        // rejected entry is replaced by what was actually stored. An uncontrolled
        // input without this keeps showing whatever the admin typed, which reads
        // as "saved" when nothing was.
        key={String(value)}
        type="text"
        inputMode="decimal"
        defaultValue={String(value)}
        disabled={disabled}
        // Committed on blur rather than per keystroke: each save is a round trip
        // that re-renders the whole list, and firing one per character would both
        // hammer the API and fight the cursor.
        onBlur={(e) => {
          const raw = e.target.value.trim().replace(',', '.');
          // Empty means "not granted" — the same as zero. Without this the field
          // could not be cleared at all and the level kept paying the old value.
          if (raw === '') return onCommit(null);

          const parsed = Number(raw);
          if (!Number.isFinite(parsed) || parsed < 0) {
            return onInvalid(label);
          }
          const stored = Math.round(parsed * scale);
          if (!Number.isSafeInteger(stored) || (max !== undefined && stored > max)) {
            return onInvalid(label);
          }
          onCommit(stored || null);
        }}
        className="w-full rounded-lg border border-dark-700 bg-dark-800 px-3 py-2 text-dark-100 disabled:opacity-40"
      />
    </label>
  );
}

export function TariffSelect({
  label,
  value,
  options,
  disabled,
  noneLabel,
  onChange,
}: {
  label: string;
  value: number | null;
  options: { id: number; name: string }[];
  disabled?: boolean;
  noneLabel: string;
  onChange: (tariffId: number | null) => void;
}) {
  return (
    <label className="mt-2 block">
      <span className="mb-1 block text-xs text-dark-500">{label}</span>
      <select
        value={value ?? ''}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        className="w-full rounded-lg border border-dark-700 bg-dark-800 px-3 py-2 text-dark-100 disabled:opacity-40"
      >
        <option value="">{noneLabel}</option>
        {options.map((tariff) => (
          <option key={tariff.id} value={tariff.id}>
            {tariff.name}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * The tariff assigned to a level may since have been deactivated, and the list of
 * selectable tariffs only carries active ones. Without adding it back the select
 * falls to its empty option and reads as "no tariff" — an admin would clear a
 * working setting without noticing.
 */
export function withAssigned(
  options: { id: number; name: string }[],
  assignedId: number | null,
  assignedName?: string | null,
): { id: number; name: string }[] {
  if (!assignedId || options.some((tariff) => tariff.id === assignedId)) return options;
  return [{ id: assignedId, name: assignedName || `#${assignedId}` }, ...options];
}
