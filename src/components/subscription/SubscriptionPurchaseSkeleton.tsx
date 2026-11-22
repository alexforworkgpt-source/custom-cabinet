import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { SkeletonGroup, SkeletonSurface } from '../ui/skeleton';
import { PurchaseCTAPresentation } from './PurchaseCTAPresentation';

export function SubscriptionPurchaseSkeleton({
  children,
  announce = true,
  secondary,
}: {
  children?: ReactNode;
  announce?: boolean;
  secondary?: ReactNode;
}) {
  const { t } = useTranslation();
  const content = (
    <div className="space-y-3">
      <SkeletonSurface>
        {children ?? (
          <PurchaseCTAPresentation
            title={t('subscription.extend')}
            hint={t('subscription.classicRenewHint')}
            reserveSpace
            compactOnMobile
            measuring
          />
        )}
      </SkeletonSurface>
      {secondary && <SkeletonSurface>{secondary}</SkeletonSurface>}
    </div>
  );
  return (
    <div data-subscription-purchase-loading>
      {announce ? (
        <SkeletonGroup className="motion-safe:animate-pulse">{content}</SkeletonGroup>
      ) : (
        content
      )}
    </div>
  );
}
