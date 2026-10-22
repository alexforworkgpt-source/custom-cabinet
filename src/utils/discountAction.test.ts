import { describe, expect, it } from 'vitest';
import { resolveDiscountAction, type DiscountNavigationContext } from './discountAction';

const context = {
  subscriptions: [{ id: 42, is_trial: false }],
  subscription: { id: 42, status: 'active', is_trial: false, is_limited: false, is_daily: false },
} satisfies DiscountNavigationContext;

describe('active discount destination', () => {
  it('opens first purchase only for a confirmed empty account', () => {
    expect(resolveDiscountAction({ subscriptions: [], subscription: null })).toMatchObject({
      kind: 'purchase',
      path: '/subscription/purchase',
    });
    expect(resolveDiscountAction({ subscriptions: undefined, subscription: null })).toEqual({
      kind: 'loading',
    });
    expect(
      resolveDiscountAction({ subscriptions: [], subscription: null, listError: true }),
    ).toEqual({ kind: 'retry' });
  });
  it.each(['active', 'expired'])('opens %s classic renewal with the same ID', (status) => {
    expect(
      resolveDiscountAction(
        { ...context, subscription: { ...context.subscription, status } },
        'classic',
      ),
    ).toMatchObject({ kind: 'renew', path: '/subscriptions/42/renew' });
  });
  it('requires explicit mode instead of treating a missing tariff as classic', () => {
    expect(resolveDiscountAction(context)).toEqual({ kind: 'needs-mode', subscriptionId: 42 });
    expect(resolveDiscountAction(context, 'tariffs')).toMatchObject({
      kind: 'manage',
      path: '/subscriptions/42',
    });
  });
  it('renews an existing periodic tariff without a new-purchase route', () => {
    expect(
      resolveDiscountAction({
        ...context,
        subscription: { ...context.subscription, tariff_id: 7 },
      }),
    ).toMatchObject({ kind: 'renew', path: '/subscriptions/42/renew' });
  });
  it('preserves the explicitly selected owned subscription', () => {
    const multiple = [
      { id: 42, is_trial: false },
      { id: 43, is_trial: false },
    ];
    expect(resolveDiscountAction({ ...context, subscriptions: multiple })).toMatchObject({
      kind: 'choose',
      path: '/subscriptions',
    });
    expect(
      resolveDiscountAction({
        subscriptions: multiple,
        selectedSubscriptionId: 43,
        subscription: { ...context.subscription, id: 43, tariff_id: 7 },
      }),
    ).toMatchObject({ kind: 'renew', path: '/subscriptions/43/renew' });
  });
  it('never substitutes another subscription for an invalid or removed selection', () => {
    expect(
      resolveDiscountAction({ ...context, selectedSubscriptionId: 99 }, 'classic'),
    ).toMatchObject({ kind: 'choose', path: '/subscriptions' });
    expect(
      resolveDiscountAction({
        ...context,
        selectedSubscriptionId: 42,
        subscription: { ...context.subscription, id: 99 },
      }),
    ).toEqual({ kind: 'loading', subscriptionId: 42 });
  });
  it.each([
    { is_daily: true },
    { is_limited: true },
    { status: 'disabled' },
    { status: 'pending' },
  ])('keeps special states in management: %j', (fields) => {
    expect(
      resolveDiscountAction(
        { ...context, subscription: { ...context.subscription, ...fields } },
        'classic',
      ),
    ).toMatchObject({ kind: 'manage', path: '/subscriptions/42' });
  });
  it('keeps explicit migration and trial selection tied to the current ID', () => {
    expect(
      resolveDiscountAction({
        ...context,
        subscription: { ...context.subscription, requires_tariff_selection: true },
      }),
    ).toMatchObject({ kind: 'purchase', path: '/subscription/purchase?subscriptionId=42' });
    expect(
      resolveDiscountAction({
        subscriptions: [{ id: 42, is_trial: true }],
        subscription: { ...context.subscription, is_trial: true },
      }),
    ).toMatchObject({ kind: 'purchase', path: '/subscription/purchase?subscriptionId=42' });
  });
  it('preserves the existing classic account-wide paid guard for a selected trial', () => {
    const mixed = {
      subscriptions: [
        { id: 42, is_trial: true },
        { id: 43, is_trial: false },
      ],
      selectedSubscriptionId: 42,
      subscription: { ...context.subscription, is_trial: true },
    };
    expect(resolveDiscountAction(mixed)).toEqual({ kind: 'needs-mode', subscriptionId: 42 });
    expect(resolveDiscountAction(mixed, 'classic')).toMatchObject({
      kind: 'manage',
      path: '/subscriptions/42',
    });
    expect(resolveDiscountAction(mixed, 'tariffs')).toMatchObject({
      kind: 'purchase',
      path: '/subscription/purchase?subscriptionId=42',
    });
  });
  it('does not navigate using failed full-subscription data', () => {
    expect(resolveDiscountAction({ ...context, subscriptionError: true }, 'classic')).toEqual({
      kind: 'retry',
    });
  });
});
