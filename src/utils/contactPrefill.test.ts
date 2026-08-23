import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  captureContactPrefillFromUrl,
  readContactPrefill,
  stripContactFromUrl,
} from './contactPrefill';

const STORAGE_KEY = 'lp_contact_promo';

let replaced: string[] = [];

function fakeLocalStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => store.clear(),
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => void store.delete(key),
    setItem: (key: string, value: string) => void store.set(key, value),
  } as Storage;
}

function stubLocation(search: string, pathname = '/buy/promo', hash = ''): void {
  vi.stubGlobal('window', {
    location: { search, pathname, hash },
    history: {
      replaceState: (_state: unknown, _title: string, url: string) => replaced.push(url),
    },
  });
}

beforeEach(() => {
  replaced = [];
  vi.stubGlobal('localStorage', fakeLocalStorage());
  stubLocation('');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('captureContactPrefillFromUrl', () => {
  it('stores an email under the current landing key before cleaning the URL', () => {
    stubLocation('?contact=client%40example.com');

    captureContactPrefillFromUrl();

    expect(localStorage.getItem(STORAGE_KEY)).toBe('client@example.com');
    expect(replaced).toEqual(['/buy/promo']);
  });

  it('preserves a Telegram username', () => {
    stubLocation('?contact=%40durov');

    captureContactPrefillFromUrl();

    expect(localStorage.getItem(STORAGE_KEY)).toBe('@durov');
  });

  it('lets a URL contact replace the remembered value', () => {
    localStorage.setItem(STORAGE_KEY, 'old@example.com');
    stubLocation('?contact=new%40example.com');

    captureContactPrefillFromUrl();

    expect(localStorage.getItem(STORAGE_KEY)).toBe('new@example.com');
  });

  it('keeps the remembered value when contact is absent', () => {
    localStorage.setItem(STORAGE_KEY, 'old@example.com');
    stubLocation('?campaign=summer');

    captureContactPrefillFromUrl();

    expect(localStorage.getItem(STORAGE_KEY)).toBe('old@example.com');
    expect(replaced).toEqual([]);
  });

  it('removes only contact while preserving other query values and hash', () => {
    stubLocation(
      '?campaign=summer&contact=client%40example.com&subid=42',
      '/buy/promo',
      '#tariffs',
    );

    captureContactPrefillFromUrl();

    expect(replaced).toEqual(['/buy/promo?campaign=summer&subid=42#tariffs']);
  });

  it('keeps the captured contact available after cleanup when storage is unavailable', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {
        throw new Error('storage blocked');
      },
    });
    stubLocation('?contact=client%40example.com&subid=42');

    captureContactPrefillFromUrl();
    stubLocation('?subid=42');

    expect(replaced).toEqual(['/buy/promo?subid=42']);
    expect(readContactPrefill(STORAGE_KEY)).toBe('client@example.com');
  });

  it('does not remove contact outside a quick-purchase route', () => {
    stubLocation('?contact=client%40example.com', '/login');

    captureContactPrefillFromUrl();

    expect(replaced).toEqual([]);
  });
});

describe('readContactPrefill', () => {
  it('prefers an email from the URL over the remembered value', () => {
    localStorage.setItem(STORAGE_KEY, 'old@example.com');
    stubLocation('?contact=new%40example.com');

    expect(readContactPrefill(STORAGE_KEY)).toBe('new@example.com');
  });

  it('keeps the @ prefix from the URL', () => {
    stubLocation('?contact=%40durov');

    expect(readContactPrefill(STORAGE_KEY)).toBe('@durov');
  });

  it('reads the value retained under the existing landing key', () => {
    localStorage.setItem(STORAGE_KEY, 'old@example.com');

    expect(readContactPrefill(STORAGE_KEY)).toBe('old@example.com');
  });

  it('returns an empty string when no prefill exists', () => {
    expect(readContactPrefill(STORAGE_KEY)).toBe('');
  });
});

describe('stripContactFromUrl', () => {
  it('does not rewrite a URL without contact', () => {
    stubLocation('?campaign=summer', '/buy/promo', '#tariffs');

    stripContactFromUrl();

    expect(replaced).toEqual([]);
  });
});

describe('client bootstrap privacy ordering', () => {
  const source = readFileSync(new URL('../main.tsx', import.meta.url), 'utf8');

  it('captures contact before auth and health can issue API requests', () => {
    const captureIndex = source.indexOf('captureContactPrefillFromUrl();');

    expect(captureIndex).toBeGreaterThan(-1);
    expect(captureIndex).toBeLessThan(source.indexOf('useAuthStore.getState().initialize()'));
    expect(captureIndex).toBeLessThan(source.indexOf('checkBackendOnStartup()'));
  });
});
