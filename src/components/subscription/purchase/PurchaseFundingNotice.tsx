import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../../hooks/useCurrency';
import { FundingNotice } from '../FundingNotice';

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

  return <FundingNotice>{t(messageKey, { amount })}</FundingNotice>;
}
