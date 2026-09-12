import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('mobile fixed panels', () => {
  it('main не создаёт containing block для position: fixed', () => {
    const css = readFileSync(join(__dirname, 'globals.css'), 'utf8');
    expect(css).toMatch(/main\s*\{\s*contain:\s*style;/);
    expect(css).not.toMatch(/main\s*\{\s*contain:\s*content;/);
  });

  it.each([
    '../components/layout/AppShell/MobileBottomNav.tsx',
    '../components/admin/bulkActions/FloatingActionBar.tsx',
    '../pages/QuickPurchase.tsx',
  ])('%s скрывается по общему сигналу экранной клавиатуры', (relativePath) => {
    const source = readFileSync(join(__dirname, relativePath), 'utf8');
    expect(source).toContain('useVirtualKeyboard()');
    expect(source).toContain('HIDDEN_UNDER_KEYBOARD');
  });
});
