import { useTranslation } from 'react-i18next';
import { Card } from '@/components/data-display/Card';
import type { LegalConsentGateState } from '../hooks/useLegalConsentGate';
import LegalConsent from './LegalConsent';

interface LegalConsentGateProps {
  gate: LegalConsentGateState;
  framed?: boolean;
  className?: string;
}

export default function LegalConsentGate({
  gate,
  framed = true,
  className = '',
}: LegalConsentGateProps) {
  const { t } = useTranslation();

  const content = (
    <>
      <h2 className="mb-2 text-lg font-bold text-dark-50">
        {t('auth.legalConsentTitle', 'Ещё один шаг')}
      </h2>
      <p className="mb-4 text-sm text-dark-400">
        {t(
          'auth.legalConsentSubtitle',
          'Чтобы создать аккаунт, подтвердите, что ознакомились с документами.',
        )}
      </p>

      <LegalConsent
        documents={gate.documents}
        accepted={gate.accepted}
        onChange={gate.toggle}
        disabled={gate.isSubmitting}
      />

      {gate.error && (
        <p className="mt-4 text-sm text-error-400" role="alert">
          {gate.error}
        </p>
      )}

      <button
        type="button"
        className="btn-primary mt-5 w-full"
        disabled={!gate.allAccepted || gate.isSubmitting}
        onClick={() => void gate.confirm(t('common.error'))}
      >
        {gate.isSubmitting
          ? t('common.loading', 'Загрузка...')
          : t('auth.legalConsentContinue', 'Продолжить')}
      </button>
    </>
  );

  if (!framed) return <div className={className}>{content}</div>;
  return (
    <Card size="md" className={className}>
      {content}
    </Card>
  );
}
