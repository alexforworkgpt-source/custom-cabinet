import { describe, expect, it } from 'vitest';
import {
  REFERRAL_REWARD_V471_FIXTURE,
  validateReferralRewardEvidence,
} from './referralRewardV471Contract';

describe('Upstream Bot v4.7.1 referral reward contract', () => {
  it('distinguishes a new referral notice from a real reward', () => {
    const { notificationTypes } = REFERRAL_REWARD_V471_FIXTURE;
    const registered = notificationTypes.find((item) => item.type === 'referral_registered');
    const reward = notificationTypes.find((item) => item.type === 'referral_bonus');

    expect(registered).toEqual({
      type: 'referral_registered',
      context_vars: ['referral_name'],
    });
    expect(reward?.context_vars).toContain('formatted_reward');
    expect(reward?.context_vars).not.toEqual(registered?.context_vars);
  });

  it.each(['create', 'update'] as const)(
    'requires the %s path to retain the local subscription and actual panel id',
    (name) => {
      const evidence = REFERRAL_REWARD_V471_FIXTURE.scenarios[name];

      expect(validateReferralRewardEvidence(evidence)).toEqual([]);
      expect(evidence.after?.subscription_id).toBe(evidence.grant.subscription_id);
      expect(evidence.after?.remnawave_id).toBe(evidence.panel.returned_remnawave_id);
    },
  );

  it('does not turn a Remnawave error into a confirmed frontend success', () => {
    const evidence = REFERRAL_REWARD_V471_FIXTURE.scenarios.remnawaveError;
    expect(validateReferralRewardEvidence(evidence)).toEqual([]);

    const falseSuccess = {
      ...evidence,
      frontend_panel_state: 'success' as const,
    };
    expect(validateReferralRewardEvidence(falseSuccess)).toContain(
      'frontend must not confirm a failed Remnawave sync',
    );
  });
});
