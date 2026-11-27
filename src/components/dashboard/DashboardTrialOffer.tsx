import { useTranslation } from 'react-i18next';
import { useCurrency } from '@/hooks/useCurrency';
import { formatTraffic } from '@/utils/formatTraffic';
import { SubscriptionHeroButton, SubscriptionHeroLink } from './SubscriptionActiveActions';
import type { TrialOfferCardProps } from './TrialOfferCard';

export type DashboardTrialOfferProps = Omit<TrialOfferCardProps, 'balanceRubles'>;

export default function DashboardTrialOffer({
  trialInfo,
  balanceKopeks,
  activateTrialMutation,
  trialError,
}: DashboardTrialOfferProps) {
  const { t } = useTranslation();
  const { formatAmount, currencySymbol } = useCurrency();
  const isFree = !trialInfo.requires_payment;
  const canAfford = balanceKopeks !== null && balanceKopeks >= trialInfo.price_kopeks;

  const activate = () => {
    if (!activateTrialMutation.isPending) activateTrialMutation.mutate();
  };

  const paid = !isFree && trialInfo.price_kopeks > 0;
  const waitingForBalance = paid && balanceKopeks === null;
  return (
    <div className="grid gap-3">
      <div>
        <h3 className="text-base font-semibold text-champagne-50">
          {isFree ? t('dashboard.trialOffer.freeTitle') : t('dashboard.trialOffer.paidTitle')}
        </h3>
        <p className="text-xs">
          {isFree ? t('dashboard.trialOffer.freeDesc') : t('dashboard.trialOffer.paidDesc')}
        </p>
      </div>
      <dl className="subscription-hero-trial-metrics">
        <div>
          <dt>{t('subscription.stepPeriod')}</dt>
          <dd>{t('subscription.days', { count: trialInfo.duration_days })}</dd>
        </div>
        <div>
          <dt>{t('subscription.traffic')}</dt>
          <dd>
            {trialInfo.traffic_limit_gb > 0
              ? formatTraffic(trialInfo.traffic_limit_gb, undefined, { trimTrailingZero: true })
              : t('dashboard.unlimited')}
          </dd>
        </div>
        <div>
          <dt>{t('subscription.devices')}</dt>
          <dd>
            {trialInfo.device_limit > 0
              ? t('subscription.devices', { count: trialInfo.device_limit })
              : t('dashboard.unlimited')}
          </dd>
        </div>
      </dl>
      {paid && (
        <p className="text-sm">
          <strong className="text-champagne-50">
            {formatAmount(trialInfo.price_rubles)} {currencySymbol}
          </strong>
          {!canAfford && !waitingForBalance && (
            <span className="mt-1 block">{t('subscription.trial.insufficientBalance')}</span>
          )}
        </p>
      )}
      {trialError && (
        <p role="alert" className="text-sm text-red-200">
          {trialError}
        </p>
      )}
      {paid && !waitingForBalance && !canAfford ? (
        <SubscriptionHeroLink to="/balance">
          {t('subscription.trial.topUpToActivate')}
        </SubscriptionHeroLink>
      ) : (
        <SubscriptionHeroButton
          onClick={activate}
          disabled={waitingForBalance || activateTrialMutation.isPending}
        >
          {activateTrialMutation.isPending
            ? t('common.loading')
            : waitingForBalance
              ? t('dashboard.dataUnavailable')
              : paid
                ? t('subscription.trial.payAndActivate')
                : t('subscription.trial.activate')}
        </SubscriptionHeroButton>
      )}
    </div>
  );
}
