import { AxiosError } from 'axios';
import i18n from '../i18n';
import { getSafeRedirectPath } from './safeRedirect';

export type PurchaseStep = 'period' | 'traffic' | 'servers' | 'devices' | 'confirm';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (typeof detail === 'object' && detail?.message) return detail.message;
  }
  if (error instanceof Error) return error.message;
  return i18n.t('common.error');
};

export const getInsufficientBalanceError = (
  error: unknown,
): {
  required: number;
  balance: number;
  missingAmount?: number;
  cartSaved: boolean;
  cartMode?: string;
} | null => {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    if (
      typeof detail === 'object' &&
      (detail?.code === 'insufficient_balance' || detail?.code === 'insufficient_funds')
    ) {
      return {
        required: detail.required || detail.total_price || 0,
        balance: detail.balance || 0,
        missingAmount: detail.missing_amount ?? detail.missingAmount,
        cartSaved: detail.cart_saved === true,
        cartMode: typeof detail.cart_mode === 'string' ? detail.cart_mode : undefined,
      };
    }
  }
  return null;
};

export const getSavedCartTopUpPath = (
  error: unknown,
  fallbackMissingKopeks: number | undefined,
  returnTo: string,
): string | null => {
  if (!(error instanceof AxiosError) || error.response?.status !== 402) return null;
  const insufficient = getInsufficientBalanceError(error);
  if (!insufficient?.cartSaved) return null;
  const missingKopeks = insufficient.missingAmount ?? fallbackMissingKopeks;
  if (!missingKopeks || !Number.isFinite(missingKopeks) || missingKopeks <= 0) return null;

  const params = new URLSearchParams();
  params.set('amount', String(Math.ceil(missingKopeks / 100)));
  params.set('returnTo', getSafeRedirectPath(returnTo));
  return `/balance/top-up?${params.toString()}`;
};

export const getFlagEmoji = (countryCode: string | null | undefined): string => {
  // Trim + длина строго 2 буквы — иначе Unicode regional indicators не дадут флаг.
  // Принимаем null/undefined чтобы вызывающие коду не приходилось страховаться.
  const code = (countryCode ?? '').trim();
  if (code.length !== 2 || !/^[A-Za-z]{2}$/.test(code)) return '';
  const codePoints = code
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};
