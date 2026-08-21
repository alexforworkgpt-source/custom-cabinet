import type { ComponentType, ReactNode } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/data-display/Card';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import {
  ChevronRightIcon,
  ClipboardIcon,
  CreditCardIcon,
  DocumentIcon,
  GiftIcon,
  GlobeIcon,
  InfoIcon,
  LockIcon,
  MoonIcon,
  PaletteIcon,
  ShieldIcon,
  SunIcon,
  TrophyIcon,
  WheelIcon,
} from '@/components/icons';
import { BellIcon } from '@/components/icons/extended-icons';

interface ProfileHubSectionsProps {
  isDark: boolean;
  canToggleTheme: boolean;
  onToggleTheme: () => void;
  giftEnabled?: boolean;
  wheelEnabled?: boolean;
  hasContests?: boolean;
  hasPolls?: boolean;
}

interface HubLinkProps {
  to: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}

function HubLink({ to, icon: Icon, children }: HubLinkProps) {
  return (
    <Link
      to={to}
      className="group flex min-h-12 items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-dark-200 transition-colors hover:bg-dark-800/70 hover:text-dark-100"
    >
      <Icon className="h-5 w-5 shrink-0 text-dark-400 transition-colors group-hover:text-accent-400" />
      <span className="min-w-0 flex-1 break-words">{children}</span>
      <ChevronRightIcon className="h-4 w-4 shrink-0 text-dark-500 transition-colors group-hover:text-dark-300 rtl:rotate-180" />
    </Link>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-2 text-base font-semibold text-dark-100">{children}</h2>;
}

export default function ProfileHubSections({
  isDark,
  canToggleTheme,
  onToggleTheme,
  giftEnabled,
  wheelEnabled,
  hasContests,
  hasPolls,
}: ProfileHubSectionsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid items-start gap-4 lg:grid-cols-2">
      <Card size="md" className="z-20 overflow-visible">
        <SectionTitle>{t('profile.hub.preferences')}</SectionTitle>
        <div
          role="group"
          aria-label={t('profile.hub.preferences')}
          className="divide-y divide-dark-700"
        >
          {canToggleTheme && (
            <div className="flex min-h-12 items-center gap-3 px-2 py-1">
              <PaletteIcon className="h-5 w-5 shrink-0 text-dark-400" />
              <span className="min-w-0 flex-1 text-sm font-medium text-dark-200">
                {t('profile.hub.theme')}
              </span>
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex min-h-11 shrink-0 items-center gap-2 rounded-lg px-2.5 text-sm font-medium text-dark-200 transition-colors hover:bg-dark-800/70 hover:text-dark-100"
                aria-label={`${t('profile.hub.chooseTheme')}: ${isDark ? t('theme.dark') : t('theme.light')}`}
                title={`${t('profile.hub.theme')}: ${isDark ? t('theme.dark') : t('theme.light')}`}
              >
                <span>{isDark ? t('theme.dark') : t('theme.light')}</span>
                {isDark ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
              </button>
            </div>
          )}
          <div className="flex min-h-12 items-center gap-3 px-2 py-1">
            <GlobeIcon className="h-5 w-5 shrink-0 text-dark-400" />
            <span className="min-w-0 flex-1 text-sm font-medium text-dark-200">
              {t('profile.hub.language')}
            </span>
            <LanguageSwitcher variant="profile" />
          </div>
          <HubLink to="/profile/notifications" icon={BellIcon}>
            {t('profile.notifications.title')}
          </HubLink>
        </div>
      </Card>

      {(giftEnabled || wheelEnabled || hasContests || hasPolls) && (
        <Card size="md">
          <SectionTitle>{t('profile.hub.more')}</SectionTitle>
          <nav
            aria-label={t('profile.hub.more')}
            className="divide-y divide-dark-700 [&>a]:rounded-none [&>a:first-child]:rounded-t-xl [&>a:last-child]:rounded-b-xl"
          >
            {giftEnabled && (
              <HubLink to="/gift" icon={GiftIcon}>
                {t('nav.gift')}
              </HubLink>
            )}
            {wheelEnabled && (
              <HubLink to="/wheel" icon={WheelIcon}>
                {t('nav.wheel')}
              </HubLink>
            )}
            {hasContests && (
              <HubLink to="/contests" icon={TrophyIcon}>
                {t('contests.title')}
              </HubLink>
            )}
            {hasPolls && (
              <HubLink to="/polls" icon={ClipboardIcon}>
                {t('polls.title')}
              </HubLink>
            )}
          </nav>
        </Card>
      )}

      <Card size="md" className="lg:col-span-2">
        <SectionTitle>{t('profile.hub.information')}</SectionTitle>
        <nav
          aria-label={t('profile.hub.information')}
          className="divide-y divide-dark-700 [&>a]:rounded-none [&>a:first-child]:rounded-t-xl [&>a:last-child]:rounded-b-xl"
        >
          <HubLink to="/info" icon={InfoIcon}>
            {t('nav.info')}
          </HubLink>
          <HubLink to="/offer" icon={DocumentIcon}>
            {t('footer.offer')}
          </HubLink>
          <HubLink to="/privacy" icon={LockIcon}>
            {t('footer.privacy')}
          </HubLink>
          <HubLink to="/recurrent-payments" icon={CreditCardIcon}>
            {t('footer.recurrent')}
          </HubLink>
        </nav>
      </Card>
    </div>
  );
}

export function ProfileAdminSection() {
  const { t } = useTranslation();

  return (
    <Card size="md">
      <SectionTitle>{t('profile.hub.management')}</SectionTitle>
      <nav aria-label={t('profile.hub.management')}>
        <HubLink to="/admin" icon={ShieldIcon}>
          {t('admin.nav.title')}
        </HubLink>
      </nav>
    </Card>
  );
}
