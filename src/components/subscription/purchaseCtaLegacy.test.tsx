// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Subscription } from '@/types';
import PurchaseCTAButton from './PurchaseCTAButton';
import { PlatformProvider } from '@/platform/PlatformProvider';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const subscription = (overrides: Partial<Subscription> = {}): Subscription => ({
  id: 42,
  status: 'active',
  is_trial: false,
  start_date: '2026-08-07T00:00:00Z',
  end_date: '2026-10-07T00:00:00Z',
  days_left: 19,
  hours_left: 0,
  minutes_left: 0,
  time_left_display: '19 d',
  traffic_limit_gb: 100,
  traffic_used_gb: 0,
  traffic_used_percent: 0,
  device_limit: 3,
  connected_squads: [],
  servers: [],
  autopay_enabled: false,
  autopay_days_before: 3,
  subscription_url: null,
  hide_subscription_link: false,
  is_active: true,
  is_expired: false,
  is_limited: false,
  ...overrides,
});

afterEach(cleanup);

describe('subscription action loading', () => {
  it('keeps the financial link unavailable until its current conditions are ready', () => {
    const { rerender } = render(
      <MemoryRouter>
        <PurchaseCTAButton subscription={subscription()} isClassic loading reserveSpace />
      </MemoryRouter>,
    );
    expect(screen.getByRole('status').getAttribute('aria-busy')).toBe('true');
    expect(screen.queryByRole('link')).toBeNull();
    rerender(
      <MemoryRouter>
        <PurchaseCTAButton subscription={subscription()} isClassic reserveSpace />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByRole('link').getAttribute('href')).toBe('/subscriptions/42/renew');
  });

  it('does not introduce a loading action where active multi-tariff daily renewal is hidden', () => {
    render(
      <MemoryRouter>
        <PurchaseCTAButton
          subscription={subscription({ is_daily: true })}
          isMultiTariff
          loading
          reserveSpace
        />
      </MemoryRouter>,
    );
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('link')).toBeNull();
  });
});

describe('legacy subscription primary action', () => {
  it('opens tariff selection for the same subscription instead of renewal', () => {
    render(
      <MemoryRouter>
        <PurchaseCTAButton
          subscription={subscription({ requires_tariff_selection: true })}
          isMultiTariff
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link').getAttribute('href')).toBe(
      '/subscription/purchase?subscriptionId=42',
    );
    expect(screen.getByText('subscription.cta.moveToTariff')).toBeTruthy();
    expect(screen.queryByText('subscription.extend')).toBeNull();
  });

  it('uses the same tariff transition in single-subscription mode', () => {
    render(
      <MemoryRouter>
        <PurchaseCTAButton
          subscription={subscription({ requires_tariff_selection: true })}
          isMultiTariff={false}
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link').getAttribute('href')).toBe(
      '/subscription/purchase?subscriptionId=42',
    );
  });

  it('keeps the tariff transition when the legacy subscription is expired', () => {
    render(
      <MemoryRouter>
        <PurchaseCTAButton
          subscription={subscription({
            requires_tariff_selection: true,
            is_active: false,
            is_expired: true,
          })}
          isMultiTariff
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link').getAttribute('href')).toBe(
      '/subscription/purchase?subscriptionId=42',
    );
    expect(screen.getByText('subscription.cta.moveToTariff')).toBeTruthy();
    expect(screen.queryByText('subscription.cta.renewHint')).toBeNull();
  });
});

