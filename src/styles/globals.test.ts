import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const globalsCss = readFileSync(new URL('./globals.css', import.meta.url), 'utf8');

describe('legacy primary button theme contract', () => {
  it('uses semantic accent tokens in the light theme', () => {
    const lightPrimaryRule = globalsCss.match(/\.light \.btn-primary\s*{([^}]*)}/)?.[1];

    expect(lightPrimaryRule).toBeDefined();
    expect(lightPrimaryRule).toContain('bg-accent-500');
    expect(lightPrimaryRule).toContain('text-on-accent');
    expect(lightPrimaryRule).toContain('hover:bg-accent-600');
    expect(lightPrimaryRule).toContain('active:bg-accent-700');
    expect(lightPrimaryRule).toContain('focus-visible:ring-accent-500');
    expect(lightPrimaryRule).toContain('shadow-accent-500');
    expect(lightPrimaryRule).not.toContain('champagne');
  });
});

describe('connect device button theme contract', () => {
  it('combines the original animated border with the 95% accent background', () => {
    const connectButtonRule = globalsCss.match(/\.connect-device-gradient-button\s*{([^}]*)}/)?.[1];

    expect(connectButtonRule).toBeDefined();
    expect(connectButtonRule).toContain('--border-inner-bg: rgba(var(--color-accent-500), 0.95)');
    expect(connectButtonRule).toContain('--_accent: rgba(var(--color-on-accent), 0.8)');
  });
});

describe('global background grid contract', () => {
  it('keeps the grid visible in dark and light themes', () => {
    const darkBodyRule = globalsCss.match(/body,\s*\.dark body\s*{([^}]*)}/)?.[1];
    const lightBodyRule = globalsCss.match(/\.light body\s*{([^}]*)}/)?.[1];

    expect(darkBodyRule).toBeDefined();
    expect(darkBodyRule).toContain('--app-grid-line: rgba(255, 255, 255, 0.06)');
    expect(darkBodyRule).toContain('background-image:');
    expect(darkBodyRule).toContain('background-size: 32px 32px');

    expect(lightBodyRule).toBeDefined();
    expect(lightBodyRule).toContain('--app-grid-line: rgba(10, 10, 10, 0.06)');
  });
});
