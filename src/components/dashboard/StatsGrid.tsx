import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { useCurrency } from '../../hooks/useCurrency';
import { StatCard } from '@/components/stats';
import { CardIcon, ChevronRightIcon, UsersIcon } from '@/components/icons';

interface StatsGridProps {
  balanceRubles: number | null;
  referralCount: number;
  earningsRubles: number;
  refLoading: boolean;
  showReferral?: boolean;
}

const actionLinkClass =
  'group block h-full rounded-xl transition-transform duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-dark-950 active:scale-[0.98] motion-reduce:transform-none motion-reduce:transition-none md:hover:-translate-y-0.5';

export default function StatsGrid({
  balanceRubles,
  referralCount,
  earningsRubles,
  refLoading,
  showReferral = true,
}: StatsGridProps) {
  const { t } = useTranslation();
  const { formatAmount, currencySymbol } = useCurrency();

  const chevron = <ChevronRightIcon className="h-4 w-4 shrink-0 text-dark-500" />;
  const columnClass = showReferral ? 'grid-cols-2' : 'grid-cols-1';
  return (
    <div className={`grid gap-2.5 ${columnClass}`}>
      <Link to="/balance" className={actionLinkClass} data-onboarding="balance">
        <StatCard
          className="border-0 bg-success-500/10 transition-[background-color,box-shadow] duration-200 group-active:bg-success-500/20 motion-reduce:transition-none md:group-hover:bg-success-500/15 md:group-hover:shadow-md"
          label={t('dashboard.stats.balance')}
          labelClassName="text-success-400"
          value={
            balanceRubles === null
              ? t('dashboard.dataUnavailable')
              : `${formatAmount(balanceRubles)} ${currencySymbol}`
          }
          icon={<CardIcon className="h-5 w-5" />}
          tone="success"
          trailing={chevron}
        />
      </Link>
      {showReferral && (
        <Link to="/referral" className={actionLinkClass}>
          <StatCard
            className="border-0 bg-accent-500/10 transition-[background-color,box-shadow] duration-200 group-active:bg-accent-500/20 motion-reduce:transition-none md:group-hover:bg-accent-500/15 md:group-hover:shadow-md"
            label={t('dashboard.stats.referrals')}
            labelClassName="text-accent-400"
            value={`${referralCount}`}
            valueClassName="text-dark-100"
            subValue={`+${formatAmount(earningsRubles)} ${currencySymbol}`}
            icon={<UsersIcon className="h-5 w-5" />}
            tone="accent"
            loading={refLoading}
            trailing={chevron}
          />
        </Link>
      )}
    </div>
  );
}
