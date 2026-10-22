import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { Subscription } from '../../types';
import {
  canRenewSubscription,
  needsTariff,
  tariffSelectionPath,
} from '../../utils/legacySubscription';
import { SubscriptionPurchaseSkeleton } from './SubscriptionManagementSkeleton';
import { PurchaseCTAPresentation } from './PurchaseCTAPresentation';
import { FundingNotice } from './FundingNotice';

interface PurchaseCTAButtonProps {
  subscription: Subscription | null;
  /** In multi-tariff mode, link to /subscriptions/:id/renew instead of /subscription/purchase */
  isMultiTariff?: boolean;
  /** Explicit sales mode from purchase-options; a missing tariff alone is ambiguous. */
  isClassic?: boolean;
  loading?: boolean;
  reserveSpace?: boolean;
  compactOnMobile?: boolean;
}

export default function PurchaseCTAButton({
  subscription,
  isMultiTariff = false,
  isClassic = false,
  loading = false,
  reserveSpace = false,
  compactOnMobile = false,
}: PurchaseCTAButtonProps) {
  const { t } = useTranslation();

  const isExpired =
    !subscription ||
    (!subscription.is_active && !subscription.is_trial && !subscription.is_limited);
  const isTrial = subscription?.is_trial;
  const isDaily = subscription?.is_daily;
  const requiresTariff = needsTariff(subscription);
  const canRenewCurrentSubscription = canRenewSubscription(subscription, isClassic);
  const isClassicRenewal = canRenewCurrentSubscription && isClassic && !subscription?.tariff_id;

  // Daily tariffs renew automatically — no manual renewal button needed in multi-tariff
  if (isMultiTariff && isDaily && !isExpired) return null;

  const buttonText = requiresTariff
    ? t('subscription.cta.moveToTariff')
    : canRenewCurrentSubscription
      ? t('subscription.extend')
      : isExpired
        ? t('subscription.getSubscription')
        : isTrial
          ? t('subscription.trialUpgrade.title')
          : t('subscription.extend');

  const hintText = isClassicRenewal
    ? t('subscription.classicRenewHint')
    : isExpired
      ? t(
          !requiresTariff && (canRenewCurrentSubscription || isMultiTariff)
            ? 'subscription.cta.renewHint'
            : 'subscription.cta.expiredHint',
        )
      : requiresTariff
        ? t('subscription.cta.moveToTariffHint')
        : isTrial
          ? t('subscription.cta.trialHint')
          : t('subscription.cta.activeHint');

  // Trial → purchase page (buy a real tariff, trial can't be renewed)
  // Paid classic, periodic tariff and multi-tariff → per-subscription renew page
  // Otherwise → purchase page
  const linkTo =
    requiresTariff && subscription?.id
      ? tariffSelectionPath(subscription.id)
      : isTrial && subscription?.id
        ? tariffSelectionPath(subscription.id)
        : (isMultiTariff || canRenewCurrentSubscription) && subscription?.id
          ? `/subscriptions/${subscription.id}/renew`
          : '/subscription/purchase';

  // Reserve both existing captions while sales_mode is unknown. This is only
  // geometry: no guessed mode, financial link or API permission is exposed.
  const ambiguousClassic = subscription && !subscription.tariff_id && !isTrial && !requiresTariff;
  const content = (
    <PurchaseCTAPresentation
      title={buttonText}
      hint={hintText}
      expired={isExpired}
      reserveSpace={reserveSpace}
      compactOnMobile={compactOnMobile}
      geometryTitles={
        ambiguousClassic ? [t('subscription.extend'), t('subscription.getSubscription')] : []
      }
      geometryHints={
        ambiguousClassic
          ? [
              t('subscription.classicRenewHint'),
              t(
                isExpired
                  ? isMultiTariff
                    ? 'subscription.cta.renewHint'
                    : 'subscription.cta.expiredHint'
                  : 'subscription.cta.activeHint',
              ),
            ]
          : []
      }
    />
  );

  if (loading) return <SubscriptionPurchaseSkeleton>{content}</SubscriptionPurchaseSkeleton>;

  if (isClassic && subscription && !isTrial && !requiresTariff && !canRenewCurrentSubscription) {
    return <FundingNotice>{t('subscription.cta.renewUnavailable')}</FundingNotice>;
  }

  return (
    <Link to={linkTo} className="block">
      {content}
    </Link>
  );
}
