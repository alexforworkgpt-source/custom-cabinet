// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, expect, it, vi } from 'vitest';
import { PlatformProvider } from '@/platform/PlatformProvider';
import { CasheraPurchaseAction } from './CasheraPurchaseAction';

const purchase = vi.hoisted(() => vi.fn());
vi.mock('../../../api/subscription', () => ({
  subscriptionApi: { purchaseWithCasheraRecurring: purchase },
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

it('submits only the tariff ID once and returns to subscriptions after pending authorization', async () => {
  purchase.mockResolvedValue({ status: 'PENDING', redirect_url: null, subscription_id: 7 });
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <PlatformProvider>
        <MemoryRouter>
          <Routes>
            <Route path="/" element={<CasheraPurchaseAction tariffId={42} disabled={false} />} />
            <Route path="/subscriptions" element={<p>subscriptions</p>} />
          </Routes>
        </MemoryRouter>
      </PlatformProvider>
    </QueryClientProvider>,
  );
  const button = screen.getByRole('button', {
    name: 'subscription.casheraRecurring.purchaseButton',
  });
  fireEvent.click(button);
  fireEvent.click(button);
  await waitFor(() => expect(purchase).toHaveBeenCalledTimes(1));
  expect(purchase).toHaveBeenCalledWith(42);
  expect(await screen.findByText('subscriptions')).toBeTruthy();
});
