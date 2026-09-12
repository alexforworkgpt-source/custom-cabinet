import { useSyncExternalStore } from 'react';

type Listener = () => void;

export const HIDDEN_UNDER_KEYBOARD = 'pointer-events-none opacity-0';

let open = false;
let listeners: readonly Listener[] = [];

export function isTextEntry(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable === true
  );
}

function setOpen(next: boolean): void {
  if (next === open) return;
  open = next;
  for (const listener of listeners) listener();
}

function onFocusIn(event: FocusEvent): void {
  if (isTextEntry(event.target)) setOpen(true);
}

function onFocusOut(event: FocusEvent): void {
  if (!isTextEntry(event.relatedTarget)) setOpen(false);
}

function subscribe(listener: Listener): () => void {
  if (listeners.length === 0) {
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
  }
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((known) => known !== listener);
    if (listeners.length === 0) {
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    }
  };
}

const getSnapshot = (): boolean => open;
const getServerSnapshot = (): boolean => false;

export function useVirtualKeyboard(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function resetVirtualKeyboard(): void {
  setOpen(false);
}
