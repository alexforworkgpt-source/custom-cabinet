/**
 * Config-driven connection actions are required to complete setup, so every
 * block style renders them through the canonical primary button treatment.
 */
export function blockButtonClass(_variant: 'light' | 'subtle', _isLight?: boolean): string {
  return 'btn-primary w-full justify-center';
}
