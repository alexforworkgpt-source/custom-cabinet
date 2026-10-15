// @vitest-environment jsdom
import { createInstance } from 'i18next';
import { cleanup, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import ru from '../locales/ru.json';
import en from '../locales/en.json';
import fa from '../locales/fa.json';
import zh from '../locales/zh.json';
import { useSuccessNotification } from '../store/successNotification';

const translations = createInstance();
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: translations.t.bind(translations) }),
}));
vi.mock('../hooks/useCurrency', () => ({
  useCurrency: () => ({ formatAmount: String, currencySymbol: '₽' }),
}));
vi.mock('../hooks/useTelegramSDK', () => ({
  useTelegramSDK: () => ({
    isTelegramWebApp: false,
    safeAreaInset: { bottom: 0 },
    contentSafeAreaInset: { bottom: 0 },
  }),
}));
vi.mock('@/platform', () => ({ useHaptic: () => ({ notification: vi.fn() }) }));

import SuccessNotificationModal from './SuccessNotificationModal';

afterEach(() => {
  cleanup();
  useSuccessNotification.getState().hide();
});

it('shows device amounts once without unresolved translation placeholders', async () => {
  await translations.init({
    lng: 'ru',
    resources: { ru: { translation: ru } },
    showSupportNotice: false,
  });
  useSuccessNotification.getState().show({
    type: 'devices_purchased',
    devicesAdded: 2,
    newDeviceLimit: 5,
  });
  render(
    <MemoryRouter>
      <SuccessNotificationModal />
    </MemoryRouter>,
  );
  expect(document.body.textContent).not.toMatch(/\{\{(count|value)\}\}/);
  expect(document.body.textContent).toContain('+2');
});

it.each(Object.entries({ ru, en, fa, zh }))(
  'localizes traffic success amounts in %s',
  async (language, resource) => {
    await translations.init({
      lng: language,
      resources: { [language]: { translation: resource } },
      showSupportNotice: false,
    });
    useSuccessNotification.getState().show({
      type: 'traffic_purchased',
      trafficGbAdded: 5,
      newTrafficLimitGb: 20,
    });
    render(
      <MemoryRouter>
        <SuccessNotificationModal />
      </MemoryRouter>,
    );
    expect(document.body.textContent).not.toMatch(/\{\{(count|value)\}\}/);
    expect(document.body.textContent).toContain(`+5 ${resource.common.units.gb}`);
  },
);
