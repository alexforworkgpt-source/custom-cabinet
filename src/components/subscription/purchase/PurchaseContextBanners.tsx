import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import type { PurchaseContext } from '../../../hooks/usePurchaseContext';
import { UsersIcon, TariffsIcon } from '../../icons';

interface PurchaseContextBannersProps {
  context: PurchaseContext;
}

export function PurchaseContextBanners({ context }: PurchaseContextBannersProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { promoGroupName, showTrialUpgrade } = context;

  if (!showTrialUpgrade && !promoGroupName) return null;

  return (
    <div className="space-y-4">
      {showTrialUpgrade && (
        <div className="rounded-[14px] border border-warning-500/30 bg-warning-500/15 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-warning-500/20 text-warning-400">
              <TariffsIcon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold text-warning-400">
                {t('subscription.trialUpgrade.title')}
              </div>
              <div className="mt-1 text-[12px] text-dark-300">
                {t('subscription.trialUpgrade.description')}
              </div>
            </div>
          </div>
        </div>
      )}

      {promoGroupName && (
        <Link
          to="/info"
          state={{
            infoSection: 'loyalty',
            infoReturnTo: `${location.pathname}${location.search}${location.hash}`,
          }}
          className="flex items-center gap-3 rounded-xl border border-success-500/40 bg-success-500/15 p-3 transition-colors hover:border-success-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success-500"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-500/25 text-success-400">
            <UsersIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-success-400">
              {t('subscription.promoGroup.yourGroup', { name: promoGroupName })}
            </div>
            <div className="text-xs text-dark-300">
              {t('subscription.promoGroup.personalDiscountsApplied')}
            </div>
          </div>
        </Link>
      )}
    </div>
  );
}
