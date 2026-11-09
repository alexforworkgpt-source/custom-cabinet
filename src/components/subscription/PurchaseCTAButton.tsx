import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { Subscription } from '../../types';
import {
  canRenewSubscription,
  needsTariff,
  tariffSelectionPath,
} from '../../utils/legacySubscription';
import { PurchaseCTAPresentation } from './PurchaseCTAPresentation';
import { FundingNotice } from './FundingNotice';
import { PageEntranceItem } from '../motion/PageEntrance';

interface PurchaseCTAButtonProps {
  subscription: Subscription | null;
  /** In multi-tariff mode, link to /subscriptions/:id/renew instead of /subscription/purchase */
  isMultiTariff?: boolean;
  /** Explicit sales mode from purchase-options; a missing tariff alone is ambiguous. */
  isClassic?: boolean;
  loading?: boolean;
  /** Cached conditions may describe the action while fresh data is still pending. */
  conditionsKnown?: boolean;
  reserveSpace?: boolean;
  compactOnMobile?: boolean;
}

export default function PurchaseCTAButton({
  subscription,
  isMultiTariff = false,
  isClassic = false,
  loading = false,
  conditionsKnown = true,
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
  const unknownSalesMode = loading && !conditionsKnown && ambiguousClassic;
  const content = (
    <PurchaseCTAPresentation
      pending={loading}
      title={unknownSalesMode ? t('common.loading') : buttonText}
      hint={unknownSalesMode ? t('subscription.cta.checkingConditions') : hintText}
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

  if (loading) {
    return (
      <PageEntranceItem>
        <div role="status" aria-busy="true" data-subscription-purchase-loading>
          {content}
        </div>
      </PageEntranceItem>
    );
  }

  if (isClassic && subscription && !isTrial && !requiresTariff && !canRenewCurrentSubscription) {
    return (
      <PageEntranceItem>
        <FundingNotice>{t('subscription.cta.renewUnavailable')}</FundingNotice>
      </PageEntranceItem>
    );
  }

  return (
    <PageEntranceItem>
      <Link to={linkTo} className="block">
        {content}
      </Link>
    </PageEntranceItem>
  );
}
