import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { RenewalOption } from '../../../types';
import { useCurrency } from '../../../hooks/useCurrency';
import { Card } from '../../data-display';
import { Button } from '../../primitives';

interface Props {
  option: RenewalOption | undefined;
  balanceKopeks: number;
  isClassic: boolean;
  disabled: boolean;
  pending: boolean;
  onSubmit: () => void;
}

export function RenewalSummary({
  option,
  balanceKopeks,
  isClassic,
  disabled,
  pending,
  onSubmit,
}: Props) {
  const { t } = useTranslation();
  const { formatAmount, currencySymbol } = useCurrency();
  const [mobile, setMobile] = useState(
    () => typeof matchMedia === 'function' && matchMedia('(max-width: 1023px)').matches,
  );
  const [height, setHeight] = useState(220);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (typeof matchMedia !== 'function') return;
    const media = matchMedia('(max-width: 1023px)');
    const update = () => setMobile(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (!mobile || !panel.current || typeof ResizeObserver !== 'function') return;
    const observer = new ResizeObserver(() =>
      setHeight((panel.current?.getBoundingClientRect().height ?? 220) + 16),
    );
    observer.observe(panel.current);
    return () => observer.disconnect();
  }, [mobile]);
  const price = (kopeks: number) => `${formatAmount(kopeks / 100)} ${currencySymbol}`;
  const missing = option ? Math.max(0, option.price_kopeks - balanceKopeks) : 0;
  const summary = (
    <div
      ref={panel}
      data-renewal-summary
      className={
        mobile
          ? 'fixed inset-x-0 bottom-[var(--mobile-nav-clearance)] z-40 px-[max(1rem,env(safe-area-inset-left,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))]'
          : ''
      }
    >
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
  return mobile ? (
    <>
      <div
        data-renewal-clearance
        aria-hidden="true"
        style={{ height: `calc(${height}px + var(--mobile-nav-clearance, 0px))` }}
      />
      {createPortal(summary, document.body)}
    </>
  ) : (
    summary
  );
}
