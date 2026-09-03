import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { BackIcon } from '@/components/icons';

export function InstructionSupportReturn({ fromSupport }: { fromSupport: boolean }) {
  const { t } = useTranslation();
  if (!fromSupport) return null;

  return (
    <Link
      to="/support"
      className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-dark-300 transition-colors hover:bg-dark-800/70 hover:text-dark-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
    >
      <BackIcon className="h-5 w-5 rtl:rotate-180" />
      {t('instructions.backToSupport')}
    </Link>
  );
}
