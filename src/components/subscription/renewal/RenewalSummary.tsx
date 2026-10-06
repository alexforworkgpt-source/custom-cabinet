import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { RenewalOption } from '../../../types';
import { useCurrency } from '../../../hooks/useCurrency';
import { Card } from '../../data-display';
import { Button } from '../../primitives';

interface Props {
  children: ReactNode;
  option: RenewalOption | undefined;
  balanceKopeks: number;
  isClassic: boolean;
  disabled: boolean;
  pending: boolean;
  onSubmit: () => void;
}

export function RenewalSummary({
  children,
  option,
  balanceKopeks,
  isClassic,
  disabled,
  pending,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const { formatAmount, currencySymbol } = useCurrency();
  const price = (kopeks: number) => `${formatAmount(kopeks / 100)} ${currencySymbol}`;
  const missing = option ? Math.max(0, option.price_kopeks - balanceKopeks) : 0;
  const summary = (
    <div data-renewal-summary>
      <Card size="sm" className="space-y-2 !bg-dark-900">
        {option ? (
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <span className="text-sm font-medium text-dark-200">
              {option.period_days} {t('subscription.days')}
            </span>
            <span className="text-lg font-bold text-dark-100">{price(option.price_kopeks)}</span>
          </div>
        ) : (
          <p className="text-sm font-medium text-dark-100">
            {t('subscription.chooseRenewalPeriod')}
          </p>
        )}
        <p className="text-xs text-dark-400">
          {t('common.balance')}: {price(balanceKopeks)}
        </p>
        {option && isClassic && missing > 0 && (
          <p className="text-xs text-dark-300">
            {t('subscription.renewTopUpHint', { amount: price(missing) })}
          </p>
        )}
        <Button
          variant="legacyPrimary"
          className="py-3"
          fullWidth
          disabled={disabled || !option || pending}
          aria-busy={pending}
          onClick={onSubmit}
        >
          {pending
            ? t('common.processing')
            : !option
              ? t('subscription.chooseRenewalPeriod')
              : isClassic
                ? t(missing > 0 ? 'dashboard.topUpBalance' : 'subscription.pay')
                : t('subscription.extend')}
        </Button>
      </Card>
    </div>
  );
  return (
    <div className="space-y-4" data-renewal-panel>
      {children}
      {summary}
    </div>
  );
}
