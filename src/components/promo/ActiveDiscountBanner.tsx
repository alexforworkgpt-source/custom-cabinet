import { useTranslation } from 'react-i18next';
import type { ActiveDiscount } from '../../api/promo';
import { Card } from '../data-display';
import { ClockIcon, XCircleIcon } from '../icons';
import { formatOfferTimeLeft } from './offerPresentation';
import { Button } from '../primitives';

interface Props {
  discount: ActiveDiscount;
  label: string;
  disabled: boolean;
  pending: boolean;
  onUse: () => void;
  onDeactivate: () => void;
  deactivating: boolean;
  now?: number;
}
export function ActiveDiscountBanner({
  discount,
  label,
  disabled,
  pending,
  onUse,
  onDeactivate,
  deactivating,
  now,
}: Props) {
  const { t } = useTranslation();
  return (
    <Card
      size="lg"
      data-promo-active-discount
      className="border-success-500/30 bg-gradient-to-br from-success-500/10 to-accent-500/5"
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-success-500/20 text-success-400">
            <span className="text-2xl">🏷️</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-dark-100">
                {t('promo.offers.discountActiveTitle', { percent: discount.discount_percent })}
              </h3>
              <span className="rounded bg-success-500/20 px-2 py-0.5 text-xs font-bold text-success-400">
                -{discount.discount_percent}%
              </span>
            </div>
            {discount.expires_at && (
              <div className="flex items-center gap-1 text-sm text-dark-400">
                <ClockIcon />
                <span>
                  {t('promo.offers.expires', {
                    time: formatOfferTimeLeft(discount.expires_at, t, now),
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            onClick={onUse}
            disabled={disabled || deactivating}
            aria-busy={pending}
            className="flex-1 rounded-xl bg-gradient-to-r from-success-500 to-success-600 px-4 py-2.5 font-semibold text-white shadow-lg shadow-success-500/25 transition-all hover:from-success-400 hover:to-success-500 active:from-success-600 active:to-success-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {label}
          </button>
          <button
            onClick={onDeactivate}
            disabled={deactivating || pending}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-dark-600/50 bg-dark-900/50 px-4 py-2.5 text-sm text-dark-400 transition-colors hover:border-error-500/30 hover:bg-error-500/10 hover:text-error-400 disabled:opacity-50"
          >
            <XCircleIcon className="h-4 w-4" />
            <span>{t('promo.deactivate.button')}</span>
          </button>
        </div>
      </div>
    </Card>
  );
}

export function UnavailableDiscountBanner({
  refreshing,
  deactivating,
  onRefresh,
  onDeactivate,
}: {
  refreshing: boolean;
  deactivating: boolean;
  onRefresh: () => void;
  onDeactivate: () => void;
}) {
  const { t } = useTranslation();
  return (
    <Card size="sm" data-promo-unavailable-discount className="space-y-3 text-sm text-dark-300">
      <div className="flex items-start gap-2">
        <ClockIcon />
        <p>{t('promo.navigation.expired')}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          size="lg"
          disabled={refreshing || deactivating}
          onClick={onRefresh}
        >
          {t('common.retry')}
        </Button>
        <Button
          variant="ghost"
          size="lg"
          disabled={refreshing || deactivating}
          onClick={onDeactivate}
        >
          {t('promo.deactivate.button')}
        </Button>
      </div>
    </Card>
  );
}
