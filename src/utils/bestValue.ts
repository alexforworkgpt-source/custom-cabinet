export interface Highlightable {
  is_highlighted?: boolean | null;
}

/** Возвращает первый вариант, который оператор явно отметил как выгодный. */
export function pickBestValue<T extends Highlightable>(
  items: readonly T[] | null | undefined,
): T | undefined {
  return items?.find((item) => Boolean(item.is_highlighted));
}
