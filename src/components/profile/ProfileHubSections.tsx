import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/data-display/Card';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { ArrowRightIcon, MoonIcon, ShieldIcon, SunIcon } from '@/components/icons';

interface ProfileHubSectionsProps {
  isDark: boolean;
  canToggleTheme: boolean;
  onToggleTheme: () => void;
  giftEnabled?: boolean;
  wheelEnabled?: boolean;
  hasContests?: boolean;
  hasPolls?: boolean;
  isAdmin: boolean;
}

function HubLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="flex min-h-11 items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-medium text-dark-200 transition-colors hover:bg-dark-800/70 hover:text-dark-100"
    >
      <span className="min-w-0 break-words">{children}</span>
      <ArrowRightIcon className="h-4 w-4 shrink-0 text-dark-500 rtl:rotate-180" />
    </Link>
  );
}

export default function ProfileHubSections({
  isDark,
  canToggleTheme,
  onToggleTheme,
  giftEnabled,
  wheelEnabled,
  hasContests,
  hasPolls,
  isAdmin,
}: ProfileHubSectionsProps) {
  const { t } = useTranslation();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="z-20 overflow-visible">
        <h2 className="mb-1 text-lg font-semibold text-dark-100">{t('profile.hub.preferences')}</h2>
        <p className="text-sm text-dark-400">{t('profile.hub.preferencesDescription')}</p>
        <div
          role="group"
          aria-label={t('profile.hub.preferences')}
          className="mt-5 divide-y divide-dark-800/70 rounded-2xl border border-dark-700/60 bg-dark-950/45 px-3 shadow-inner shadow-black/10"
        >
          {canToggleTheme && (
            <div className="flex min-h-16 items-center justify-between gap-4 py-2">
              <span className="text-sm font-medium text-dark-200">
                {t('profile.hub.chooseTheme')}
              </span>
              <button
                type="button"
                onClick={onToggleTheme}
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-dark-700/70 bg-dark-900/80 text-dark-300 transition-colors hover:border-dark-600 hover:bg-dark-800 hover:text-dark-100"
                aria-label={`${t('profile.hub.chooseTheme')}: ${isDark ? t('theme.dark') : t('theme.light')}`}
                title={`${t('profile.hub.theme')}: ${isDark ? t('theme.dark') : t('theme.light')}`}
              >
                {isDark ? <MoonIcon className="h-5 w-5" /> : <SunIcon className="h-5 w-5" />}
              </button>
            </div>
          )}
          <div className="flex min-h-16 items-center justify-between gap-4 py-2">
            <span className="text-sm font-medium text-dark-200">
              {t('profile.hub.changeLanguage')}
            </span>
            <LanguageSwitcher variant="profile" />
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-1 text-lg font-semibold text-dark-100">{t('profile.hub.information')}</h2>
        <p className="mb-3 text-sm text-dark-400">{t('profile.hub.informationDescription')}</p>
        <nav aria-label={t('profile.hub.information')}>
          <HubLink to="/info">{t('nav.info')}</HubLink>
          <HubLink to="/offer">{t('footer.offer')}</HubLink>
          <HubLink to="/privacy">{t('footer.privacy')}</HubLink>
          <HubLink to="/recurrent-payments">{t('footer.recurrent')}</HubLink>
        </nav>
      </Card>

      {(giftEnabled || wheelEnabled || hasContests || hasPolls) && (
        <Card>
          <h2 className="mb-1 text-lg font-semibold text-dark-100">{t('profile.hub.more')}</h2>
          <p className="mb-3 text-sm text-dark-400">{t('profile.hub.moreDescription')}</p>
          <nav aria-label={t('profile.hub.more')}>
            {giftEnabled && <HubLink to="/gift">{t('nav.gift')}</HubLink>}
            {wheelEnabled && <HubLink to="/wheel">{t('nav.wheel')}</HubLink>}
            {hasContests && <HubLink to="/contests">{t('contests.title')}</HubLink>}
            {hasPolls && <HubLink to="/polls">{t('polls.title')}</HubLink>}
          </nav>
        </Card>
      )}

      {isAdmin && (
        <Card>
          <HubLink to="/admin">
            <span className="flex items-center gap-2">
              <ShieldIcon className="h-4 w-4 text-warning-400" />
              {t('admin.nav.title')}
            </span>
          </HubLink>
        </Card>
      )}
    </div>
  );
}
