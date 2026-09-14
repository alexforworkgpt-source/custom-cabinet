export function omitEnvLocked<T extends object>(
  values: T,
  lockedFields: Iterable<keyof T>,
): Partial<T> {
  const unlocked: Partial<T> = { ...values };

  for (const field of lockedFields) {
    delete unlocked[field];
  }

  return unlocked;
}
