import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/api/auth';
import { Button } from '@/components/primitives/Button';
import { UI } from '@/config/constants';
import { useAuthStore } from '@/store/auth';
import { getApiErrorMessage } from '@/utils/api-error';
import { isValidEmail } from '@/utils/validation';

interface ProfileEmailAuthSectionProps {
  email: string;
  verified: boolean;
  verificationEnabled: boolean;
}

type ChangeStep = 'email' | 'code' | 'success' | null;

export default function ProfileEmailAuthSection({
  email,
  verified,
  verificationEnabled,
}: ProfileEmailAuthSectionProps) {
  const { t } = useTranslation();
  const setUser = useAuthStore((state) => state.setUser);
  const [step, setStep] = useState<ChangeStep>(null);
  const [newEmail, setNewEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [verificationCooldown, setVerificationCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0 && verificationCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((value) => Math.max(0, value - 1));
      setVerificationCooldown((value) => Math.max(0, value - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown, verificationCooldown]);

  const refreshUser = async () => setUser(await authApi.getMe());

  const resendVerification = useMutation({
    mutationFn: authApi.resendVerification,
    onSuccess: () => {
      setError(null);
      setNotice(t('profile.verificationResent'));
      setVerificationCooldown(UI.RESEND_COOLDOWN_SEC);
    },
    onError: (mutationError: unknown) => {
      setNotice(null);
      setError(getApiErrorMessage(mutationError, t('common.error')));
    },
  });

  const requestChange = useMutation({
    mutationFn: authApi.requestEmailChange,
    onSuccess: async (result) => {
      setError(null);
      if (result.expires_in_minutes === 0) {
        await refreshUser();
        setStep('success');
        return;
      }
      setStep('code');
      setResendCooldown(UI.RESEND_COOLDOWN_SEC);
    },
    onError: (mutationError: unknown) => {
      const detail = getApiErrorMessage(mutationError, '');
      if (detail.includes('already registered') || detail.includes('already in use')) {
        setError(t('profile.changeEmail.emailAlreadyUsed'));
      } else if (detail.includes('same as current')) {
        setError(t('profile.changeEmail.sameEmail'));
      } else if (detail.includes('rate limit') || detail.includes('too many')) {
        setError(t('profile.changeEmail.tooManyRequests'));
      } else {
        setError(detail || t('common.error'));
      }
    },
  });

  const verifyChange = useMutation({
    mutationFn: authApi.verifyEmailChange,
    onSuccess: async () => {
      setError(null);
      await refreshUser();
      setStep('success');
    },
    onError: (mutationError: unknown) => {
      const detail = getApiErrorMessage(mutationError, '');
      if (detail.includes('invalid') || detail.includes('wrong')) {
        setError(t('profile.changeEmail.invalidCode'));
      } else if (detail.includes('expired')) {
        setError(t('profile.changeEmail.codeExpired'));
      } else {
        setError(detail || t('common.error'));
      }
    },
  });

  const resetChange = () => {
    setStep(null);
    setNewEmail('');
    setCode('');
    setError(null);
    setNotice(null);
    setResendCooldown(0);
  };

  const submitEmail = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const value = newEmail.trim();
    if (!value) {
      setError(t('profile.emailRequired'));
    } else if (!isValidEmail(value)) {
      setError(t('profile.invalidEmail'));
    } else if (value.toLowerCase() === email.toLowerCase()) {
      setError(t('profile.changeEmail.sameEmail'));
    } else {
      requestChange.mutate(value);
    }
  };

  const submitCode = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (code.trim().length < 4) {
      setError(t('profile.changeEmail.invalidCode'));
      return;
    }
    verifyChange.mutate(code.trim());
  };

  return (
    <section
      aria-labelledby="profile-email-auth-heading"
      className="mt-2 border-t border-dark-700 pt-3"
    >
      <div className="flex min-h-11 items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 id="profile-email-auth-heading" className="text-sm font-semibold text-dark-100">
            {t('profile.emailAuth')}
          </h3>
          <p className="text-xs text-dark-400">{t('profile.canLoginWithEmail')}</p>
        </div>
        {verified ? (
          <span className="badge-success shrink-0">{t('profile.verified')}</span>
        ) : verificationEnabled ? (
          <span className="badge-warning shrink-0">{t('profile.notVerified')}</span>
        ) : null}
      </div>

      {!verified && verificationEnabled && (
        <div className="mt-2 rounded-linear border border-warning-500/30 bg-warning-500/10 p-3">
          <p className="text-sm text-warning-400">{t('profile.verificationRequired')}</p>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="mt-2"
            loading={resendVerification.isPending}
            disabled={verificationCooldown > 0}
            onClick={() => resendVerification.mutate()}
          >
            {verificationCooldown > 0
              ? t('profile.resendIn', { seconds: verificationCooldown })
              : t('profile.resendVerification')}
          </Button>
        </div>
      )}

      {step === null && (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-2"
          onClick={() => {
            setError(null);
            setNotice(null);
            setStep('email');
          }}
        >
          {t('profile.changeEmail.button')}
        </Button>
      )}

      {step === 'email' && (
        <form className="mt-3 space-y-3" onSubmit={submitEmail}>
          <label htmlFor="profile-new-email" className="label">
            {t('profile.changeEmail.newEmail')}
          </label>
          <input
            id="profile-new-email"
            type="email"
            value={newEmail}
            onChange={(event) => setNewEmail(event.target.value)}
            className="input w-full"
            autoComplete="email"
            aria-invalid={Boolean(error)}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" loading={requestChange.isPending}>
              {t('profile.changeEmail.sendCode')}
            </Button>
            <Button type="button" variant="secondary" size="sm" onClick={resetChange}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      )}

      {step === 'code' && (
        <form className="mt-3 space-y-3" onSubmit={submitCode}>
          <p className="text-sm text-accent-400">
            {t('profile.changeEmail.codeSentTo', { email: newEmail })}
          </p>
          <label htmlFor="profile-email-verification-code" className="label">
            {t('profile.changeEmail.verificationCode')}
          </label>
          <input
            id="profile-email-verification-code"
            type="text"
            inputMode="numeric"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            maxLength={6}
            className="input w-full text-center tracking-[0.5em]"
            autoComplete="one-time-code"
            aria-invalid={Boolean(error)}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="submit" size="sm" loading={verifyChange.isPending}>
              {t('profile.changeEmail.verify')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={resendCooldown > 0}
              loading={requestChange.isPending}
              onClick={() => requestChange.mutate(newEmail.trim())}
            >
              {resendCooldown > 0
                ? t('profile.changeEmail.resendIn', { seconds: resendCooldown })
                : t('profile.changeEmail.resendCode')}
            </Button>
          </div>
        </form>
      )}

      {step === 'success' && (
        <div role="status" className="mt-3 text-sm text-success-400">
          {t('profile.changeEmail.success')}
        </div>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm text-error-400">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="mt-2 text-sm text-success-400">
          {notice}
        </p>
      )}
    </section>
  );
}
