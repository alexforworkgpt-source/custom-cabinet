// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PlatformProvider } from '@/platform/PlatformProvider';
import type { Subscription } from '@/types';
import ru from '@/locales/ru.json';
import { subscription } from '../../../../tests/e2e/classicRenewalFixture';
import { RenewalSubscriptionInfo } from './RenewalSubscriptionInfo';

const i18n = createInstance();
beforeAll(async () => {
  await i18n.init({ lng: 'ru', resources: { ru: { translation: ru } } });
});
afterEach(cleanup);

function renderInfo(overrides: Partial<Subscription> = {}, maximum?: number) {
  return render(
    <I18nextProvider i18n={i18n}>
      <PlatformProvider>
        <RenewalSubscriptionInfo
          subscription={{ ...subscription, ...overrides }}
          endDate={null}
          maxDeviceLimit={maximum}
        />
      </PlatformProvider>
    </I18nextProvider>,
  );
}

describe('renewal device guidance', () => {
  it('explains separate device purchases in an informational note instead of the old renewal hint', () => {
    const { container } = renderInfo();
    const hint = screen.getByText(
      'Докупка устройств оформляется отдельно в «Дополнительных опциях».',
    );
    const note = screen.getByRole('note');
    expect(note.contains(hint)).toBe(true);
    expect(note.querySelector('svg')).not.toBeNull();
    expect(container.textContent).not.toContain('Продление с текущими параметрами');
    expect(container.textContent).not.toContain('Количество устройств при продлении сохранится.');
  });

  it('explains that an expired subscription must be renewed before adding devices', () => {
    renderInfo({ status: 'expired', is_active: false, is_expired: true });
    expect(
      screen.getByText(
        'Чтобы добавить устройства, сначала продлите подписку, затем откройте «Дополнительные опции».',
      ),
    ).toBeTruthy();
  });

  const excluded: Array<{ name: string; fields: Partial<Subscription> }> = [
    { name: 'unlimited devices', fields: { device_limit: 0 } },
    { name: 'trial', fields: { is_trial: true } },
    { name: 'daily', fields: { is_daily: true } },
    { name: 'tariff selection required', fields: { requires_tariff_selection: true } },
    {
      name: 'inactive without an expired status',
      fields: { is_active: false, status: 'disabled' },
    },
  ];
  it.each(excluded)('does not suggest device purchases for $name', ({ fields }) => {
    renderInfo(fields);
    expect(screen.queryByRole('note')).toBeNull();
  });

  it.each(['active', 'expired'])(
    'does not promise more devices at a known maximum for %s',
    (status) => {
      renderInfo({ status, is_active: status === 'active', is_expired: status === 'expired' }, 3);
      expect(screen.getByText('Достигнут максимальный лимит устройств.')).toBeTruthy();
      expect(screen.queryByText(/откройте «Дополнительные опции»/)).toBeNull();
    },
  );

  it('does not treat traffic-limited access as an expired subscription', () => {
    renderInfo({ status: 'limited', is_limited: true, is_active: false });
    expect(screen.getByText(/Докупка устройств оформляется отдельно/)).toBeTruthy();
    expect(screen.queryByText(/сначала продлите подписку/)).toBeNull();
  });

  it('gives expired guidance priority over an active flag', () => {
    renderInfo({ status: 'expired', is_active: true });
    expect(screen.getByText(/сначала продлите подписку/)).toBeTruthy();
  });

  it.each([undefined, 0, Number.NaN])('does not invent a maximum from %s', (maximum) => {
    renderInfo({}, maximum);
    expect(screen.getByText(/Докупка устройств оформляется отдельно/)).toBeTruthy();
    expect(screen.queryByText(/Достигнут максимальный лимит/)).toBeNull();
  });
});
