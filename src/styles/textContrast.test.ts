import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = join(__dirname, '..');
const ALPHA_TEXT =
  /\btext-(dark-50|white|success-\d+|error-\d+|warning-\d+|accent-\d+)\/([0-9]{1,2})\b/g;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return /\.tsx?$/.test(path) && !/\.test\.tsx?$/.test(path) ? [path] : [];
  });
}

describe('читаемость вторичного текста', () => {
  it('не смешивает текстовый цвет с фоном ниже половины непрозрачности', () => {
    const offenders: string[] = [];
    for (const file of walk(SRC)) {
      const source = readFileSync(file, 'utf8');
      for (const match of source.matchAll(ALPHA_TEXT)) {
        if (Number(match[2]) < 50) offenders.push(`${file.replace(SRC, 'src')}: ${match[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('светлая тема использует проверенные тёмные статусные шейды', () => {
    const css = readFileSync(join(SRC, 'styles/globals.css'), 'utf8');
    for (const name of ['accent', 'success', 'warning', 'error']) {
      expect(css).toContain(`--color-${name}-400: var(--color-${name}-800) !important;`);
    }
  });
});
