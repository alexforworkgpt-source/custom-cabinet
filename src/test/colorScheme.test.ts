import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import htmlSource from '../../index.html?raw';

const globalsCss = readFileSync(new URL('../styles/globals.css', import.meta.url), 'utf8');

describe('color-scheme страницы', () => {
  it('index.html объявляет обе схемы и привязывает их к классу темы до загрузки CSS', () => {
    expect(htmlSource).toMatch(/<meta\s+name="color-scheme"\s+content="dark light"\s*\/?>/);
    expect(htmlSource).toMatch(/html\.dark\s*{\s*color-scheme:\s*dark;?\s*}/);
    expect(htmlSource).toMatch(/html\.light\s*{\s*color-scheme:\s*light;?\s*}/);
  });

  it('globals.css держит схему за классом темы и после загрузки приложения', () => {
    expect(globalsCss).toMatch(/\.dark\s*{\s*color-scheme:\s*dark;?\s*}/);
    expect(globalsCss).toMatch(/\.light\s*{\s*color-scheme:\s*light;?\s*}/);
  });
});
