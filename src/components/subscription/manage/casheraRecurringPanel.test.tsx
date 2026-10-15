// @vitest-environment jsdom
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { PlatformProvider } from '@/platform/PlatformProvider';
import { ToastProvider } from '@/components/Toast';
import { CasheraRecurringPanel } from './CasheraRecurringPanel';

const api = vi.hoisted(() => ({
  getCasheraRecurring: vi.fn(),
  enableCasheraRecurring: vi.fn(),
  cancelCasheraRecurring: vi.fn(),
}));
vi.mock('../../../api/subscription', () => ({ subscriptionApi: api }));
vi.mock('../../../hooks/useCurrency', () => ({
  useCurrency: () => ({ formatAmount: (amount: number) => String(amount / 100) }),
}));
vi.mock('../../../platform/hooks/useNativeDialog', () => ({
  useDestructiveConfirm: () => async () => true,
}));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      key === 'subscription.casheraRecurring.amountPerInterval'
        ? `${options?.amount} ${options?.interval}`
        : key,
  }),
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  vi.useRealTimers();
});

it('polls pending status every eight seconds and stops after ACTIVE or unmount', async () => {
  vi.useFakeTimers();
  api.getCasheraRecurring
    .mockResolvedValueOnce({ status: 'PENDING' })
    .mockResolvedValue({ status: 'ACTIVE', amount_kopeks: 12900 });
  const view = renderPanel();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1);
  });
  expect(api.getCasheraRecurring).toHaveBeenCalledTimes(1);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(8000);
  });
  expect(api.getCasheraRecurring).toHaveBeenCalledTimes(2);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(16000);
  });
  expect(api.getCasheraRecurring).toHaveBeenCalledTimes(2);
  view.unmount();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(16000);
  });
  expect(api.getCasheraRecurring).toHaveBeenCalledTimes(2);
});

function renderPanel(
  enabled = true,
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } }),
) {
  return render(
    <QueryClientProvider client={client}>
      <PlatformProvider>
        <ToastProvider>
          <CasheraRecurringPanel enabled={enabled} subscriptionId={7} />
        </ToastProvider>
      </PlatformProvider>
    </QueryClientProvider>,
  );
}

it('does not present a missing server charge amount as a free payment', async () => {
  api.getCasheraRecurring.mockResolvedValue({ status: 'ACTIVE', interval: 'monthly' });
  renderPanel();
  expect(await screen.findByText('— subscription.casheraRecurring.interval.monthly')).toBeTruthy();
});

it('makes no request when the caller has not confirmed support', () => {
  renderPanel(false);
  expect(api.getCasheraRecurring).not.toHaveBeenCalled();
  expect(screen.queryByText('subscription.casheraRecurring.title')).toBeNull();
});

it('hides only the exact provider-disabled 403 response', async () => {
  api.getCasheraRecurring.mockRejectedValue({
    response: { status: 403, data: { detail: 'Cashera recurrent disabled' } },
  });
  renderPanel();
  await waitFor(() => expect(screen.queryByText('subscription.casheraRecurring.title')).toBeNull());
  expect(api.getCasheraRecurring).toHaveBeenCalledWith(7);
});

it('shows a different 403 as an error instead of pretending that the feature is disabled', async () => {
  api.getCasheraRecurring.mockRejectedValue({
    isAxiosError: true,
    response: { status: 403, data: { detail: { message: 'Permission denied' } } },
  });
  renderPanel();
  expect(await screen.findByRole('alert')).toBeTruthy();
  expect(screen.getByText('Permission denied')).toBeTruthy();
});

it('cancels the selected pending subscription and reloads its server state', async () => {
  api.getCasheraRecurring.mockResolvedValue({ status: 'PENDING', redirect_url: null });
  api.cancelCasheraRecurring.mockImplementation(async () => {
    api.getCasheraRecurring.mockResolvedValue({ status: 'none' });
    return { status: 'cancelled' };
  });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  renderPanel(true, client);
  fireEvent.click(
    await screen.findByRole('button', { name: 'subscription.casheraRecurring.cancel' }),
  );
  expect(
    await screen.findByRole('button', { name: 'subscription.casheraRecurring.connect' }),
  ).toBeTruthy();
  expect(api.cancelCasheraRecurring).toHaveBeenCalledWith(7);
  expect(invalidate).toHaveBeenCalledWith({ queryKey: ['purchase-options'] });
});

it('keeps the actual server RUB charge amount when ordinary UI prices use another currency', async () => {
  api.getCasheraRecurring.mockResolvedValue({
    status: 'ACTIVE',
    amount_kopeks: 12900,
    interval: 'monthly',
  });
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <PlatformProvider>
        <ToastProvider>
          <CasheraRecurringPanel enabled subscriptionId={7} />
        </ToastProvider>
      </PlatformProvider>
    </QueryClientProvider>,
  );
  expect(
    await screen.findByText('129 subscription.casheraRecurring.interval.monthly'),
  ).toBeTruthy();
  expect(api.getCasheraRecurring).toHaveBeenCalledWith(7);
});
