import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { promoApi } from '../api/promo';
import { getApiErrorMessage } from '../utils/api-error';
import { ClockIcon, CheckIcon } from './icons';
import { useDestructiveConfirm } from '@/platform/hooks/useNativeDialog';
import { Card } from '@/components/data-display/Card';
import { useDiscountAction } from '../hooks/useDiscountAction';
import type { DiscountNavigationContext } from '../utils/discountAction';
import { ActiveDiscountBanner, UnavailableDiscountBanner } from './promo/ActiveDiscountBanner';
import { usePromoAvailability } from '../hooks/usePromoAvailability';
import { invalidatePromoState } from '../utils/invalidatePromoState';
import { isCurrentPromoOffer } from '../utils/promoExpiry';
import {
  formatOfferTimeLeft as formatTimeLeft,
  getOfferDescription,
  getOfferIcon,
  getOfferTitle,
} from './promo/offerPresentation';

interface PromoOffersSectionProps {
  className?: string;
  context: DiscountNavigationContext;
}

export default function PromoOffersSection({ className = '', context }: PromoOffersSectionProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const confirmDeactivate = useDestructiveConfirm();
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch available offers
  const { data: offers = [], isFetching: offersRefreshing } = useQuery({
    queryKey: ['promo-offers'],
    queryFn: promoApi.getOffers,
    staleTime: 30000,
  });

  // Fetch active discount
  const { data: activeDiscount, isFetching: discountRefreshing } = useQuery({
    queryKey: ['active-discount'],
    queryFn: promoApi.getActiveDiscount,
    staleTime: 30000,
  });
  const availability = usePromoAvailability(activeDiscount, offers);
  const discountNavigation = useDiscountAction(context, availability.currentDiscount);

  // Claim offer mutation
  const claimMutation = useMutation({
    mutationFn: promoApi.claimOffer,
    onSuccess: (result) => {
      invalidatePromoState(queryClient);
      queryClient.invalidateQueries({ queryKey: ['balance'] });
      setSuccessMessage(result.message);
      setClaimingId(null);
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error: unknown) => {
      setErrorMessage(getApiErrorMessage(error, t('promo.offers.activationFailed')));
      setClaimingId(null);
      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  // Deactivate discount mutation.
  // A discount granted by a PROMOCODE must be turned off via the dedicated route
  // (POST /cabinet/promocode/deactivate-discount), which also rolls back the promocode
  // usage (deletes the PromoCodeUse, decrements current_uses, strips the promo group) so
  // the user can re-activate it later. The plain clearActiveDiscount route only zeroes
  // the discount fields and is correct for admin/offer-sourced discounts.
  const deactivateMutation = useMutation({
    mutationFn: async () => {
      const source = activeDiscount?.source ?? '';
      if (source.startsWith('promocode:')) {
        await promoApi.deactivateDiscount();
      } else {
        await promoApi.clearActiveDiscount();
      }
    },
    onSuccess: () => {
      invalidatePromoState(queryClient);

      setSuccessMessage(t('promo.deactivate.success'));
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (error: unknown) => {
      // detail may be a plain string (clearActiveDiscount route) or a structured
      // { code, message } object (deactivate-discount route). Handle both.
      const axiosErr = error as {
        response?: { data?: { detail?: string | { message?: string } } };
      };
      const detail = axiosErr.response?.data?.detail;
      const message = typeof detail === 'string' ? detail : detail?.message;
      setErrorMessage(message || t('promo.deactivate.error'));

      setTimeout(() => setErrorMessage(null), 5000);
    },
  });

  const handleClaim = (offerId: number) => {
    discountNavigation.clearError();
    const offer = offers.find((item) => item.id === offerId);
    if (!offer || !isCurrentPromoOffer(offer)) {
      setErrorMessage(t('promo.navigation.expired'));
      invalidatePromoState(queryClient);
      return;
    }
    setClaimingId(offerId);
    setErrorMessage(null);
    setSuccessMessage(null);
    claimMutation.mutate(offerId);
  };

  const handleDeactivateClick = async () => {
    discountNavigation.clearError();
    setErrorMessage(null);
    setSuccessMessage(null);

    const confirmed = await confirmDeactivate(
      t('promo.deactivate.confirmDescription', {
        percent: activeDiscount?.discount_percent || 0,
      }),
      t('promo.deactivate.confirm'),
      t('promo.deactivate.confirmTitle'),
    );
    if (confirmed) {
      deactivateMutation.mutate();
    }
  };

  // Filter unclaimed and active offers
  const { availableOffers } = availability;

  // Don't render if no offers and no active discount
  if (
    availableOffers.length === 0 &&
    !availability.currentDiscount &&
    !availability.unavailableDiscount &&
    !successMessage &&
    !errorMessage &&
    !discountNavigation.error
  ) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`} data-promo-offers>
      {/* Active Discount Banner with actions */}
      {activeDiscount && availability.currentDiscount && (
        <ActiveDiscountBanner
          discount={activeDiscount}
          now={availability.now}
          label={t(
            discountNavigation.pending ||
              discountNavigation.action.kind === 'loading' ||
              discountNavigation.action.kind === 'needs-mode'
              ? 'common.loading'
              : discountNavigation.error || discountNavigation.action.kind === 'retry'
                ? 'common.retry'
                : discountNavigation.action.labelKey,
          )}
          disabled={
            discountNavigation.pending ||
            claimingId !== null ||
            discountNavigation.action.kind === 'loading' ||
            discountNavigation.action.kind === 'needs-mode'
          }
          pending={discountNavigation.pending}
          onUse={() => {
            setErrorMessage(null);
            void discountNavigation.openDiscount();
          }}
          onDeactivate={() => {
            void handleDeactivateClick();
          }}
          deactivating={deactivateMutation.isPending}
        />
      )}
      {availability.unavailableDiscount && (
        <UnavailableDiscountBanner
          refreshing={discountRefreshing || offersRefreshing}
          deactivating={deactivateMutation.isPending}
          onRefresh={() => invalidatePromoState(queryClient)}
          onDeactivate={() => {
            void handleDeactivateClick();
          }}
        />
      )}

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-xl border border-success-500/30 bg-success-500/10 p-4 text-success-400">
          <CheckIcon />
          <span>{successMessage}</span>
        </div>
      )}

      {(errorMessage || discountNavigation.error) && (
        <div
          role="alert"
          className="rounded-xl border border-error-500/30 bg-error-500/10 p-4 text-error-400"
        >
          {errorMessage || discountNavigation.error}
        </div>
      )}

      {/* Available Offers */}
      {availableOffers.length > 0 && (
        <div className="space-y-3">
          {availableOffers.map((offer) => (
            <Card
              key={offer.id}
              size="lg"
              className="border-warning-500/30 bg-gradient-to-br from-warning-500/5 to-transparent transition-colors hover:border-warning-500/50"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-warning-500/30 to-warning-500/20">
                  {getOfferIcon(offer.effect_type, offer.discount_percent)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <h3 className="font-semibold text-dark-100">{getOfferTitle(offer, t)}</h3>
                    {offer.effect_type === 'test_access' && (
                      <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs text-purple-400">
                        {t('promo.offers.test')}
                      </span>
                    )}
                  </div>
                  <p className="mb-3 text-sm text-dark-400">{getOfferDescription(offer, t)}</p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-1 text-xs text-dark-500">
                      <ClockIcon />
                      <span>
                        {t('promo.offers.remaining', {
                          time: formatTimeLeft(offer.expires_at, t, availability.now),
                        })}
                      </span>
                    </div>
                    <button
                      onClick={() => handleClaim(offer.id)}
                      disabled={claimingId === offer.id}
                      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-warning-500 to-warning-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-warning-500/25 transition-all hover:scale-105 hover:shadow-xl hover:shadow-warning-500/30 active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 sm:w-auto"
                    >
                      {/* Shimmer effect */}
                      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                      {claimingId === offer.id ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>{t('promo.offers.activating')}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-lg">🎁</span>
                          <span>{t('promo.offers.activate')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
