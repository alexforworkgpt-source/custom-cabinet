import { useTranslation } from 'react-i18next';
import type { RenewalOption } from '../../../types';
import { useCurrency } from '../../../hooks/useCurrency';
import { getMonthlyPriceKopeks } from '../../../utils/pricing';
import { PeriodCardContent } from '../PeriodCardContent';
import { Card } from '../../data-display';

interface Props {
  options: RenewalOption[];
  selectedPeriod: number | null;
  disabled: boolean;
  onSelect: (period: number) => void;
}

export function RenewalOptions({ options, selectedPeriod, disabled, onSelect }: Props) {
  const { t } = useTranslation();
  const { formatAmount, currencySymbol } = useCurrency();
  const price = (kopeks: number) => `${formatAmount(kopeks / 100)} ${currencySymbol}`;
  return (
    <section aria-labelledby="renewal-period-label" className="space-y-3">
      <h2 id="renewal-period-label" className="text-lg font-semibold text-dark-100">
        {t('subscription.chooseRenewalPeriod')}
      </h2>
      {options.length === 0 ? (
        <Card>
          <p className="text-sm text-dark-400">{t('subscription.noRenewalOptions')}</p>
        </Card>
      ) : (
        <div className="grid auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {options.map((option) => {
            const selected = selectedPeriod === option.period_days;
            const monthly =
              option.period_days === 30
                ? option.price_kopeks
                : getMonthlyPriceKopeks(option.price_kopeks, option.period_days);
            return (
              <button
                key={option.period_days}
                type="button"
                aria-pressed={selected}
                disabled={disabled}
                onClick={() => onSelect(option.period_days)}
                className={`bento-card-hover relative flex min-w-0 flex-col !px-1.5 !py-2 text-start transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:opacity-50 min-[375px]:!p-3 sm:!p-4 ${selected ? 'bento-card-glow border-accent-500 bg-accent-500/10 light:!border-accent-500 light:border-2' : ''}`}
              >
                <PeriodCardContent
                  label={`${option.period_days} ${t('subscription.days')}`}
                  periodDays={option.period_days}
                  price={
                    option.price_kopeks === 0 ? t('subscription.free') : price(option.price_kopeks)
                  }
                  originalPrice={
                    option.original_price_kopeks ? price(option.original_price_kopeks) : null
                  }
                  monthlyPrice={
                    monthly !== null
                      ? `${formatAmount(monthly / 100, 0)} ${currencySymbol}/${t('subscription.month')}`
                      : null
                  }
                  discountPercent={option.discount_percent}
                  highlighted={option.is_highlighted}
                  compactHighlight
                />
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
