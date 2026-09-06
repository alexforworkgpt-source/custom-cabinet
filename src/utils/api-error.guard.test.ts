import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

/**
 * Сторож: detail с бэка нельзя класть в текст как есть.
 * Единая точка разбора — getApiErrorMessage.
 */

const SRC = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW_DETAIL_FALLBACK = /\.data\??\.detail\s*(\|\||\?\?(?!\s*null))/;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

describe('сырой detail не попадает в текст ошибки', () => {
  it('нигде в src нет идиомы `data?.detail || fallback`', () => {
    const offenders = walk(SRC)
      .filter((file) => RAW_DETAIL_FALLBACK.test(readFileSync(file, 'utf8')))
      .map((file) => relative(SRC, file));
    expect(offenders).toEqual([]);
  });
});
