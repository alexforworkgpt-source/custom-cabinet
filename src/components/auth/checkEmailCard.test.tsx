// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ruLocale from '@/locales/ru.json';
import { PlatformProvider } from '@/platform/PlatformProvider';

function ru(key: string): string {
  const value = key
    .split('.')
    .reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], ruLocale);
  if (typeof value !== 'string') throw new Error(`missing translation: ${key}`);
  return value;
}

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      ru(key).replace(/{{(\w+)}}/g, (_match, name) => String(options?.[name] ?? '')),
  }),
}));

const resend = vi.fn();

vi.mock('@/api/auth', () => ({
  authApi: {
    resendVerificationPublic: (email: string) => resend(email),
  },
}));

const { CheckEmailCard } = await import('./CheckEmailCard');

function renderCard(overrides: Partial<Parameters<typeof CheckEmailCard>[0]> = {}) {
  const props = {
    email: 'user@example.org',
    onBackToLogin: vi.fn(),
    onChangeEmail: vi.fn(),
    ...overrides,
  };
  render(
    <PlatformProvider>
      <CheckEmailCard {...props} />
    </PlatformProvider>,
  );
  return props;
}

function finishInitialCooldown() {
  vi.advanceTimersByTime(61_000);
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
  resend.mockReset().mockResolvedValue({ message: 'sent' });
});

afterEach(() => {
  vi.useRealTimers();
  cleanup();
});

describe('CheckEmailCard', () => {
  it('shows the destination, spam hint, and an initial cooldown', () => {
    renderCard();

    expect(screen.getByText('user@example.org')).toBeTruthy();
    expect(screen.getByText(ru('auth.spamHint'))).toBeTruthy();
    const resendButton = screen.getByRole('button', { name: /отправить ещё раз через/i });
    expect((resendButton as HTMLButtonElement).disabled).toBe(true);
  });

  it('resends successfully and starts a new cooldown', async () => {
    renderCard();
    finishInitialCooldown();

    fireEvent.click(await screen.findByRole('button', { name: ru('auth.resendVerification') }));

    await waitFor(() => expect(resend).toHaveBeenCalledWith('user@example.org'));
    expect(await screen.findByText(ru('auth.resendSent'))).toBeTruthy();
    expect(screen.queryByRole('button', { name: ru('auth.resendVerification') })).toBeNull();
  });

  it('does not start parallel resend requests', async () => {
    let resolveRequest: ((value: { message: string }) => void) | undefined;
    resend.mockImplementationOnce(
      () =>
        new Promise<{ message: string }>((resolve) => {
          resolveRequest = resolve;
        }),
    );
    renderCard();
    finishInitialCooldown();
    const button = await screen.findByRole('button', { name: ru('auth.resendVerification') });

    fireEvent.click(button);
    fireEvent.click(button);

    expect(resend).toHaveBeenCalledTimes(1);
    resolveRequest?.({ message: 'sent' });
    await screen.findByText(ru('auth.resendSent'));
  });

  it('turns a server rate limit into a safe message and honors Retry-After', async () => {
    resend.mockRejectedValueOnce(
      Object.assign(new Error('429 Too many requests'), {
        isAxiosError: true,
        response: {
          status: 429,
          headers: { get: () => '3600' },
          data: { detail: 'Too many requests' },
        },
      }),
    );
    renderCard();
    finishInitialCooldown();

    fireEvent.click(await screen.findByRole('button', { name: ru('auth.resendVerification') }));

    expect(await screen.findByText(ru('auth.resendTooOften'))).toBeTruthy();
    expect(screen.queryByText(/429|Too many requests/)).toBeNull();
    expect(screen.getByRole('button', { name: /3600/ })).toBeTruthy();
  });

  it('shows a safe generic error without raw technical text', async () => {
    resend.mockRejectedValueOnce(new Error('smtp trace_id=private'));
    renderCard();
    finishInitialCooldown();

    fireEvent.click(await screen.findByRole('button', { name: ru('auth.resendVerification') }));

    expect(await screen.findByText(ru('auth.resendError'))).toBeTruthy();
    expect(screen.queryByText(/smtp|trace_id/)).toBeNull();
  });

  it('provides separate paths to edit the email and return to login', () => {
    const props = renderCard();

    fireEvent.click(screen.getByRole('button', { name: ru('auth.useAnotherEmail') }));
    fireEvent.click(screen.getByRole('button', { name: ru('auth.backToLogin') }));

    expect(props.onChangeEmail).toHaveBeenCalledTimes(1);
    expect(props.onBackToLogin).toHaveBeenCalledTimes(1);
  });

  it('uses logical text alignment inside an RTL container', () => {
    render(
      <PlatformProvider>
        <div dir="rtl">
          <CheckEmailCard
            email="user@example.org"
            onBackToLogin={vi.fn()}
            onChangeEmail={vi.fn()}
          />
        </div>
      </PlatformProvider>,
    );

    const hint = screen.getByText(ru('auth.spamHint'));
    expect(hint.className).toContain('text-start');
    expect(hint.className).not.toContain('text-left');
  });
});
