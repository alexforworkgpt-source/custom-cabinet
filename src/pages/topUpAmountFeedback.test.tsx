// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  createTopUp: vi.fn(),
  getPaymentMethods: vi.fn(),
  hapticNotification: vi.fn(),
  openLink: vi.fn(),
  openPaymentUrl: vi.fn(),
  saveTopUpPendingInfo: vi.fn(),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: { defaultValue?: string }) => {
      const messages: Record<string, string> = {
        'balance.enterAmount': 'Enter amount',
        'balance.errors.paymentFailed': 'Payment could not be created. Please try again.',
        'balance.paymentReady': 'Payment link is ready',
        'balance.topUp': 'Top Up',
        'common.processing': 'Processing…',
      };
      return messages[key] ?? options?.defaultValue ?? key;
    },
    i18n: { language: 'en', changeLanguage: () => Promise.resolve() },
  }),
  initReactI18next: { type: '3rdParty', init: () => {} },
}));

vi.mock('../api/balance', () => ({
  balanceApi: {
    createStarsInvoice: vi.fn(),
    createTopUp: mocks.createTopUp,
    getPaymentMethods: mocks.getPaymentMethods,
  },
}));

vi.mock('../hooks/useCurrency', () => ({
  useCurrency: () => ({
    convertAmount: (amount: number) => amount,
    convertToRub: (amount: number) => amount,
    currencySymbol: '₽',
    formatAmount: (amount: number) => String(amount),
    targetCurrency: 'RUB',
  }),
}));

vi.mock('../store/successNotification', () => ({
  useCloseOnSuccessNotification: vi.fn(),
}));

vi.mock('../utils/rateLimit', () => ({
  checkRateLimit: () => true,
  getRateLimitResetTime: () => 0,
  RATE_LIMIT_KEYS: { PAYMENT: 'payment' },
}));

vi.mock('../utils/topUpStorage', () => ({
  saveTopUpPendingInfo: mocks.saveTopUpPendingInfo,
}));

vi.mock('../utils/openPaymentUrl', () => ({
  openPaymentUrl: mocks.openPaymentUrl,
}));

vi.mock('@/platform', () => ({
  useHaptic: () => ({ notification: mocks.hapticNotification }),
  usePlatform: () => ({
    openInvoice: vi.fn(),
    openLink: mocks.openLink,
    openTelegramLink: vi.fn(),
    platform: 'web',
  }),
}));

interface Deferred<T> {
  promise: Promise<T>;
  reject: (reason?: unknown) => void;
  resolve: (value: T) => void;
}

function deferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, reject, resolve };
}

async function renderTopUp() {
  const { default: TopUpAmount } = await import('./TopUpAmount');
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });

  render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/balance/top-up/test-card?amount=300']}>
        <Routes>
          <Route path="/balance/top-up/:methodId" element={<TopUpAmount />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );

  return screen.findByRole('button', { name: 'Top Up' });
}

beforeEach(() => {
  mocks.createTopUp.mockReset();
  mocks.getPaymentMethods.mockReset();
  mocks.hapticNotification.mockReset();
  mocks.openLink.mockReset();
  mocks.openPaymentUrl.mockReset();
  mocks.saveTopUpPendingInfo.mockReset();
  mocks.getPaymentMethods.mockResolvedValue([
    {
      id: 'test-card',
      name: 'Test Card',
      description: 'Test provider',
      min_amount_kopeks: 10_000,
      max_amount_kopeks: 100_000,
      is_available: true,
      quick_amounts: [10_000, 30_000, 50_000],
      open_url_direct: true,
    },
  ]);
});

afterEach(() => cleanup());

describe('quick top-up feedback', () => {
  it('shows an accessible pending state immediately, sends one request, and recovers after failure', async () => {
    const request = deferred<never>();
    mocks.createTopUp.mockReturnValue(request.promise);
    const submit = await renderTopUp();

    fireEvent.click(submit);
    fireEvent.click(submit);

    const pending = screen.getByRole('button', { name: 'Processing…' });
    expect((pending as HTMLButtonElement).disabled).toBe(true);
    expect(pending.getAttribute('aria-busy')).toBe('true');
    await waitFor(() => expect(mocks.createTopUp).toHaveBeenCalledTimes(1));

    await act(async () => request.reject(new Error('provider unavailable')));

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Payment could not be created. Please try again.',
    );
    await waitFor(() => {
      expect((screen.getByRole('button', { name: 'Top Up' }) as HTMLButtonElement).disabled).toBe(
        false,
      );
    });
  });

  it('keeps the existing safe payment transition after a successful response', async () => {
    const request = deferred<{
      payment_id: string;
      payment_url: string;
      amount_kopeks: number;
      amount_rubles: number;
      status: string;
      expires_at: null;
    }>();
    mocks.createTopUp.mockReturnValue(request.promise);
    const submit = await renderTopUp();

    fireEvent.click(submit);
    await act(async () =>
      request.resolve({
        payment_id: 'payment-42',
        payment_url: 'https://payments.example.test/payment-42',
        amount_kopeks: 30_000,
        amount_rubles: 300,
        status: 'pending',
        expires_at: null,
      }),
    );

    await waitFor(() => {
      expect(mocks.saveTopUpPendingInfo).toHaveBeenCalledTimes(1);
      expect(mocks.openPaymentUrl).toHaveBeenCalledWith(
        'https://payments.example.test/payment-42',
        'web',
        mocks.openLink,
      );
    });
  });
});
