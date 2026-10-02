import { useTranslation } from 'react-i18next';
import type { RenewalOption } from '../../../types';
import { useCurrency } from '../../../hooks/useCurrency';
import { getMonthlyPriceKopeks } from '../../../utils/pricing';
import { CheckIcon } from '../../icons';
import { BestValueBadge } from '../BestValueBadge';
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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {options.map((option) => {
            const selected = selectedPeriod === option.period_days;
            const monthly = getMonthlyPriceKopeks(option.price_kopeks, option.period_days);
            return (
              <Card key={option.period_days} asChild size="sm">
                <button
                  type="button"
                  aria-pressed={selected}
                  disabled={disabled}
                  onClick={() => onSelect(option.period_days)}
                  className={`min-h-28 w-full text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:opacity-50 ${selected ? '!border-accent-500 !border-2 bg-accent-500/10' : ''}`}
                >
                  <span className="flex flex-wrap items-center justify-between gap-1 text-sm font-semibold text-dark-100">
                    <span>
                      {option.period_days} {t('subscription.days')}
                    </span>
                    {selected && <CheckIcon className="h-4 w-4 shrink-0 text-accent-400" />}
                  </span>
                  {option.is_highlighted && <BestValueBadge className="mt-1 !text-xs" />}
                  <span className="mt-2 block text-lg font-bold text-dark-100">
                    {option.price_kopeks === 0
                      ? t('subscription.free')
                      : price(option.price_kopeks)}
                  </span>
                  <span className="flex flex-wrap gap-x-2 text-xs text-dark-400">
                    {!!option.original_price_kopeks && (
                      <span className="line-through">{price(option.original_price_kopeks)}</span>
                    )}
                    {option.discount_percent > 0 && (
                      <span className="font-semibold text-success-400">
                        −{option.discount_percent}%
                      </span>
                    )}
                  </span>
                  {monthly !== null && (
                    <span className="mt-1 block text-xs text-dark-400">
                      {price(monthly)}/{t('subscription.month')}
                    </span>
                  )}
                </button>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
}
