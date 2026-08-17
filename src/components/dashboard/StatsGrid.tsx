import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useCurrency } from '../../hooks/useCurrency';
import { StatCard } from '@/components/stats';
import { CardIcon, ChevronRightIcon, DevicesIcon, UsersIcon } from '@/components/icons';

interface DevicesStat {
  used: number | null;
  limit: number;
  onOpen: () => void;
}

interface StatsGridProps {
  balanceRubles: number | null;
  referralCount: number;
  earningsRubles: number;
  refLoading: boolean;
  showReferral?: boolean;
  devices?: DevicesStat;
}

export default function StatsGrid({
  balanceRubles,
  referralCount,
  earningsRubles,
  refLoading,
  showReferral = true,
  devices,
}: StatsGridProps) {
  const { t } = useTranslation();
  const { formatAmount, currencySymbol } = useCurrency();

  const chevron = <ChevronRightIcon className="h-4 w-4 shrink-0 text-dark-500" />;
  const columnClass =
    showReferral && devices
      ? 'grid-cols-3'
      : showReferral || devices
        ? 'grid-cols-2'
        : 'grid-cols-1';
  return (
    <div className={`grid gap-2.5 ${columnClass}`}>
      <Link to="/balance/top-up" className="block h-full" data-onboarding="balance">
        <StatCard
          label={t('dashboard.stats.balance')}
          value={
            balanceRubles === null
              ? t('dashboard.dataUnavailable')
              : `${formatAmount(balanceRubles)} ${currencySymbol}`
          }
          icon={<CardIcon className="h-5 w-5" />}
          tone="accent"
          trailing={chevron}
        />
      </Link>
      {showReferral && (
        <Link to="/referral" className="block h-full">
          <StatCard
            label={t('dashboard.stats.referrals')}
            value={`${referralCount}`}
            subValue={`+${formatAmount(earningsRubles)} ${currencySymbol}`}
            icon={<UsersIcon className="h-5 w-5" />}
            tone="neutral"
            loading={refLoading}
            trailing={chevron}
          />
        </Link>
      )}
      {devices && (
        <button
          type="button"
          className="block h-full w-full text-left"
          aria-haspopup="dialog"
          onClick={devices.onOpen}
        >
          <StatCard
            label={t('subscription.myDevices')}
            value={
              devices.used === null
                ? t('dashboard.dataUnavailable')
                : devices.limit === 0
                  ? `${devices.used} / ∞`
                  : `${devices.used} / ${devices.limit}`
            }
            icon={<DevicesIcon className="h-5 w-5" />}
            tone="neutral"
            trailing={chevron}
          />
        </button>
      )}
    </div>
  );
}
