/**
 * Stable observations for the later disposable-runtime check in Issue 10.
 *
 * This is deliberately test-only: it records the public outcomes expected from
 * the exact Upstream Bot v4.7.1 tag, but does not pretend that a frontend mock
 * has executed its Python reward engine or contacted Remnawave.
 */

export interface ReferralNotificationContract {
  type: 'referral_registered' | 'referral_bonus';
  context_vars: string[];
}

export interface RewardSubscriptionState {
  subscription_id: number;
  remnawave_id: number | null;
  end_date: string;
}

export interface ReferralRewardEvidence {
  name: 'create' | 'update' | 'remnawave-error';
  requested_days: number;
  before: RewardSubscriptionState | null;
  grant: {
    days: number;
    subscription_id: number | null;
    failure: string | null;
  };
  panel: {
    operation: 'created' | 'updated' | 'error';
    returned_remnawave_id: number | null;
  };
  after: RewardSubscriptionState | null;
  frontend_panel_state: 'success' | 'error' | 'not-shown';
}

const notificationTypes: ReferralNotificationContract[] = [
  {
    type: 'referral_registered',
    context_vars: ['referral_name'],
  },
  {
    type: 'referral_bonus',
    context_vars: [
      'formatted_bonus',
      'bonus_rubles',
      'referral_name',
      'formatted_reward',
      'bonus_days',
      'tariff_name',
      'level',
    ],
  },
];

export const REFERRAL_REWARD_V471_FIXTURE = {
  upstreamBot: {
    tag: 'v4.7.1',
    sha: 'cd903b7cfd3bac6e08e571904662c88e8c151d1d',
  },
  notificationTypes,
  scenarios: {
    create: {
      name: 'create',
      requested_days: 7,
      before: null,
      grant: { days: 7, subscription_id: 101, failure: null },
      panel: { operation: 'created', returned_remnawave_id: 901 },
      after: {
        subscription_id: 101,
        remnawave_id: 901,
        end_date: '2026-09-17T00:00:00Z',
      },
      frontend_panel_state: 'not-shown',
    },
    update: {
      name: 'update',
      requested_days: 7,
      before: {
        subscription_id: 202,
        remnawave_id: 902,
        end_date: '2026-09-10T00:00:00Z',
      },
      grant: { days: 7, subscription_id: 202, failure: null },
      panel: { operation: 'updated', returned_remnawave_id: 902 },
      after: {
        subscription_id: 202,
        remnawave_id: 902,
        end_date: '2026-09-17T00:00:00Z',
      },
      frontend_panel_state: 'not-shown',
    },
    remnawaveError: {
      name: 'remnawave-error',
      requested_days: 7,
      before: {
        subscription_id: 303,
        remnawave_id: null,
        end_date: '2026-09-10T00:00:00Z',
      },
      // v4.7.1 intentionally preserves already-committed days when the panel is
      // unavailable; linkage is still unconfirmed and must be checked separately.
      grant: { days: 7, subscription_id: 303, failure: null },
      panel: { operation: 'error', returned_remnawave_id: null },
      after: {
        subscription_id: 303,
        remnawave_id: null,
        end_date: '2026-09-17T00:00:00Z',
      },
      frontend_panel_state: 'error',
    },
  },
} satisfies {
  upstreamBot: { tag: string; sha: string };
  notificationTypes: ReferralNotificationContract[];
  scenarios: Record<string, ReferralRewardEvidence>;
};

export function validateReferralRewardEvidence(evidence: ReferralRewardEvidence): string[] {
  const errors: string[] = [];
  const { before, after, grant, panel } = evidence;

  if (evidence.name === 'create' && before !== null) {
    errors.push('create path must start without a subscription');
  }
  if (evidence.name === 'update' && before === null) {
    errors.push('update path must start with a subscription');
  }
  if (grant.days !== evidence.requested_days || grant.failure !== null) {
    errors.push('reward grant must preserve the requested days without a failure');
  }
  if (after === null || grant.subscription_id !== after.subscription_id) {
    errors.push('grant must point to the observed subscription');
  }

  if (evidence.name === 'update' && before && after) {
    if (after.subscription_id !== before.subscription_id) {
      errors.push('update path must retain the existing subscription');
    }
    if (Date.parse(after.end_date) <= Date.parse(before.end_date)) {
      errors.push('update path must extend the existing subscription');
    }
  }

  if (panel.operation === 'error') {
    if (evidence.frontend_panel_state === 'success') {
      errors.push('frontend must not confirm a failed Remnawave sync');
    }
    if (panel.returned_remnawave_id !== null) {
      errors.push('failed Remnawave sync cannot return a confirmed panel id');
    }
    return errors;
  }

  if (panel.returned_remnawave_id === null || after?.remnawave_id !== panel.returned_remnawave_id) {
    errors.push('subscription must retain the actual Remnawave id');
  }
  if (evidence.name === 'create' && panel.operation !== 'created') {
    errors.push('new subscription must use the create path');
  }
  if (evidence.name === 'update' && panel.operation !== 'updated') {
    errors.push('existing linked subscription must use the update path');
  }

  return errors;
}
