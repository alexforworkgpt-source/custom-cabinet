import { describe, expect, it } from 'vitest';
import {
  getAdminSubscriptionDeletionDecision,
  getAdminSubscriptionDeletionErrorMessage,
} from './adminSubscriptionDeletion';

describe('getAdminSubscriptionDeletionDecision', () => {
  it.each([
    ['active trial', { id: 1, tariff_name: 'Trial', is_active: true, is_trial: true }],
    ['expired paid', { id: 2, tariff_name: 'Pro', is_active: false, is_trial: false }],
  ])('uses ordinary confirmation without force for %s', (_label, subscription) => {
    expect(getAdminSubscriptionDeletionDecision(subscription)).toEqual({
      confirmation: 'ordinary',
      force: false,
      subscriptionName: subscription.tariff_name,
    });
  });

  it('requires a separate destructive confirmation for an active paid subscription', () => {
    expect(
      getAdminSubscriptionDeletionDecision({
        id: 7,
        tariff_name: 'Premium Year',
        is_active: true,
        is_trial: false,
      }),
    ).toEqual({
      confirmation: 'destructive',
      force: true,
      subscriptionName: 'Premium Year',
    });
  });

  it('uses the subscription id when the tariff name is absent', () => {
    expect(
      getAdminSubscriptionDeletionDecision({
        id: 9,
        tariff_name: null,
        is_active: true,
        is_trial: false,
      }).subscriptionName,
    ).toBe('#9');
  });
});

describe('getAdminSubscriptionDeletionErrorMessage', () => {
  const messages = {
    conflict: 'Subscription cannot be deleted in its current state',
    fallback: 'Delete failed',
    notFound: 'Subscription was not found',
  };

  const axiosError = (status: number, detail?: string) => ({
    isAxiosError: true,
    response: { status, data: detail ? { detail } : {} },
  });

  it('shows backend detail for a 409 response', () => {
    expect(
      getAdminSubscriptionDeletionErrorMessage(
        axiosError(409, 'Active paid subscription requires force'),
        messages,
      ),
    ).toBe('Active paid subscription requires force');
  });

  it('uses a conflict fallback for a 409 without detail', () => {
    expect(getAdminSubscriptionDeletionErrorMessage(axiosError(409), messages)).toBe(
      messages.conflict,
    );
  });

  it('uses a not-found fallback for a 404 without detail', () => {
    expect(getAdminSubscriptionDeletionErrorMessage(axiosError(404), messages)).toBe(
      messages.notFound,
    );
  });

  it('uses the generic fallback for other errors', () => {
    expect(getAdminSubscriptionDeletionErrorMessage(new Error('network'), messages)).toBe(
      messages.fallback,
    );
  });
});
