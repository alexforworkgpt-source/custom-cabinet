import { useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { subscriptionApi } from '../../../api/subscription';
import { usePlatform } from '../../../platform';
import { getErrorMessage } from '../../../utils/subscriptionHelpers';
import { openPaymentUrl } from '../../../utils/openPaymentUrl';
import { Button } from '../../primitives/Button';

interface Props {
  tariffId: number;
  disabled: boolean;
  onPendingChange?: (pending: boolean) => void;
  claimPurchase?: () => boolean;
  releasePurchase?: () => void;
}

export function CasheraPurchaseAction({
  tariffId,
  disabled,
  onPendingChange,
  claimPurchase,
  releasePurchase,
}: Props) {
  const { t } = useTranslation();
  const client = useQueryClient();
  const navigate = useNavigate();
  const { platform, openLink } = usePlatform();
  const inFlight = useRef(false);
  const purchase = useMutation({
    mutationFn: () => subscriptionApi.purchaseWithCasheraRecurring(tariffId),
    onSuccess: (data) => {
      if (data.redirect_url) openPaymentUrl(data.redirect_url, platform, openLink);
      client.invalidateQueries({ queryKey: ['subscription'] });
      client.invalidateQueries({ queryKey: ['purchase-options'] });
      client.invalidateQueries({ queryKey: ['subscriptions-list'] });
      client.invalidateQueries({ queryKey: ['cashera-recurring', data.subscription_id] });
      navigate('/subscriptions', { replace: true });
    },
    onSettled: () => {
      inFlight.current = false;
      onPendingChange?.(false);
      releasePurchase?.();
    },
  });
  const submit = () => {
    if (disabled || inFlight.current || (claimPurchase && !claimPurchase())) return;
    inFlight.current = true;
    onPendingChange?.(true);
    purchase.mutate();
  };
  return (
    <div className="mt-3 space-y-2">
      <Button
        variant="secondary"
        size="lg"
        fullWidth
        loading={purchase.isPending}
        disabled={disabled}
        onClick={submit}
      >
        {t('subscription.casheraRecurring.purchaseButton')}
      </Button>
      <p className="text-center text-xs text-dark-400">
        {t('subscription.casheraRecurring.purchaseHint')}
      </p>
      <p className="text-center text-xs text-dark-400">
        {t('subscription.casheraRecurring.purchaseTermsNote')}
      </p>
      {purchase.isError && (
        <p role="alert" className="text-center text-sm text-error-400">
          {getErrorMessage(purchase.error)}
        </p>
      )}
    </div>
  );
}
