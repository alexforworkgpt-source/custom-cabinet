import { useTranslation } from 'react-i18next';
import type { TrafficPurchase } from '../../types';
import type { getGlassColors } from '../../utils/glassTheme';
import { uiLocale } from '../../utils/uiLocale';
import { formatTraffic } from '../../utils/formatTraffic';
import { DownloadIcon } from '../icons';

export function PurchasedTrafficSummary({
  purchases,
  managed,
  glassColors: g,
  accentColor,
}: {
  purchases?: TrafficPurchase[];
  managed: boolean;
  glassColors: ReturnType<typeof getGlassColors>;
  accentColor: string;
}) {
  const { t } = useTranslation();
  if (!purchases?.length) return null;
  return (
    <div className="mb-5">
      <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-dark-400">
        {t('subscription.purchasedTraffic')}
      </div>
      <div className="space-y-2">
        {purchases.map((purchase) => (
          <div
            key={purchase.id}
            className="rounded-[12px] p-3"
            style={{
              background: g.innerBg,
              border: `1px solid ${g.innerBorder}`,
            }}
          >
            <div className="mb-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-[8px]"
                  style={{ background: `${accentColor}12`, color: accentColor }}
                >
                  <DownloadIcon className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm font-semibold text-dark-50">
                  {purchase.traffic_gb} {t('common.units.gb')}
                </span>
              </div>
              <div className="text-right">
                <div
                  className="text-[11px] font-medium"
                  style={{
                    color: purchase.days_remaining === 0 ? '#FF6B35' : g.textSecondary,
                  }}
                >
                  {purchase.days_remaining === 0
                    ? t('subscription.expired')
                    : t('subscription.days', { count: purchase.days_remaining })}
                </div>
                <div className="mt-0.5 font-mono text-[9px] text-dark-500">
                  {t('subscription.trafficResetAt')}:{' '}
                  {new Date(purchase.expires_at).toLocaleDateString(uiLocale(), {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
            {managed &&
              typeof purchase.remaining_gb === 'number' &&
              Number.isFinite(purchase.remaining_gb) &&
              purchase.remaining_gb >= 0 && (
                <p className="mb-2 text-sm tabular-nums text-dark-300">
                  {t('subscription.accounting.packageRemaining', {
                    amount: formatTraffic(purchase.remaining_gb),
                  })}
                </p>
              )}
            <div
              className="relative h-1.5 overflow-hidden rounded-full"
              style={{ background: g.trackBg }}
            >
              <div
                className="absolute inset-0 origin-left rounded-full bg-accent-500 transition-transform duration-500"
                style={{
                  transform: `scaleX(${purchase.progress_percent / 100})`,
                }}
              />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[9px] text-dark-500">
              <span>{new Date(purchase.created_at).toLocaleDateString(uiLocale())}</span>
              <span>{new Date(purchase.expires_at).toLocaleDateString(uiLocale())}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
