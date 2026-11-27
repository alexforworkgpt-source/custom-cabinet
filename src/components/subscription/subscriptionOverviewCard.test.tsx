// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react';
import { createInstance } from 'i18next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { PlatformProvider } from '@/platform/PlatformProvider';
import type { Subscription } from '@/types';
import ru from '@/locales/ru.json';
import { subscription } from '../../../tests/e2e/classicRenewalFixture';
import { SubscriptionOverviewCard } from './SubscriptionOverviewCard';

const i18n = createInstance();
beforeAll(async () => {
  vi.stubGlobal('matchMedia', (media: string) => ({
    media,
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  await i18n.init({ lng: 'ru', resources: { ru: { translation: ru } } });
});
afterEach(cleanup);
afterAll(() => vi.unstubAllGlobals());

function renderOverview(fields: Partial<Subscription> = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { enabled: false } } });
  return render(
    <QueryClientProvider client={client}>
      <I18nextProvider i18n={i18n}>
        <PlatformProvider>
          <SubscriptionOverviewCard subscription={{ ...subscription, ...fields }} />
        </PlatformProvider>
      </I18nextProvider>
    </QueryClientProvider>,
  );
}

describe('compact management overview', () => {
  it('shows the API plan name, current limits and servers without financial controls', () => {
    const { container } = renderOverview({
      tariff_name: 'Семейная',
      traffic_used_gb: 25,
      traffic_used_percent: 25,
      servers: [{ uuid: 'nl', name: 'Нидерланды', country_code: 'NL' }],
    });
    expect(screen.getByRole('heading', { name: 'Семейная' })).toBeTruthy();
    expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('25');
    expect(screen.getByText(/25[.,]0.*100[.,]0/)).toBeTruthy();
    expect(screen.getByText('3 устройства')).toBeTruthy();
    expect(screen.getByText('🇳🇱')).toBeTruthy();
    expect(container.querySelector('time')?.getAttribute('dateTime')).toBe(subscription.end_date);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('note')).toBeNull();
  });

  it('shows an expired paid plan in the subscription banner with its former conditions', () => {
    renderOverview({
      status: 'expired',
      is_active: false,
      is_expired: true,
      servers: [{ uuid: 'nl', name: 'Нидерланды', country_code: 'NL' }],
    });
    const banner = within(screen.getByRole('region', { name: 'Текущий тариф' }));
    expect(banner.getByText('Истекла', { exact: true })).toBeTruthy();
    expect(banner.getByText('Подписка действовала', { exact: true })).toBeTruthy();
    expect(banner.getByText('100 ГБ', { exact: true })).toBeTruthy();
    expect(banner.getByText('3 устройства', { exact: true })).toBeTruthy();
    expect(screen.getByText('🇳🇱')).toBeTruthy();
  });

  it('shows the expired trial in the subscription banner with its former conditions', () => {
    const { container } = renderOverview({
      status: 'expired',
      is_active: false,
      is_expired: true,
      is_trial: true,
      servers: [{ uuid: 'nl', name: 'Нидерланды', country_code: 'NL' }],
    });
    const banner = within(screen.getByRole('region', { name: 'Пробный' }));
    expect(banner.getByText('Истекла', { exact: true })).toBeTruthy();
    expect(banner.getByText('Подписка действовала', { exact: true })).toBeTruthy();
    expect(banner.getByText('100 ГБ', { exact: true })).toBeTruthy();
    expect(banner.getByText('3 устройства', { exact: true })).toBeTruthy();
    expect(container.querySelector('time')?.getAttribute('dateTime')).toBe(subscription.end_date);
    expect(screen.getByText('🇳🇱')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('shows exhausted traffic in the subscription banner while retaining the end date and limit', () => {
    renderOverview({
      status: 'limited',
      is_active: false,
      is_limited: true,
      traffic_used_gb: 100,
      traffic_used_percent: 100,
    });
    const banner = within(screen.getByRole('region', { name: 'Текущий тариф' }));
    expect(banner.getByText('Трафик исчерпан', { exact: true })).toBeTruthy();
    expect(banner.getByText('Текущая подписка действует', { exact: true })).toBeTruthy();
    expect(banner.getByText('100 ГБ', { exact: true })).toBeTruthy();
    expect(banner.getByText('3 устройства', { exact: true })).toBeTruthy();
  });

  it.each([
    {
      status: 'expired',
      is_expired: true,
      is_daily_paused: false,
      badge: 'Истекла',
      dateLabel: 'Подписка действовала',
    },
    {
      status: 'disabled',
      is_expired: false,
      is_daily_paused: true,
      badge: 'На паузе',
      dateLabel: 'Текущая подписка действует',
    },
  ])(
    'shows the daily $status state in the subscription banner',
    ({ badge, dateLabel, ...fields }) => {
      renderOverview({
        ...fields,
        is_active: false,
        is_daily: true,
        tariff_name: 'Посуточный тариф',
      });
      const banner = within(screen.getByRole('region', { name: 'Посуточный тариф' }));
      expect(banner.getByText(badge, { exact: true })).toBeTruthy();
      expect(banner.getByText(dateLabel, { exact: true })).toBeTruthy();
      expect(banner.getByText('100 ГБ', { exact: true })).toBeTruthy();
    },
  );

  it.each([
    { tariff_name: 'Личная', is_daily: false },
    { tariff_name: 'Посуточный тариф', is_daily: true },
  ])('shows an illustrated subscription overview for the disabled $tariff_name plan', (plan) => {
    const { container } = renderOverview({
      ...plan,
      status: 'disabled',
      is_active: false,
      is_daily_paused: false,
      servers: [{ uuid: 'nl', name: 'Нидерланды', country_code: 'NL' }],
    });
    const banner = within(screen.getByRole('region', { name: plan.tariff_name }));
    expect(banner.getByText('Приостановлена (недостаточно средств)', { exact: true })).toBeTruthy();
    expect(banner.getByText('Текущая подписка действует', { exact: true })).toBeTruthy();
    expect(banner.getByText('100 ГБ', { exact: true })).toBeTruthy();
    expect(banner.getByText('3 устройства', { exact: true })).toBeTruthy();
    expect(container.querySelector('time')?.getAttribute('dateTime')).toBe(subscription.end_date);
    expect(screen.getByText('🇳🇱')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });

  const states: Array<{ label: string; fields: Partial<Subscription> }> = [
    { label: 'Активна', fields: {} },
    { label: 'Истекла', fields: { status: 'expired', is_active: false, is_expired: true } },
    { label: 'Пробный', fields: { status: 'trial', is_trial: true } },
    { label: 'Истекла', fields: { status: 'expired', is_trial: true, is_active: false } },
    { label: 'Трафик исчерпан', fields: { status: 'limited', is_limited: true } },
    { label: 'На паузе', fields: { is_daily: true, is_daily_paused: true } },
    {
      label: 'Приостановлена (недостаточно средств)',
      fields: { status: 'disabled', is_active: false },
    },
    { label: 'Неактивна', fields: { status: 'unknown', is_active: false } },
  ];
  it.each(states)('shows $label for the supplied subscription state', ({ label, fields }) => {
    renderOverview(fields);
    expect(screen.getByText(label, { exact: true })).toBeTruthy();
  });

  it('shows unlimited traffic and devices without inventing a finite limit', () => {
    renderOverview({ traffic_limit_gb: 0, device_limit: 0 });
    expect(screen.getAllByText('Безлимит')).toHaveLength(2);
    expect(screen.queryByText('100 ГБ')).toBeNull();
    expect(screen.queryByText('3 устройства')).toBeNull();
  });

  it('retains the server name when a country flag cannot be determined', () => {
    renderOverview({ servers: [{ uuid: 'private', name: 'Частный сервер', country_code: null }] });
    expect(screen.getByText('Частный сервер', { exact: true })).toBeTruthy();
  });

  it('uses the existing plan fallback when a name is absent', () => {
    renderOverview();
    expect(screen.getByRole('heading', { name: 'Текущий тариф' })).toBeTruthy();
  });

  it('retains the explicit tariff-selection label for a legacy subscription', () => {
    renderOverview({ requires_tariff_selection: true });
    expect(screen.getByRole('heading', { name: 'Без тарифа' })).toBeTruthy();
  });
});
