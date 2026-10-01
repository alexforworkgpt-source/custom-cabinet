import { useEffect, useState } from 'react';
import type { RenewalOption, Subscription } from '../types';
import { pickBestValue } from '../utils/bestValue';
import {
  readRenewalSelection,
  renewalSignature,
  saveRenewalSelection,
} from '../utils/renewalSelection';

export function useRenewalSelection(
  userId: number | undefined,
  subId: number | undefined,
  subscription: Subscription | null,
  salesMode: string | undefined,
  options: RenewalOption[] | undefined,
  ready: boolean,
) {
  const identity = `${userId}:${subId}`;
  const signature = subscription && salesMode ? renewalSignature(subscription, salesMode) : '';
  const [choice, setChoice] = useState<{
    identity: string;
    period: number | null;
    signature: string;
  }>({ identity: '', period: null, signature: '' });
  const [resetIdentity, setResetIdentity] = useState<string | null>(null);
  const selectedPeriod =
    choice.identity === identity && choice.signature === signature ? choice.period : null;

  useEffect(() => {
    if (!ready || !subId || !options || !signature) return;
    const saved = userId ? readRenewalSelection(userId, subId) : null;
    const current = choice.identity === identity ? choice : null;
    const period = current?.period ?? saved?.periodDays;
    const previousSignature = current?.period ? current.signature : saved?.signature;
    if (
      period != null &&
      (previousSignature !== signature || !options.some((option) => option.period_days === period))
    ) {
      if (userId) saveRenewalSelection(userId, subId, null);
      setChoice({ identity, period: null, signature });
      setResetIdentity(identity);
      return;
    }
    if (!current || current.signature !== signature) {
      setChoice({
        identity,
        period: period ?? pickBestValue(options)?.period_days ?? null,
        signature,
      });
    }
  }, [ready, subId, userId, options, signature, identity, choice]);

  const selectPeriod = (period: number) => {
    if (!ready || !subId || !options?.some((option) => option.period_days === period)) return;
    setChoice({ identity, period, signature });
    setResetIdentity(null);
    if (userId) saveRenewalSelection(userId, subId, { periodDays: period, signature });
  };
  const clearSelection = () => {
    if (userId && subId) saveRenewalSelection(userId, subId, null);
    setChoice({ identity, period: null, signature });
  };
  return {
    selectedPeriod,
    selectPeriod,
    clearSelection,
    selectionReset: resetIdentity === identity,
  };
}
