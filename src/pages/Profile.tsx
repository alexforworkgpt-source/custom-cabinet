import { uiLocale } from '@/utils/uiLocale';
import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { usePlatform } from '@/platform';
import { copyToClipboard } from '@/utils/clipboard';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/auth';
import { displayName } from '../utils/displayName';
import { referralApi } from '../api/referral';
import { brandingApi, type EmailAuthEnabled } from '../api/branding';
import { Card } from '@/components/data-display/Card';
import { Button } from '@/components/primitives/Button';
import { staggerContainer, staggerItem } from '@/components/motion/transitions';
import {
  ArrowRightIcon,
  CheckIcon,
  ChevronRightIcon,
  CopyIcon,
  ShareIcon,
  UsersIcon,
} from '@/components/icons';
import ProfileHubSections, { ProfileAdminSection } from '@/components/profile/ProfileHubSections';
import { useTheme } from '@/hooks/useTheme';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';

export default function Profile() {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const isAdmin = useAuthStore((state) => state.isAdmin);
  const logout = useAuthStore((state) => state.logout);
  const { toggleTheme, isDark, canToggle: canToggleTheme } = useTheme();
  const { wheelEnabled, hasContests, hasPolls, giftEnabled } = useFeatureFlags();

  const [copied, setCopied] = useState(false);

  // Referral data
  const { data: referralInfo } = useQuery({
    queryKey: ['referral-info'],
    queryFn: referralApi.getReferralInfo,
  });

  const { data: referralTerms } = useQuery({
    queryKey: ['referral-terms'],
    queryFn: referralApi.getReferralTerms,
  });

  const { data: branding } = useQuery({
    queryKey: ['branding'],
    queryFn: brandingApi.getBranding,
    staleTime: 60000,
  });

  // Check if email auth is enabled
  const { data: emailAuthConfig } = useQuery<EmailAuthEnabled>({
    queryKey: ['email-auth-enabled'],
    queryFn: brandingApi.getEmailAuthEnabled,
    staleTime: 60000,
  });
  const isEmailAuthEnabled = emailAuthConfig?.enabled ?? true;

  // Build referral link for cabinet
  const referralLink = referralInfo?.referral_code
    ? `${window.location.origin}/login?ref=${referralInfo.referral_code}`
    : '';

  const copyReferralLink = () => {
    if (referralLink) {
      void copyToClipboard(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareReferralLink = () => {
    if (!referralLink) return;
    const shareText = t('referral.shareMessage', {
      percent: referralInfo?.commission_percent || 0,
      botName: branding?.name || import.meta.env.VITE_APP_NAME || 'Cabinet',
    });

    if (navigator.share) {
      navigator
        .share({
          title: t('referral.title'),
          text: shareText,
          url: referralLink,
        })
        .catch(() => {});
      return;
    }

    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(shareText)}`;
    openTelegramLink(telegramUrl);
  };

  const { openTelegramLink, haptic } = usePlatform();

  return (
    <motion.div
      className="space-y-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl font-bold text-dark-50 sm:text-3xl">{t('profile.title')}</h1>
      </motion.div>

      {/* User Info Card */}
      <motion.div variants={staggerItem}>
        <Card size="md">
          <h2 className="mb-2 text-base font-semibold text-dark-100">{t('profile.accountInfo')}</h2>
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
              {user?.username && (
                <div className="flex min-h-12 items-center justify-between gap-4 py-2">
                  <span className="text-dark-400">{t('profile.username')}</span>
                  <span className="min-w-0 break-all text-right font-medium text-dark-100">
                    @{user.username}
                  </span>
                </div>
              )}
              <div className="flex min-h-12 items-center justify-between gap-4 py-2">
                <span className="text-dark-400">{t('profile.name')}</span>
                <span className="min-w-0 break-words text-right font-medium text-dark-100">
                  {displayName(user)}
                </span>
              </div>
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

      {/* Referral Link Widget — self-animated: mounts after the referral queries
          resolve, when the parent stagger orchestration has already finished and
          would leave it stuck at opacity 0 */}
      {referralTerms?.is_enabled && referralLink && (
        <motion.div variants={staggerItem} initial="initial" animate="animate">
          <Card size="md">
            <div className="mb-2 flex items-start justify-between gap-3">
              <h2 className="text-base font-semibold text-dark-100">{t('referral.yourLink')}</h2>
              <Link
                to="/referral"
                aria-label={t('referral.title')}
                className="flex shrink-0 items-center gap-1 text-accent-400 transition-colors hover:text-accent-300"
              >
                <span className="hidden text-sm sm:inline">{t('referral.title')}</span>
                <ArrowRightIcon className="h-4 w-4" />
              </Link>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex-1">
                <input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="input w-full text-sm"
                  aria-label={t('referral.yourLink')}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={copyReferralLink}
                  variant={copied ? 'primary' : 'primary'}
                  className={copied ? 'bg-success-500 hover:bg-success-500' : ''}
                >
                  {copied ? <CheckIcon /> : <CopyIcon />}
                  <span className="ml-2">
                    {copied ? t('referral.copied') : t('referral.copyLink')}
                  </span>
                </Button>
                <Button
                  onClick={shareReferralLink}
                  variant="secondary"
                  aria-label={t('referral.shareButton')}
                >
                  <ShareIcon className="h-4 w-4" />
                  <span className="ml-2 hidden sm:inline">{t('referral.shareButton')}</span>
                </Button>
              </div>
            </div>
            <p className="mt-2 text-xs text-dark-500">
              {t('referral.shareHint', { percent: referralInfo?.commission_percent || 0 })}
            </p>
          </Card>
        </motion.div>
      )}

      {isAdmin && (
        <motion.div variants={staggerItem}>
          <ProfileAdminSection />
        </motion.div>
      )}

      <motion.div variants={staggerItem} className="pt-2">
        <Button
          fullWidth
          variant="destructive"
          onClick={() => {
            haptic.impact('light');
            logout();
          }}
        >
          {t('nav.logout')}
        </Button>
      </motion.div>
    </motion.div>
  );
}
