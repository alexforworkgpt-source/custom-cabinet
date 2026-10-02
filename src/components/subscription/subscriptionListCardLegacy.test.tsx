// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlatformProvider } from '@/platform/PlatformProvider';
import type { SubscriptionListItem } from '@/types';
import SubscriptionListCard from './SubscriptionListCard';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'ru' },
  }),
}));

const item = (overrides: Partial<SubscriptionListItem> = {}): SubscriptionListItem => ({
  id: 42,
  status: 'active',
  tariff_id: null,
  tariff_name: null,
  traffic_limit_gb: 0,
  traffic_used_gb: 1,
  device_limit: 3,
  end_date: '2026-10-07T00:00:00Z',
  subscription_url: null,
  subscription_crypto_link: null,
  is_trial: false,
  autopay_enabled: false,
  connected_squads: [],
  ...overrides,
});

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

function renderCard(subscription: SubscriptionListItem) {
  render(
    <PlatformProvider>
      <MemoryRouter>
        <SubscriptionListCard subscription={subscription} onClick={() => {}} />
      </MemoryRouter>
    </PlatformProvider>,
  );
}

describe('legacy subscription in the subscription list', () => {
  it('offers tariff selection and hides the unavailable autopay status', () => {
    renderCard(item({ requires_tariff_selection: true }));

    const action = screen.getByRole('link', { name: 'subscription.cta.moveToTariff' });
    expect(action.getAttribute('href')).toBe('/subscription/purchase?subscriptionId=42');
    expect(screen.queryByText('subscription.autopay')).toBeNull();
  });

  it('keeps the regular autopay status for a normal subscription', () => {
    renderCard(item({ tariff_id: 7, tariff_name: 'Basic', requires_tariff_selection: false }));

    expect(screen.getByText('subscription.autopay')).toBeTruthy();
    expect(screen.queryByRole('link', { name: 'subscription.cta.moveToTariff' })).toBeNull();
  });
});
