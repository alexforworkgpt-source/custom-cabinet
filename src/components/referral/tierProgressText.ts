import type { ReferralTerms } from '@/types';

export function tierProgressText(
  terms: Pick<
    ReferralTerms,
    'levels_mode' | 'tier_current_level' | 'tier_next_level' | 'tier_next_remaining'
  >,
  t: (key: string, options?: Record<string, unknown>) => string,
): string | null {
  if (terms.levels_mode !== 'tiers') return null;
  if (terms.tier_current_level == null) return t('referral.terms.tierNone');
  if (terms.tier_next_level == null) return null;
  return t('referral.terms.tierNext', {
    level: terms.tier_next_level,
    count: terms.tier_next_remaining ?? 0,
  });
}
