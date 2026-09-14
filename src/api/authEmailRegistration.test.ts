import { AxiosError, AxiosHeaders } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const clientMocks = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock('./client', () => ({
  default: clientMocks,
}));

import { authApi } from './auth';
import { classifyEmailAuthError, getEmailAuthErrorTranslationKey } from '../utils/emailAuthError';

function axiosError(
  status: number,
  detail: unknown,
  responseHeaders: Record<string, string> = {},
): AxiosError {
  const configHeaders = new AxiosHeaders();
  return new AxiosError(
    'Request failed',
    'ERR_BAD_REQUEST',
    { headers: configHeaders },
    {},
    {
      status,
      statusText: '',
      headers: new AxiosHeaders(responseHeaders),
      config: { headers: configHeaders },
      data: { detail },
    },
  );
}

describe('public email verification resend API', () => {
  beforeEach(() => {
    clientMocks.post.mockReset().mockResolvedValue({ data: { message: 'sent' } });
  });

  it('uses the unauthenticated Upstream Bot endpoint and sends only the email', async () => {
    await authApi.resendVerificationPublic('user@example.org');

    expect(clientMocks.post).toHaveBeenCalledWith('/cabinet/auth/email/register/resend', {
      email: 'user@example.org',
    });
  });
});

describe('email auth API error contract', () => {
  it('recognizes the machine-readable disabled state', () => {
    const error = axiosError(403, {
      code: 'email_auth_disabled',
      message: 'Email authentication is disabled',
    });

    expect(classifyEmailAuthError(error)).toBe('disabled');
  });

  it('recognizes disposable-domain rejection without owning a domain list', () => {
    const error = axiosError(400, 'Disposable email addresses are not allowed');

    expect(classifyEmailAuthError(error)).toBe('disposable');
  });

  it.each([
    ['hour', '3600'],
    ['day', '86400'],
  ] as const)(
    'uses Retry-After to expose the server %s registration window',
    (kind, retryAfter) => {
      const error = axiosError(429, 'Too many requests', { 'Retry-After': retryAfter });

      expect(classifyEmailAuthError(error)).toBe(`rate-limit-${kind}`);
    },
  );

  it('keeps an unrecognized 429 as a safe generic rate limit', () => {
    expect(classifyEmailAuthError(axiosError(429, 'Too many requests'))).toBe('rate-limit');
  });

  it('recognizes existing-account and unverified-login responses', () => {
    expect(classifyEmailAuthError(axiosError(400, 'This email is already registered'))).toBe(
      'already-registered',
    );
    expect(classifyEmailAuthError(axiosError(403, 'Please verify your email'))).toBe('unverified');
  });

  it('does not expose unknown server details as a user state', () => {
    expect(classifyEmailAuthError(axiosError(500, 'trace_id=secret-internal'))).toBe('unknown');
    expect(classifyEmailAuthError(new Error('network internals'))).toBe('unknown');
  });

  it.each([
    [axiosError(403, { code: 'email_auth_disabled' }), 'register', 'auth.emailAuthDisabled'],
    [
      axiosError(400, 'Disposable email addresses are not allowed'),
      'register',
      'auth.disposableEmail',
    ],
    [
      axiosError(429, 'Too many requests', { 'Retry-After': '3600' }),
      'register',
      'auth.registrationHourlyLimit',
    ],
    [
      axiosError(429, 'Too many requests', { 'Retry-After': '86400' }),
      'register',
      'auth.registrationDailyLimit',
    ],
    [axiosError(429, 'Too many requests'), 'register', 'auth.tooManyAttempts'],
    [
      axiosError(400, 'This email is already registered'),
      'register',
      'auth.emailAlreadyRegistered',
    ],
    [axiosError(403, 'Please verify your email'), 'login', 'auth.emailNotVerified'],
    [axiosError(401, 'Invalid email or password'), 'login', 'auth.invalidCredentials'],
    [axiosError(500, 'private stack trace'), 'register', 'auth.registrationFailed'],
    [axiosError(500, 'private stack trace'), 'login', 'auth.loginFailed'],
  ] as const)(
    'maps a server response to a safe translation key',
    (error, operation, expectedKey) => {
      expect(getEmailAuthErrorTranslationKey(error, operation)).toBe(expectedKey);
    },
  );
});
