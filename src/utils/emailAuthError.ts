import axios from 'axios';

export type EmailAuthErrorKind =
  | 'disabled'
  | 'disposable'
  | 'rate-limit-hour'
  | 'rate-limit-day'
  | 'rate-limit'
  | 'already-registered'
  | 'unverified'
  | 'invalid-credentials'
  | 'unknown';

export type EmailAuthOperation = 'login' | 'register';

const EMAIL_AUTH_DISABLED_CODE = 'email_auth_disabled';
const DISPOSABLE_EMAIL_DETAIL = 'Disposable email addresses are not allowed';

function responseDetail(error: unknown): unknown {
  return axios.isAxiosError(error) ? error.response?.data?.detail : undefined;
}

export function getRetryAfterSeconds(error: unknown): number | null {
  if (!axios.isAxiosError(error)) return null;
  const headers = error.response?.headers;
  const getHeader = (headers as { get?: unknown } | undefined)?.get;
  const value =
    typeof getHeader === 'function'
      ? getHeader.call(headers, 'retry-after')
      : ((headers as Record<string, unknown> | undefined)?.['retry-after'] ??
        (headers as Record<string, unknown> | undefined)?.['Retry-After']);
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds > 0 ? seconds : null;
}

export function classifyEmailAuthError(error: unknown): EmailAuthErrorKind {
  if (!axios.isAxiosError(error)) return 'unknown';

  const status = error.response?.status;
  const detail = responseDetail(error);

  if (
    status === 403 &&
    typeof detail === 'object' &&
    detail !== null &&
    (detail as { code?: unknown }).code === EMAIL_AUTH_DISABLED_CODE
  ) {
    return 'disabled';
  }

  if (status === 400 && detail === DISPOSABLE_EMAIL_DETAIL) return 'disposable';
  if (status === 400 && typeof detail === 'string' && detail.includes('already registered')) {
    return 'already-registered';
  }
  if (typeof detail === 'string' && detail.includes('verify your email')) return 'unverified';
  if (status === 401) return 'invalid-credentials';

  if (status === 429) {
    const retryAfter = getRetryAfterSeconds(error);
    if (retryAfter !== null && retryAfter >= 24 * 60 * 60) return 'rate-limit-day';
    if (retryAfter !== null && retryAfter >= 60 * 60) return 'rate-limit-hour';
    return 'rate-limit';
  }

  return 'unknown';
}

export function getEmailAuthErrorTranslationKey(
  error: unknown,
  operation: EmailAuthOperation,
): string {
  const kind = classifyEmailAuthError(error);

  switch (kind) {
    case 'disabled':
      return 'auth.emailAuthDisabled';
    case 'disposable':
      return 'auth.disposableEmail';
    case 'rate-limit-hour':
      return operation === 'register' ? 'auth.registrationHourlyLimit' : 'auth.tooManyAttempts';
    case 'rate-limit-day':
      return operation === 'register' ? 'auth.registrationDailyLimit' : 'auth.tooManyAttempts';
    case 'rate-limit':
      return 'auth.tooManyAttempts';
    case 'already-registered':
      return 'auth.emailAlreadyRegistered';
    case 'unverified':
      return 'auth.emailNotVerified';
    case 'invalid-credentials':
      return 'auth.invalidCredentials';
    default:
      return operation === 'register' ? 'auth.registrationFailed' : 'auth.loginFailed';
  }
}
