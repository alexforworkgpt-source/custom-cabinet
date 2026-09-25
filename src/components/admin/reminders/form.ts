export const REMINDER_LANGS = ['ru', 'en', 'ua', 'zh', 'fa'] as const;
export const CABINET_REMINDER_TARGETS = ['/profile/accounts', '/subscriptions', '/balance'];
export const REMINDER_INPUT_CLASS =
  'w-full rounded-xl border border-dark-700 bg-dark-800 px-3 py-2 text-sm text-dark-50';

export type ReminderFormError = { key: string; params?: Record<string, string> } | { text: string };

export function parseReminderInteger(value: string): number | null {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : null;
}

export function firstReminderValidationMessage(data: unknown): string | null {
  const detail = (data as { detail?: unknown } | undefined)?.detail;
  if (!Array.isArray(detail)) return null;
  const withMessage = detail.find(
    (item): item is { msg: string } => typeof (item as { msg?: unknown })?.msg === 'string',
  );
  return withMessage?.msg ?? null;
}
