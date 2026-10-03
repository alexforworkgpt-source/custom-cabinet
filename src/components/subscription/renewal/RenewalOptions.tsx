import { useTranslation } from 'react-i18next';
import type { RenewalOption } from '../../../types';
import { useCurrency } from '../../../hooks/useCurrency';
import { getMonthlyPriceKopeks } from '../../../utils/pricing';
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
              <button
                key={option.period_days}
                type="button"
                aria-pressed={selected}
                disabled={disabled}
                onClick={() => onSelect(option.period_days)}
                className={`bento-card-hover relative min-h-28 w-full p-4 text-start transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 disabled:opacity-50 ${option.discount_percent > 0 ? 'pt-8' : ''} ${selected ? 'bento-card-glow border-accent-500 bg-accent-500/10 light:!border-accent-500 light:border-2' : ''}`}
              >
                <span className="block text-lg font-semibold text-dark-100">
                  {option.period_days} {t('subscription.days')}
                </span>
                {option.is_highlighted && <BestValueBadge className="mt-1 !text-xs" />}
                <span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium text-accent-400">
                    {option.price_kopeks === 0
                      ? t('subscription.free')
                      : price(option.price_kopeks)}
                  </span>
                  {!!option.original_price_kopeks && (
                    <span className="text-sm text-dark-500 line-through">
                      {price(option.original_price_kopeks)}
                    </span>
                  )}
                </span>
                {monthly !== null && (
                  <span className="mt-1 block text-xs text-dark-400">
                    {price(monthly)}/{t('subscription.month')}
                  </span>
                )}
                {option.discount_percent > 0 && (
                  <span className="absolute right-2 top-2 z-10 rounded-full bg-success-500 px-2 py-0.5 text-xs font-medium text-white shadow-sm">
                    -{option.discount_percent}%
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
