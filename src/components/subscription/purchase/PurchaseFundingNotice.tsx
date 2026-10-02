import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../../hooks/useCurrency';
import { InfoIcon } from '../../icons';

export function PurchaseFundingNotice({
  missingAmountKopeks,
  messageKey = 'subscription.fundingNotice',
}: {
  missingAmountKopeks: number;
  messageKey?:
    | 'subscription.fundingNotice'
    | 'subscription.classicFundingNotice'
    | 'subscription.classicRenewFundingNotice';
}) {
  const { t } = useTranslation();
  const { formatAmount, currencySymbol } = useCurrency();
  const amount = `${formatAmount(missingAmountKopeks / 100)} ${currencySymbol}`;

  return (
    <div className="flex items-start gap-2 rounded-xl border border-error-500/30 bg-error-500/10 p-3 text-sm text-error-400">
      <InfoIcon className="h-4 w-4 shrink-0" />
      <span>{t(messageKey, { amount })}</span>
    </div>
  );
}
