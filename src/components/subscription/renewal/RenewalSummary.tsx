import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { RenewalOption } from '../../../types';
import { useCurrency } from '../../../hooks/useCurrency';
import { Card } from '../../data-display';
import { Button } from '../../primitives';
import { CalendarIcon } from '../../icons';
import { FundingNotice } from '../FundingNotice';
import { formatDateOrRaw } from '../../../utils/format';

interface Props {
  children: ReactNode;
  option: RenewalOption | undefined;
  balanceKopeks: number;
  isClassic: boolean;
  disabled: boolean;
  pending: boolean;
  onSubmit: () => void;
  projectedEndDate?: string | null;
}

export function RenewalSummary({
  children,
  option,
  balanceKopeks,
  isClassic,
  disabled,
  pending,
  onSubmit,
  projectedEndDate,
}: Props) {
  const { t, i18n } = useTranslation();
  const { formatAmount, currencySymbol } = useCurrency();
  const price = (kopeks: number) => `${formatAmount(kopeks / 100)} ${currencySymbol}`;
  const missing = option ? Math.max(0, option.price_kopeks - balanceKopeks) : 0;
  const formattedEndDate = formatDateOrRaw(projectedEndDate, i18n?.language ?? 'ru', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const summary = (
    <div data-renewal-summary>
      <Card className="space-y-4 bg-dark-800/40 shadow-none">
        {option ? (
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3">
            <h2 className="text-base font-semibold text-dark-100">
              {t('subscription.renewOrderTitle', {
                period: t('subscription.days', { count: option.period_days }),
              })}
            </h2>
            <span className="text-end text-lg font-bold tabular-nums text-dark-100">
              {price(option.price_kopeks)}
            </span>
          </div>
        ) : (
          <p className="text-sm font-medium text-dark-100">
            {t('subscription.chooseRenewalPeriod')}
          </p>
        )}
        {projectedEndDate && formattedEndDate && option && (
          <p className="flex items-start gap-2 text-xs text-dark-300">
            <span aria-hidden="true" className="shrink-0 text-accent-400">
              <CalendarIcon className="h-4 w-4" />
            </span>
            <time dateTime={projectedEndDate}>
              {t('subscription.renewProjectedEnd', { date: formattedEndDate })}
            </time>
          </p>
        )}
        <dl className="space-y-3 border-t border-dark-700/65 pt-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
            <dt className="text-dark-400">{t('common.balance')}</dt>
            <dd className="font-medium tabular-nums text-dark-200">{price(balanceKopeks)}</dd>
          </div>
          {option && missing > 0 && (
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <dt className="font-semibold text-dark-100">
                {t('subscription.renewTopUpRequired')}
              </dt>
              <dd className="text-lg font-bold tabular-nums text-dark-100">{price(missing)}</dd>
            </div>
          )}
        </dl>
        {option && isClassic && missing > 0 && (
          <FundingNotice>{t('subscription.renewAfterFundingNotice')}</FundingNotice>
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
