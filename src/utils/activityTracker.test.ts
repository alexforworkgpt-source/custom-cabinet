// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { ActivityEvent } from '@/api/activity';

const sent: ActivityEvent[][] = [];
vi.mock('@/api/activity', () => ({
  activityApi: {
    sendEvents: (events: ActivityEvent[]) => {
      sent.push(events);
      return Promise.resolve();
    },
  },
}));

import {
  resetActivityTracker,
  resolveClickLabel,
  trackClick,
  trackScreen,
} from './activityTracker';

function mount(html: string): HTMLElement {
  document.body.innerHTML = html;
  return document.body.firstElementChild as HTMLElement;
}

beforeEach(() => {
  vi.useFakeTimers();
  resetActivityTracker();
  sent.length = 0;
});

afterEach(() => vi.useRealTimers());

it('does not collect text fields or explicitly ignored controls', () => {
  expect(resolveClickLabel(mount('<input type="text" value="secret">'))).toBeNull();
  const ignored = mount('<div data-track-ignore><button>Секретная</button></div>');
  expect(resolveClickLabel(ignored.querySelector('button'))).toBeNull();
});

it('batches safe screen and click labels while excluding admin routes', () => {
  trackScreen('/subscription');
  trackClick(mount('<button>Скопировать ключ</button>'), '/subscription');
  trackScreen('/admin/users');
  trackClick(mount('<button>Удалить</button>'), '/admin/users');

  expect(sent).toEqual([]);
  vi.runAllTimers();
  expect(sent).toEqual([
    [
      { kind: 'screen', path: '/subscription' },
      { kind: 'click', path: '/subscription', label: 'Скопировать ключ' },
    ],
  ]);
});
