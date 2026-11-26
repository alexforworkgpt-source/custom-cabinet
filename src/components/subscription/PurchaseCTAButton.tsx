import { Fragment, useState, type ComponentPropsWithoutRef } from 'react';
import { useHref, useLinkClickHandler } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { Subscription } from '../../types';
import { AdjustmentsIcon, ChevronRightIcon } from '../icons';
import {
  canRenewSubscription,
  canConfigureExpiredClassic,
  needsTariff,
  tariffSelectionPath,
} from '../../utils/legacySubscription';
import { PurchaseCTAPresentation } from './PurchaseCTAPresentation';
import { FundingNotice } from './FundingNotice';
import { PageEntranceItem } from '../motion/PageEntrance';
import { SubscriptionPurchaseSkeleton } from './SubscriptionPurchaseSkeleton';

interface PurchaseCTAButtonProps {
  subscription: Subscription | null;
  /** In multi-tariff mode, link to /subscriptions/:id/renew instead of /subscription/purchase */
  isMultiTariff?: boolean;
  /** Explicit sales mode from purchase-options; a missing tariff alone is ambiguous. */
  isClassic?: boolean;
  loading?: boolean;
  disabled?: boolean;
  animateEntrance?: boolean;
  /** Cached conditions may describe the action while fresh data is still pending. */
  conditionsKnown?: boolean;
  reserveSpace?: boolean;
  compactOnMobile?: boolean;
  withinLoadingGroup?: boolean;
}

function PurchaseActionLink({
  to,
  disabled,
  ...props
}: Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'onClick'> & {
  to: string;
  disabled: boolean;
}) {
  const href = useHref(to);
  const navigate = useLinkClickHandler(to);
  return (
    <a
      {...props}
      href={disabled ? undefined : href}
      role={disabled ? 'link' : undefined}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? 0 : undefined}
      onClick={disabled ? (event) => event.preventDefault() : navigate}
    />
  );
}

export default function PurchaseCTAButton({
  subscription,
  isMultiTariff = false,
  isClassic = false,
  loading = false,
  disabled = false,
  animateEntrance = true,
  conditionsKnown = true,
  reserveSpace = false,
  compactOnMobile = false,
  withinLoadingGroup = false,
}: PurchaseCTAButtonProps) {
  const { t } = useTranslation();
  const [focused, setFocused] = useState(false);
  const Entrance = animateEntrance ? PageEntranceItem : Fragment;
  const preserveFocus = loading && focused && !withinLoadingGroup;

  const isExpired =
    !subscription ||
    (!subscription.is_active && !subscription.is_trial && !subscription.is_limited);
  const isTrial = subscription?.is_trial;
  const isDaily = subscription?.is_daily;
  const requiresTariff = needsTariff(subscription);
  const canRenewCurrentSubscription = canRenewSubscription(subscription, isClassic);
  const isClassicRenewal = canRenewCurrentSubscription && isClassic && !subscription?.tariff_id;
  const configureClassic = isClassicRenewal && canConfigureExpiredClassic(subscription);
  const chooseTariff = !isClassic && !!subscription?.tariff_id && canRenewCurrentSubscription;

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
      measuring={loading && !preserveFocus}
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

  const secondaryTitle = t(
    configureClassic ? 'subscription.cta.changeTerms' : 'subscription.cta.chooseTariff',
  );
  const secondaryClassName = `flex min-h-16 w-full items-center rounded-2xl border border-dark-700/60 bg-dark-900/70 text-start transition-colors hover:border-dark-600/80 hover:bg-dark-800/70 ${compactOnMobile ? 'gap-2 p-3 sm:gap-3 sm:p-4' : 'gap-3 p-4'}`;
  const secondary = conditionsKnown && subscription && (configureClassic || chooseTariff) && (
    <>
      <span
        className={`flex shrink-0 items-center justify-center rounded-xl bg-accent-500/10 text-accent-400 ${compactOnMobile ? 'h-9 w-9 sm:h-11 sm:w-11' : 'h-11 w-11'}`}
        aria-hidden="true"
      >
        <AdjustmentsIcon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-dark-100">{secondaryTitle}</span>
        <span className="mt-0.5 block text-xs text-dark-400">
          {t(
            configureClassic
              ? 'subscription.cta.changeTermsHint'
              : 'subscription.cta.chooseTariffHint',
          )}
        </span>
      </span>
      <ChevronRightIcon className="h-5 w-5 shrink-0 text-dark-500 rtl:rotate-180" />
    </>
  );

  const renewUnavailable =
    isClassic && subscription && !isTrial && !requiresTariff && !canRenewCurrentSubscription;
  const unavailable = renewUnavailable && (
    <FundingNotice>{t('subscription.cta.renewUnavailable')}</FundingNotice>
  );

  if (loading && !preserveFocus) {
    const placeholder = (
      <SubscriptionPurchaseSkeleton
        announce={!withinLoadingGroup}
        secondary={secondary ? <div className={secondaryClassName}>{secondary}</div> : undefined}
      >
        {unavailable || content}
      </SubscriptionPurchaseSkeleton>
    );
    return withinLoadingGroup ? placeholder : <PageEntranceItem>{placeholder}</PageEntranceItem>;
  }

  if (unavailable) return <Entrance>{unavailable}</Entrance>;

  const actionProps = {
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    disabled: disabled || loading,
  };

  return (
    <Entrance>
      <PurchaseActionLink
        {...actionProps}
        to={linkTo}
        className="block aria-disabled:cursor-not-allowed"
      >
        {content}
      </PurchaseActionLink>
      {secondary && subscription && (
        <PurchaseActionLink
          {...actionProps}
          to={tariffSelectionPath(subscription.id) + (configureClassic ? '&mode=configure' : '')}
          aria-label={secondaryTitle}
          className={`mt-3 ${secondaryClassName} aria-disabled:cursor-not-allowed`}
        >
          {secondary}
        </PurchaseActionLink>
      )}
    </Entrance>
  );
}
