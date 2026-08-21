import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { usePlatform } from '../platform';
import { BackIcon } from './icons';

interface WebBackButtonProps {
  to: string;
  replace?: boolean;
  className?: string;
  ariaLabel?: string;
}

/**
 * Back button visible only on web platform.
 * Hidden in Telegram Mini App — native back button handles navigation there.
 */
export function WebBackButton({ to, replace, className, ariaLabel }: WebBackButtonProps) {
  const { t } = useTranslation();
  const { platform } = usePlatform();

  if (platform === 'telegram') return null;

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
