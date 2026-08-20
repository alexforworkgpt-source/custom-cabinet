import { describe, expect, it } from 'vitest';
import { getGlassColors } from './glassTheme';

describe('getGlassColors', () => {
  it('uses admin-controlled dark theme tokens', () => {
    const colors = getGlassColors(true);

    expect(colors.cardBg).toContain('var(--color-dark-800)');
    expect(colors.cardBorder).toContain('var(--color-dark-50)');
    expect(colors.text).toBe('rgb(var(--color-dark-50))');
    expect(colors.textSecondary).toBe('rgb(var(--color-dark-400))');
  });

  it('uses admin-controlled light theme tokens instead of fixed neutral colors', () => {
    const colors = getGlassColors(false);

    expect(colors.cardBg).toContain('var(--color-champagne-50)');
    expect(colors.cardBg).toContain('var(--color-champagne-100)');
    expect(colors.cardBorder).toContain('var(--color-champagne-950)');
    expect(colors.text).toBe('rgb(var(--color-champagne-950))');
    expect(colors.textSecondary).toBe('rgb(var(--color-champagne-600))');
  });
});
