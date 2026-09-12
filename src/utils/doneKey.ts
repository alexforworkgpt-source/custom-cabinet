export const DONE_HINT = 'done';
export const TOUCH_ONLY_QUERY = '(hover: none) and (pointer: coarse)';

const NON_TEXT_INPUT_TYPES: ReadonlySet<string> = new Set([
  'button',
  'submit',
  'reset',
  'checkbox',
  'radio',
  'file',
  'range',
  'color',
  'hidden',
  'image',
]);

export function isSingleLineTextEntry(target: EventTarget | null): target is HTMLInputElement {
  return target instanceof HTMLInputElement && !NON_TEXT_INPUT_TYPES.has(target.type);
}

function stamp(input: HTMLInputElement): void {
  if (!isSingleLineTextEntry(input) || input.hasAttribute('enterkeyhint')) return;
  input.setAttribute('enterkeyhint', DONE_HINT);
}

export function stampEnterKeyHint(root: Node): void {
  if (root instanceof HTMLInputElement) {
    stamp(root);
    return;
  }
  if (root instanceof Element || root instanceof Document || root instanceof DocumentFragment) {
    root.querySelectorAll('input').forEach(stamp);
  }
}

export function shouldDismissOnEnter(event: KeyboardEvent): boolean {
  return (
    event.key === 'Enter' &&
    !event.isComposing &&
    !event.defaultPrevented &&
    isSingleLineTextEntry(event.target)
  );
}

type MatchMedia = (query: string) => { matches: boolean };

export function isTouchOnly(matchMedia: MatchMedia | undefined): boolean {
  return matchMedia?.(TOUCH_ONLY_QUERY).matches ?? false;
}

export interface DoneKeyOptions {
  hideKeyboard: () => void;
  root?: Document;
}

export function installDoneKey({ hideKeyboard, root = document }: DoneKeyOptions): () => void {
  stampEnterKeyHint(root);
  const observer = new MutationObserver((records) => {
    for (const record of records) record.addedNodes.forEach(stampEnterKeyHint);
  });
  observer.observe(root.documentElement, { childList: true, subtree: true });

  const onKeyDown = (event: KeyboardEvent): void => {
    const field = event.target;
    if (!isSingleLineTextEntry(field) || !shouldDismissOnEnter(event)) return;
    field.blur();
    hideKeyboard();
  };
  root.addEventListener('keydown', onKeyDown);

  return () => {
    observer.disconnect();
    root.removeEventListener('keydown', onKeyDown);
  };
}
