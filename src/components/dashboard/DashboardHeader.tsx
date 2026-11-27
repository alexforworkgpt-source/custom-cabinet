import { useTranslation } from 'react-i18next';
import TicketNotificationBell from '@/components/TicketNotificationBell';
import { useDesktopViewport } from '@/hooks/useDesktopViewport';

export function DashboardHeader() {
  const { t } = useTranslation();
  const isDesktop = useDesktopViewport();

  return (
    <div className="relative z-20 mb-6 pe-14 lg:pe-0">
      <h1 className="text-2xl font-bold text-dark-50 sm:text-3xl">{t('nav.dashboard')}</h1>
      {!isDesktop && (
        <div className="absolute end-0 top-0">
          <TicketNotificationBell className="grid h-11 w-11 place-items-center rounded-[14px]" />
        </div>
      )}
    </div>
  );
}
