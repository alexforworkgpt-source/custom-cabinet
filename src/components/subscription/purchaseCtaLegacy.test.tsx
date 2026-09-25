// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Subscription } from '@/types';
import PurchaseCTAButton from './PurchaseCTAButton';

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
  });
});

describe('tariff subscription primary action', () => {
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
  });
});
