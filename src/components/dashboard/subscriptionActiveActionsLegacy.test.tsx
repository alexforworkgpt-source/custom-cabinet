// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlatformProvider } from '@/platform/PlatformProvider';
import type { Subscription } from '@/types';
import { SubscriptionActiveActions } from './SubscriptionActiveActions';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const subscription: Subscription = {
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
  requires_tariff_selection: true,
};

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}

afterEach(cleanup);

describe('active legacy subscription on the Unified Dashboard', () => {
  it('uses tariff selection as the primary subscription action', () => {
    render(
      <PlatformProvider>
        <MemoryRouter>
          <SubscriptionActiveActions
            subscription={subscription}
            connectedDevices={0}
            devicesError={false}
            onOpenConnectionQr={() => {}}
            onConnectDevice={() => {}}
            onManageDevices={() => {}}
            onRetryDevices={() => {}}
            devicesOpen={false}
            onManageSubscription={() => {}}
            managementOpen={false}
          />
        </MemoryRouter>
      </PlatformProvider>,
    );

    const action = screen.getByRole('link', { name: 'subscription.cta.moveToTariff' });
    expect(action.getAttribute('href')).toBe('/subscription/purchase?subscriptionId=42');
    expect(screen.queryByText('dashboard.manageSubscription')).toBeNull();
  });
});
