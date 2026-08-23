import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const retrieveRawInitData = vi.fn<() => string | undefined>();

vi.mock('@telegram-apps/sdk-react', () => ({
  retrieveRawInitData: () => retrieveRawInitData(),
}));

const { getTelegramInitData } = await import('./telegramInitData');

function initData(authDate: number): string {
  const user = encodeURIComponent(JSON.stringify({ id: 1, first_name: 'A' }));
  return `user=${user}&auth_date=${authDate}&signature=s&hash=h${authDate}`;
}

const OLD = initData(1_700_000_000);
const FRESH = initData(1_755_000_000);

function setBridge(value: string | undefined): void {
  vi.stubGlobal('window', value === undefined ? {} : { Telegram: { WebApp: { initData: value } } });
}

beforeEach(() => {
  retrieveRawInitData.mockReset();
  setBridge(undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('getTelegramInitData', () => {
  it('uses the Telegram bridge when it is the only source', () => {
    setBridge(FRESH);
    retrieveRawInitData.mockReturnValue(undefined);

    expect(getTelegramInitData()).toBe(FRESH);
  });

  it('falls back to the SDK when the bridge is unavailable', () => {
    retrieveRawInitData.mockReturnValue(FRESH);

    expect(getTelegramInitData()).toBe(FRESH);
  });

  it('prefers a fresh bridge value over stale SDK cache', () => {
    setBridge(FRESH);
    retrieveRawInitData.mockReturnValue(OLD);

    expect(getTelegramInitData()).toBe(FRESH);
  });

  it('prefers a fresh SDK value over a stale bridge value', () => {
    setBridge(OLD);
    retrieveRawInitData.mockReturnValue(FRESH);

    expect(getTelegramInitData()).toBe(FRESH);
  });

  it('keeps the bridge value when auth_date is equal', () => {
    const bridgeCopy = `${FRESH}&tgWebAppBotInline=0`;
    setBridge(bridgeCopy);
    retrieveRawInitData.mockReturnValue(FRESH);

    expect(getTelegramInitData()).toBe(bridgeCopy);
  });

  it('tolerates malformed auth_date values', () => {
    setBridge('user=%7B%7D&auth_date=not-a-number&hash=bridge');
    retrieveRawInitData.mockReturnValue('auth_date=%&hash=sdk');

    expect(getTelegramInitData()).toBe('user=%7B%7D&auth_date=not-a-number&hash=bridge');
  });

  it('falls back to the SDK when reading the bridge throws', () => {
    vi.stubGlobal('window', {
      Telegram: {
        WebApp: {
          get initData() {
            throw new Error('bridge unavailable');
          },
        },
      },
    });
    retrieveRawInitData.mockReturnValue(FRESH);

    expect(getTelegramInitData()).toBe(FRESH);
  });

  it('survives the SDK throwing outside Telegram', () => {
    setBridge(FRESH);
    retrieveRawInitData.mockImplementation(() => {
      throw new Error('LaunchParamsRetrieveError');
    });

    expect(getTelegramInitData()).toBe(FRESH);
  });

  it('returns null when neither source has init data', () => {
    retrieveRawInitData.mockImplementation(() => {
      throw new Error('LaunchParamsRetrieveError');
    });

    expect(getTelegramInitData()).toBeNull();
  });
});

describe('Telegram init data integration', () => {
  it('keeps SDK cache access inside the freshness helper', async () => {
    const { readdirSync, readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const { fileURLToPath } = await import('node:url');
    const srcDir = fileURLToPath(new URL('..', import.meta.url));
    const offenders: string[] = [];

    const walk = (dir: string): void => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (
          /\.tsx?$/.test(entry.name) &&
          !fullPath.endsWith(join('utils', 'telegramInitData.ts')) &&
          !fullPath.endsWith(join('utils', 'telegramInitData.test.ts')) &&
          readFileSync(fullPath, 'utf8').includes('retrieveRawInitData')
        ) {
          offenders.push(fullPath.slice(srcDir.length));
        }
      }
    };

    walk(srcDir);
    expect(offenders).toEqual([]);
  });
});
