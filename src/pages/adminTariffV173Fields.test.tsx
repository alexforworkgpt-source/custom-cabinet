// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlatformProvider } from '@/platform/PlatformProvider';
import AdminTariffCreate from './AdminTariffCreate';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/api/tariffs', () => ({
  tariffsApi: {
    getServers: () => Promise.resolve([]),
    getExternalSquads: () => Promise.resolve([]),
    getPromoGroups: () => Promise.resolve([]),
    getTariff: () => Promise.resolve(null),
    createTariff: () => Promise.resolve({ id: 1 }),
    updateTariff: () => Promise.resolve({ id: 1 }),
  },
}));

afterEach(cleanup);

describe('форма тарифа v1.73.0', () => {
  it('показывает индивидуальные panel tag и дни триала', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <PlatformProvider>
        <QueryClientProvider client={client}>
          <MemoryRouter>
            <AdminTariffCreate />
          </MemoryRouter>
        </QueryClientProvider>
      </PlatformProvider>,
    );

    fireEvent.click(screen.getByText('admin.tariffs.periodTariff'));

    expect(await screen.findByLabelText('admin.tariffs.panelTagLabel')).toBeTruthy();
    expect(screen.getByLabelText('admin.tariffs.trialDaysLabel')).toBeTruthy();
  });
});
