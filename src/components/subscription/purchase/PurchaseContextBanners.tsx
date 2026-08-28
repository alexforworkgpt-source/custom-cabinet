import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { promoApi } from '../../../api/promo';
import type { PurchaseOptions, Subscription, Tariff } from '../../../types';
import { GiftIcon, SparklesIcon } from '../../icons';

interface PurchaseContextBannersProps {
  subscription: Subscription | null;
  purchaseOptions: PurchaseOptions;
  tariffs: Tariff[];
  showPromoGroup: boolean;
}

export function PurchaseContextBanners({
  subscription,
  purchaseOptions,
  tariffs,
  showPromoGroup,
}: PurchaseContextBannersProps) {
  const { t } = useTranslation();
  const tariffPromoGroupName = tariffs.find((tariff) => tariff.promo_group_name)?.promo_group_name;
  const { data: promoGroupDiscounts } = useQuery({
    queryKey: ['promo-group-discounts'],
    queryFn: promoApi.getGroupDiscounts,
    enabled: showPromoGroup && !tariffPromoGroupName,
    staleTime: 30_000,
  });
  const promoGroupName = tariffPromoGroupName ?? promoGroupDiscounts?.group_name;
  const isExpiredTariffSubscription =
    purchaseOptions.sales_mode === 'tariffs' && purchaseOptions.subscription_is_expired === true;
  const showTrialUpgrade = subscription?.is_trial && !isExpiredTariffSubscription;

  if (!showTrialUpgrade && !(showPromoGroup && promoGroupName)) return null;

  return (
    <div className="space-y-4">
      {showTrialUpgrade && (
        <div className="rounded-[14px] border border-warning-500/30 bg-warning-500/15 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-warning-500/20 text-warning-400">
              <SparklesIcon className="h-4 w-4" />
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

      {showPromoGroup && promoGroupName && (
        <div className="flex items-center gap-3 rounded-xl border border-success-500/40 bg-success-500/15 p-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-500/25 text-success-400">
            <GiftIcon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-success-400">
              {t('subscription.promoGroup.yourGroup', { name: promoGroupName })}
            </div>
            <div className="text-xs text-dark-300">
              {t('subscription.promoGroup.personalDiscountsApplied')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