describe('tariff subscription primary action', () => {
  it.each([
    ['active', false],
    ['expired', false],
    ['active', true],
    ['expired', true],
  ] as const)(
    'opens %s tariff renewal in single-subscription mode (classic=%s)',
    (status, isClassic) => {
      render(
        <MemoryRouter>
          <PurchaseCTAButton
            subscription={subscription({
              tariff_id: 7,
              requires_tariff_selection: false,
              status,
              is_active: status === 'active',
              is_expired: status === 'expired',
            })}
            isClassic={isClassic}
          />
        </MemoryRouter>,
      );

      expect(screen.getByRole('link').getAttribute('href')).toBe('/subscriptions/42/renew');
      expect(screen.getByText('subscription.extend')).toBeTruthy();
      expect(
        screen.getByText(
          status === 'active' ? 'subscription.cta.activeHint' : 'subscription.cta.renewHint',
        ),
      ).toBeTruthy();
    },
  );

  it.each([
    ['daily', { is_daily: true }],
    ['limited', { is_limited: true }],
    ['pending', { status: 'pending' }],
    ['disabled', { status: 'disabled' }],
  ])('preserves the purchase route for a %s tariff subscription', (_case, overrides) => {
    render(
      <MemoryRouter>
        <PurchaseCTAButton subscription={subscription({ tariff_id: 7, ...overrides })} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link').getAttribute('href')).toBe('/subscription/purchase');
  });

  it.each([false, true])('keeps the selected trial ID when classic=%s', (isClassic) => {
    render(
      <MemoryRouter>
        <PurchaseCTAButton
          subscription={subscription({ id: 43, is_trial: true, tariff_id: 7 })}
          isClassic={isClassic}
          isMultiTariff
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      '/subscription/purchase?subscriptionId=43',
    );
  });

  it('preserves explicit tariff selection even when a tariff ID is present', () => {
    render(
      <MemoryRouter>
        <PurchaseCTAButton
          subscription={subscription({ tariff_id: 7, requires_tariff_selection: true })}
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      '/subscription/purchase?subscriptionId=42',
    );
  });

  it('keeps the existing multi-subscription renewal route', () => {
    render(
      <MemoryRouter>
        <PurchaseCTAButton
          subscription={subscription({ tariff_id: 7, requires_tariff_selection: false })}
          isMultiTariff
        />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link').getAttribute('href')).toBe('/subscriptions/42/renew');
    expect(screen.getByText('subscription.extend')).toBeTruthy();
    expect(screen.getByText('subscription.cta.activeHint')).toBeTruthy();
  });
});

describe('classic subscription renewal action', () => {
  it('does not infer classic renewal from a missing tariff without a sales mode', () => {
    render(
      <MemoryRouter>
        <PurchaseCTAButton subscription={subscription()} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link').getAttribute('href')).toBe('/subscription/purchase');
  });

  it('opens renewal with the existing subscription parameters in single-subscription mode', () => {
    render(
      <MemoryRouter>
        <PurchaseCTAButton subscription={subscription()} isClassic />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link').getAttribute('href')).toBe('/subscriptions/42/renew');
    expect(screen.getByText('subscription.classicRenewHint')).toBeTruthy();
  });

  it('renews an expired paid classic subscription', () => {
    render(
      <MemoryRouter>
        <PurchaseCTAButton
          subscription={subscription({ status: 'expired', is_active: false, is_expired: true })}
          isClassic
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link').getAttribute('href')).toBe('/subscriptions/42/renew');
    expect(screen.getByText('subscription.extend')).toBeTruthy();
  });

  it('preserves trial purchase in single-subscription classic mode', () => {
    render(
      <MemoryRouter>
        <PurchaseCTAButton subscription={subscription({ is_trial: true })} isClassic />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      '/subscription/purchase?subscriptionId=42',
    );
  });

  it.each([
    ['daily', { is_daily: true }],
    ['limited', { is_limited: true }],
    ['pending', { status: 'pending' }],
    ['disabled', { status: 'disabled' }],
  ])(
    'shows unavailable renewal instead of a purchase loop for paid classic %s',
    (_case, overrides) => {
      render(
        <MemoryRouter>
          <PurchaseCTAButton subscription={subscription(overrides)} isClassic />
        </MemoryRouter>,
        { wrapper: PlatformProvider },
      );
      expect(screen.queryByRole('link')).toBeNull();
      expect(screen.getByRole('note').textContent).toBe('subscription.cta.renewUnavailable');
    },
  );

  it('keeps new classic purchase available when no subscription exists', () => {
    render(
      <MemoryRouter>
        <PurchaseCTAButton subscription={null} isClassic />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link').getAttribute('href')).toBe('/subscription/purchase');
  });

  it('preserves explicit migration to tariff selection in classic mode', () => {
    render(
      <MemoryRouter>
        <PurchaseCTAButton
          subscription={subscription({ requires_tariff_selection: true })}
          isClassic
        />
      </MemoryRouter>,
    );
    expect(screen.getByRole('link').getAttribute('href')).toBe(
      '/subscription/purchase?subscriptionId=42',
    );
  });
});
