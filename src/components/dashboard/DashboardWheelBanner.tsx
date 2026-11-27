import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import wheel from '@/assets/cabinet-robot/banner-wheel.webp';
import { ChevronRightIcon } from '@/components/icons';

export function DashboardWheelBanner() {
  const { t } = useTranslation();
  return (
    <Link
      to="/wheel"
      className="bento-card-hover group flex items-center gap-2 bg-[radial-gradient(ellipse_at_12%_45%,#3974b134,transparent_55%)] px-3 py-2.5 motion-reduce:transform-none motion-reduce:transition-none"
    >
      <img
        src={wheel}
        alt=""
        width={62}
        height={54}
        className="h-[54px] w-[62px] shrink-0 object-contain motion-safe:transition-transform motion-safe:group-hover:scale-[1.04]"
      />
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-dark-100">{t('wheel.banner.title')}</h3>
        <p className="text-xs text-dark-400">{t('wheel.banner.description')}</p>
      </div>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-dark-500 group-hover:text-accent-400 rtl:rotate-180" />
    </Link>
  );
}
