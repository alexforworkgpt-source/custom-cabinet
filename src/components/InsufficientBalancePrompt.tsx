import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../hooks/useCurrency';
import { PlusIcon } from '@/components/icons';
import { FundingNotice } from './subscription/FundingNotice';

interface InsufficientBalancePromptProps {
  /** Amount missing in kopeks */
  missingAmountKopeks: number;
  /** Optional custom message */
  message?: string;
  /** Compact mode for inline use */
  compact?: boolean;
  /** Additional className */
  className?: string;
  /** Callback to execute before opening top-up modal (e.g., save cart) */
  onBeforeTopUp?: () => Promise<void>;
  returnTo?: string;
}

export default function InsufficientBalancePrompt({
  missingAmountKopeks,
  message,
  compact = false,
  className = '',
  onBeforeTopUp,
  returnTo,
}: InsufficientBalancePromptProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { formatAmount, currencySymbol } = useCurrency();
  const [isPreparingTopUp, setIsPreparingTopUp] = useState(false);

  const missingRubles = missingAmountKopeks / 100;
  const displayAmount = formatAmount(missingRubles);

  const handleTopUpClick = async () => {
    if (onBeforeTopUp) {
      setIsPreparingTopUp(true);
      try {
        await onBeforeTopUp();
      } catch {
        // Silently ignore errors - still navigate
      } finally {
        setIsPreparingTopUp(false);
      }
    }
    const params = new URLSearchParams();
    params.set('amount', String(Math.ceil(missingRubles)));
    params.set('returnTo', returnTo ?? `${location.pathname}${location.search}`);
    navigate(`/balance/top-up?${params.toString()}`);
  };

  const action = (
    <button
      onClick={handleTopUpClick}
      disabled={isPreparingTopUp}
      className="btn-primary flex min-h-11 w-full items-center justify-center gap-2 px-3 py-2 text-sm sm:w-auto"
    >
      {isPreparingTopUp ? (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      ) : (
        <>
          {!compact && <PlusIcon className="h-4 w-4" />}
          {t(compact ? 'balance.topUp' : 'balance.topUpBalance')}
        </>
      )}
    </button>
  );
  return (
    <FundingNotice action={action} className={className}>
      {compact ? (
        <span>
          {message || t('balance.insufficientFunds')}:{' '}
          <strong className="font-semibold text-dark-100">
            {displayAmount} {currencySymbol}
          </strong>
        </span>
      ) : (
        <div className="space-y-2">
          <p className="font-medium text-dark-100">{t('balance.insufficientFunds')}</p>
          <p>{message || t('balance.topUpToComplete')}</p>
          <p className="font-semibold text-dark-100">
            {t('balance.missing')}: {displayAmount} {currencySymbol}
          </p>
        </div>
      )}
    </FundingNotice>
  );
}
