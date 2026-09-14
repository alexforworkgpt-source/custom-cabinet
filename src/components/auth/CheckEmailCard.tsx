import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/api/auth';
import { Card } from '@/components/data-display/Card';
import { EmailIcon } from '@/components/icons';
import { useCountdown } from '@/hooks/useCountdown';
import { classifyEmailAuthError, getRetryAfterSeconds } from '@/utils/emailAuthError';

const RESEND_COOLDOWN_SECONDS = 60;

interface CheckEmailCardProps {
  email: string;
  onBackToLogin: () => void;
  onChangeEmail: () => void;
}

export function CheckEmailCard({ email, onBackToLogin, onChangeEmail }: CheckEmailCardProps) {
  const { t } = useTranslation();
  const [cooldown, startCooldown] = useCountdown();
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    startCooldown(RESEND_COOLDOWN_SECONDS);
  }, [startCooldown]);

  const handleResend = async () => {
    if (cooldown > 0 || sendingRef.current) return;

    sendingRef.current = true;
    setSending(true);
    setNotice(null);
    let nextCooldown = RESEND_COOLDOWN_SECONDS;

    try {
      await authApi.resendVerificationPublic(email);
      setNotice({ kind: 'success', text: t('auth.resendSent') });
    } catch (error) {
      const kind = classifyEmailAuthError(error);
      nextCooldown = getRetryAfterSeconds(error) ?? RESEND_COOLDOWN_SECONDS;
      setNotice({
        kind: 'error',
        text:
          kind === 'rate-limit' || kind === 'rate-limit-hour' || kind === 'rate-limit-day'
            ? t('auth.resendTooOften')
            : kind === 'disabled'
              ? t('auth.emailAuthDisabled')
              : t('auth.resendError'),
      });
    } finally {
      sendingRef.current = false;
      setSending(false);
      startCooldown(nextCooldown);
    }
  };

  return (
    <Card size="lg" className="text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success-500/20">
        <EmailIcon className="h-7 w-7 text-success-400" />
      </div>
      <h2 className="mb-2 text-lg font-bold text-dark-50">{t('auth.checkEmail')}</h2>
      <p className="mb-3 text-sm text-dark-400">{t('auth.verificationSent')}</p>
      <p className="mb-4 text-sm font-medium text-accent-400">{email}</p>
      <p className="mb-4 text-xs text-dark-500">{t('auth.clickLinkToVerify')}</p>

      <p className="mb-5 rounded-xl border border-dark-700 bg-dark-800/60 p-3 text-start text-xs leading-relaxed text-dark-400">
        {t('auth.spamHint')}
      </p>

      {notice && (
        <p
          role="status"
          aria-live="polite"
          className={`mb-3 text-xs ${notice.kind === 'success' ? 'text-success-400' : 'text-error-400'}`}
        >
          {notice.text}
        </p>
      )}

      <button
        type="button"
        onClick={handleResend}
        disabled={cooldown > 0 || sending}
        className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sending
          ? t('common.loading')
          : cooldown > 0
            ? t('auth.resendIn', { seconds: cooldown })
            : t('auth.resendVerification')}
      </button>

      <button
        type="button"
        onClick={onChangeEmail}
        className="mt-3 w-full text-sm text-accent-400 transition-colors hover:text-accent-300"
      >
        {t('auth.useAnotherEmail')}
      </button>

      <button type="button" onClick={onBackToLogin} className="btn-secondary mt-4 w-full">
        {t('auth.backToLogin')}
      </button>
    </Card>
  );
}
