import { type ActivityEvent, activityApi } from '@/api/activity';

const FLUSH_DELAY_MS = 700;
const BATCH_MAX = 20;
const LABEL_MAX = 80;
const SCREEN_REPEAT_WINDOW_MS = 1500;

const CLICKABLE_SELECTOR = [
  '[data-track]',
  'button',
  'a',
  'summary',
  'label',
  'select',
  'input[type="checkbox"]',
  'input[type="radio"]',
  'input[type="submit"]',
  'input[type="button"]',
  '[role="button"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="switch"]',
  '[role="checkbox"]',
  '[role="option"]',
  '[role="link"]',
].join(', ');

const TYPING_SELECTOR =
  'input:not([type="checkbox"]):not([type="radio"]):not([type="submit"]):not([type="button"]), textarea, [contenteditable="true"]';

let queue: ActivityEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let lastScreen: { path: string; at: number } | null = null;

export const isTrackablePath = (pathname: string): boolean => !pathname.startsWith('/admin');

const compact = (text: string | null | undefined): string =>
  (text ?? '').replace(/\s+/g, ' ').trim().slice(0, LABEL_MAX);

export function resolveClickLabel(target: EventTarget | null): string | null {
  if (!(target instanceof Element)) return null;
  if (target.closest('[data-track-ignore]') || target.closest(TYPING_SELECTOR)) return null;
  const element = target.closest<HTMLElement>(CLICKABLE_SELECTOR);
  if (!element) return null;

  const candidates = [
    element.getAttribute('data-track'),
    element.getAttribute('aria-label'),
    element.getAttribute('title'),
    element.textContent,
    element.querySelector('img[alt]')?.getAttribute('alt'),
    element.querySelector('svg title')?.textContent,
    element.getAttribute('name'),
  ];
  for (const candidate of candidates) {
    const label = compact(candidate);
    if (label) return label;
  }
  return `[${element.tagName.toLowerCase()}]`;
}

function flush(): void {
  if (timer) clearTimeout(timer);
  timer = null;
  if (queue.length === 0) return;
  const batch = queue;
  queue = [];
  void activityApi.sendEvents(batch);
}

function enqueue(event: ActivityEvent): void {
  queue = [...queue, event];
  if (queue.length >= BATCH_MAX) {
    flush();
  } else if (!timer) {
    timer = setTimeout(flush, FLUSH_DELAY_MS);
  }
}

export function trackScreen(pathname: string): void {
  if (!isTrackablePath(pathname)) return;
  const now = Date.now();
  if (lastScreen?.path === pathname && now - lastScreen.at < SCREEN_REPEAT_WINDOW_MS) return;
  lastScreen = { path: pathname, at: now };
  enqueue({ kind: 'screen', path: pathname });
}

export function trackClick(target: EventTarget | null, pathname: string): void {
  if (!isTrackablePath(pathname)) return;
  const label = resolveClickLabel(target);
  if (label) enqueue({ kind: 'click', path: pathname, label });
}

export function installClickTracker(getPathname: () => string): () => void {
  const onClick = (event: MouseEvent) => trackClick(event.target, getPathname());
  const onHide = () => {
    if (document.visibilityState === 'hidden') flush();
  };
  document.addEventListener('click', onClick, true);
  document.addEventListener('visibilitychange', onHide);
  window.addEventListener('pagehide', flush);
  return () => {
    document.removeEventListener('click', onClick, true);
    document.removeEventListener('visibilitychange', onHide);
    window.removeEventListener('pagehide', flush);
    flush();
  };
}

export function resetActivityTracker(): void {
  if (timer) clearTimeout(timer);
  timer = null;
  queue = [];
  lastScreen = null;
}
