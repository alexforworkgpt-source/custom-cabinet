import { render as rtlRender, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router';
import type { Subscription, Tariff } from '@/types';
import { TariffPickerGrid } from './purchase/TariffPickerGrid';

const base = (overrides: Partial<Tariff> & { id: number; name: string }): Tariff =>
  ({
    description: null,
    tier_level: 1,
    traffic_limit_gb: 100,
    traffic_limit_label: '100 ГБ',
    is_unlimited_traffic: false,
    device_limit: 1,
    extra_devices_count: 0,
    servers_count: 0,
    servers: [],
    periods: [],
    ...overrides,
  }) as unknown as Tariff;

export function render(
  tariffs: Array<Partial<Tariff> & { id: number; name: string }>,
  options: { currentTariffId?: number; subscription?: Partial<Subscription> } = {},
) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  rtlRender(
    <QueryClientProvider client={client}>
      <MemoryRouter>
        <TariffPickerGrid
          tariffs={tariffs.map(base)}
          subscription={
            options.subscription
              ? (options.subscription as never)
              : options.currentTariffId
                ? ({ tariff_id: options.currentTariffId, is_active: true } as never)
                : null
          }
          purchaseOptions={undefined}
          isTariffsMode
          isMultiTariff={false}
          onSelectTariff={() => {}}
          onSwitchTariff={() => {}}
        />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

export function cardFor(name: string): HTMLElement {
  const title = screen.getByText(name);
  const card = title.closest('div.bento-card-hover');
  if (!card) throw new Error(`не нашёл карточку тарифа ${name}`);
  return card as HTMLElement;
}
