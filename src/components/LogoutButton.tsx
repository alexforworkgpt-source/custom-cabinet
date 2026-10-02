import { useTranslation } from 'react-i18next';
import { useIsTelegram } from '@/platform/hooks/usePlatform';
import { LogoutIcon } from '@/components/icons';
import { Button } from '@/components/primitives/Button';

interface LogoutButtonProps {
  /** `menu` — мобильное меню, `icon` — широкая шапка, `profile` — страница профиля. */
  variant: 'menu' | 'icon' | 'profile';
  onLogout: () => void;
}

/**
 * В Telegram авторизация восстанавливается из initData сразу после logout,
 * поэтому кнопку выхода показываем только в обычном браузере.
 */
export function LogoutButton({ variant, onLogout }: LogoutButtonProps) {
  const { t } = useTranslation();
  const isTelegram = useIsTelegram();
  if (isTelegram) return null;

  if (variant === 'menu') {
    return (
      <button type="button" onClick={onLogout} className="nav-item w-full text-error-400">
        <LogoutIcon className="h-5 w-5" />
        {t('nav.logout')}
      </button>
    );
  }

  if (variant === 'profile') {
    return (
      <Button fullWidth variant="destructive" onClick={onLogout}>
        {t('nav.logout')}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      className="rounded-xl border border-dark-700/50 bg-dark-800/50 p-2 text-dark-400 transition-colors duration-200 hover:bg-dark-700 hover:text-accent-400"
      aria-label={t('nav.logout')}
      title={t('nav.logout')}
    >
      <LogoutIcon className="h-5 w-5" />
    </button>
  );
}
