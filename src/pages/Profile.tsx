import { uiLocale } from '@/utils/uiLocale';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { usePlatform } from '@/platform';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/auth';
import { useUserAvatar } from '@/hooks/useUserAvatar';
import { ProfileIdentity } from '@/components/profile/ProfileIdentity';
import { brandingApi, type EmailAuthEnabled } from '../api/branding';
import { Card } from '@/components/data-display/Card';
import { LogoutButton } from '@/components/LogoutButton';
import { staggerItem } from '@/components/motion/transitions';
import { PageEntrance } from '@/components/motion/PageEntrance';
import { ChevronRightIcon, UsersIcon } from '@/components/icons';
import ProfileHubSections, { ProfileAdminSection } from '@/components/profile/ProfileHubSections';
import { useTheme } from '@/hooks/useTheme';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export default function Profile() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const avatar = useUserAvatar(user);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const logout = useAuthStore((state) => state.logout);
  const { toggleTheme, isDark, canToggle: canToggleTheme } = useTheme();
  const { wheelEnabled, hasContests, hasPolls, giftEnabled } = useFeatureFlags();

  // Check if email auth is enabled
  const { data: emailAuthConfig } = useQuery<EmailAuthEnabled>({
    queryKey: ['email-auth-enabled'],
    queryFn: brandingApi.getEmailAuthEnabled,
    staleTime: 60000,
  });
  const isEmailAuthEnabled = emailAuthConfig?.enabled ?? true;

  const { haptic } = usePlatform();

  return (
    <PageEntrance className="space-y-6">
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold text-dark-50 sm:text-3xl">{t('profile.title')}</h1>
      </motion.div>

      {/* User Info Card */}
      <motion.div variants={staggerItem}>
        <Card size="md">
          <ProfileIdentity user={user} avatar={avatar} />
          <div>
            <div className="divide-y divide-dark-700">
              <div className="flex min-h-12 items-center justify-between gap-4 py-2">
                <span className="text-dark-400">{t('profile.telegramId')}</span>
                {user?.telegram_id ? (
                  <span className="min-w-0 break-all text-right font-medium text-dark-100">
                    {user.telegram_id}
                  </span>
                ) : (
                  <Link
                    to="/profile/accounts"
                    aria-label={`${t('profile.accounts.link')} ${t('profile.telegramId')}`}
                    className="flex min-h-11 shrink-0 items-center rounded-lg px-3 text-sm font-medium text-accent-400 transition-colors hover:bg-dark-800/70 hover:text-accent-300"
                  >
                    {t('profile.accounts.link')}
                  </Link>
                )}
              </div>
              {isEmailAuthEnabled && (
                <div className="flex min-h-12 items-center justify-between gap-4 py-2">
                  <span className="text-dark-400">{t('auth.email')}</span>
                  {user?.email ? (
                    <span className="min-w-0 break-all text-right text-sm font-medium text-dark-100">
                      {user.email}
                    </span>
                  ) : (
                    <Link
                      to="/profile/accounts"
                      aria-label={`${t('profile.accounts.link')} ${t('auth.email')}`}
                      className="flex min-h-11 shrink-0 items-center rounded-lg px-3 text-sm font-medium text-accent-400 transition-colors hover:bg-dark-800/70 hover:text-accent-300"
                    >
                      {t('profile.accounts.link')}
                    </Link>
                  )}
                </div>
              )}
              <div className="flex min-h-12 items-center justify-between gap-4 py-2">
                <span className="text-dark-400">{t('profile.registeredAt')}</span>
                <span className="font-medium text-dark-100">
                  {user?.created_at
                    ? new Date(user.created_at).toLocaleDateString(uiLocale())
                    : '-'}
                </span>
              </div>
            </div>
            <Link
              to="/profile/accounts"
              className="group mt-2 flex min-h-12 items-center gap-3 rounded-xl py-2 text-dark-200 transition-colors hover:bg-dark-800/70 hover:text-dark-100"
            >
              <UsersIcon className="h-5 w-5 shrink-0 text-dark-400 transition-colors group-hover:text-accent-400" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">
                  {t('profile.accounts.goToAccounts')}
                </span>
                <span className="block text-xs text-dark-400">
                  {t('profile.accounts.subtitle')}
                </span>
              </span>
              <ChevronRightIcon className="h-4 w-4 shrink-0 text-dark-500 transition-colors group-hover:text-dark-300 rtl:rotate-180" />
            </Link>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={staggerItem}>
        <ProfileHubSections
          isDark={isDark}
          canToggleTheme={canToggleTheme}
          onToggleTheme={() => {
            haptic.impact('light');
            toggleTheme();
          }}
          giftEnabled={giftEnabled}
          wheelEnabled={wheelEnabled}
          hasContests={hasContests}
          hasPolls={hasPolls}
        />
      </motion.div>

      {isAdmin && (
        <motion.div variants={staggerItem}>
          <ProfileAdminSection />
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="pt-2">
        <LogoutButton
          variant="profile"
          onLogout={() => {
            haptic.impact('light');
            logout();
          }}
        />
      </motion.div>
    </PageEntrance>
  );
}
