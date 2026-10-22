// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PlatformProvider } from '@/platform/PlatformProvider';
import type { Subscription } from '@/types';
import ru from '@/locales/ru.json';
import { subscription } from '../../../tests/e2e/classicRenewalFixture';
import { SubscriptionOverviewCard } from './SubscriptionOverviewCard';

const i18n = createInstance();
beforeAll(async () => {
  await i18n.init({ lng: 'ru', resources: { ru: { translation: ru } } });
});
afterEach(cleanup);

function renderOverview(fields: Partial<Subscription> = {}) {
  return render(
    <I18nextProvider i18n={i18n}>
      <PlatformProvider>
        <SubscriptionOverviewCard subscription={{ ...subscription, ...fields }} />
      </PlatformProvider>
    </I18nextProvider>,
  );
}

describe('compact management overview', () => {
  it('shows the API plan name, current limits and servers without financial controls', () => {
    const { container } = renderOverview({
      tariff_name: 'Семейная',
      servers: [{ uuid: 'nl', name: 'Нидерланды', country_code: 'NL' }],
    });
    expect(screen.getByRole('heading', { name: 'Семейная' })).toBeTruthy();
    expect(screen.getByText('100 ГБ')).toBeTruthy();
    expect(screen.getByText('3 устройства')).toBeTruthy();
    expect(screen.getByText('🇳🇱')).toBeTruthy();
    expect(container.querySelector('time')?.getAttribute('dateTime')).toBe(subscription.end_date);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByRole('note')).toBeNull();
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
