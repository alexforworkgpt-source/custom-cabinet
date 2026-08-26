import { describe, expect, it } from 'vitest';
import { selectDashboardPromoSlides } from './dashboardPromoSlides';

describe('selectDashboardPromoSlides', () => {
  it('prioritizes missing account links before subscription, gift and earnings actions', () => {
    expect(
      selectDashboardPromoSlides({
        telegramLinked: false,
        emailLinked: false,
        subscriptionState: 'active',
        giftEnabled: true,
        referralEnabled: true,
      }).map((slide) => slide.id),
    ).toEqual(['telegram', 'email', 'connection', 'channel', 'gift']);
  });

  it('removes linked account actions and offers a tariff without an active subscription', () => {
    expect(
      selectDashboardPromoSlides({
        telegramLinked: true,
        emailLinked: true,
        subscriptionState: 'none',
        giftEnabled: true,
        referralEnabled: true,
      }).map((slide) => slide.id),
    ).toEqual(['tariff', 'channel', 'gift', 'earnings']);
  });

  it('does not invent actions while account, subscription and feature states are unknown', () => {
    expect(
      selectDashboardPromoSlides({
        telegramLinked: undefined,
        emailLinked: undefined,
        subscriptionState: 'unknown',
        giftEnabled: undefined,
        referralEnabled: undefined,
      }),
    ).toEqual([]);
  });
});
