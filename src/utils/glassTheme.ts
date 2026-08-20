/**
 * Theme-aware glass morphism color tokens.
 * Provides consistent colors for the glassmorphic card components
 * that work on both dark and light backgrounds.
 */
export function getGlassColors(isDark: boolean) {
  const primaryText = isDark ? 'var(--color-dark-50)' : 'var(--color-champagne-950)';

  return {
    // Card container
    cardBg: isDark
      ? 'linear-gradient(145deg, rgba(var(--color-dark-800),0.94) 0%, rgba(var(--color-dark-900),0.92) 100%)'
      : 'linear-gradient(145deg, rgba(var(--color-champagne-50),0.95) 0%, rgba(var(--color-champagne-100),0.88) 100%)',
    cardBorder: `rgba(${primaryText},${isDark ? '0.14' : '0.1'})`,

    // Inner sections (cards within cards)
    innerBg: `rgba(${primaryText},${isDark ? '0.065' : '0.03'})`,
    innerBorder: `rgba(${primaryText},${isDark ? '0.1' : '0.06'})`,

    // Hover states
    hoverBg: `rgba(${primaryText},0.05)`,
    hoverBorder: `rgba(${primaryText},${isDark ? '0.08' : '0.1'})`,

    // Text
    text: `rgb(${primaryText})`,
    textSecondary: isDark ? 'rgb(var(--color-dark-400))' : 'rgb(var(--color-champagne-600))',
    textMuted: isDark ? 'rgb(var(--color-dark-500))' : 'rgb(var(--color-champagne-500))',
    textFaint: `rgba(${primaryText},0.25)`,
    textGhost: `rgba(${primaryText},${isDark ? '0.08' : '0.06'})`,

    // Progress bar track
    trackBg: `rgba(${primaryText},0.06)`,
    trackBorder: `rgba(${primaryText},${isDark ? '0.04' : '0.06'})`,

    // Code blocks
    codeBg: `rgba(${primaryText},${isDark ? '0.03' : '0.04'})`,
    codeBorder: `rgba(${primaryText},${isDark ? '0.04' : '0.06'})`,

    // Glow effects — reduced in light mode
    glowAlpha: isDark ? '15' : '08',

    // Shadows for light mode depth
    shadow: isDark
      ? '0 14px 36px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.04)'
      : '0 2px 16px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)',
  };
}
