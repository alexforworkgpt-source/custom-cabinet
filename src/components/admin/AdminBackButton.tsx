import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { usePlatform } from '@/platform';
import { BackIcon } from './icons';

interface AdminBackButtonProps {
  to?: string;
  replace?: boolean;
  className?: string;
  ariaLabel?: string;
}

/**
 * Back button for admin pages.
 * Hidden in Telegram Mini App since native back button is used instead.
 */
export function AdminBackButton({
  to = '/admin',
  replace,
  className,
  ariaLabel,
}: AdminBackButtonProps) {
  const { t } = useTranslation();
  const { platform } = usePlatform();

  // In Telegram Mini App, we use native back button
  if (platform === 'telegram') {
    return null;
  }

  return (
    <Link
      to={to}
      replace={replace}
      aria-label={ariaLabel ?? t('common.back')}
      className={
        className ||
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-dark-700 bg-dark-800 transition-colors hover:border-dark-600'
      }
    >
      <BackIcon />
    </Link>
  );
}
