import { useTranslation } from 'react-i18next';
import { LockIcon } from './icons';

export function EnvLockedBadge() {
  const { t } = useTranslation();

  return (
    <span
      className="inline-flex items-center gap-1 rounded-full bg-dark-600/50 px-2 py-0.5 text-xs font-medium text-dark-400"
      title={t('admin.settings.envLockedHint')}
      aria-label={t('admin.settings.envLockedHint')}
    >
      <LockIcon className="h-3 w-3" />
      <span aria-hidden="true">{t('admin.settings.envLocked')}</span>
    </span>
  );
}
