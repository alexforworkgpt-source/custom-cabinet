import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Card } from '@/components/data-display/Card';
import { BookOpenIcon, ChevronRightIcon } from '@/components/icons';

export function SupportInstructionsCard() {
  const { t } = useTranslation();

  return (
    <Card
      asChild
      size="sm"
      interactive
      className="flex min-h-16 items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-400"
    >
      <Link to="/instructions" state={{ instructionsOrigin: 'support' }}>
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dark-800 text-accent-400"
          aria-hidden="true"
        >
          <BookOpenIcon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1 text-sm font-semibold text-dark-100">
          {t('instructions.title')}
        </span>
        <span className="shrink-0 text-dark-400" aria-hidden="true">
          <ChevronRightIcon className="h-4 w-4 rtl:rotate-180" />
        </span>
      </Link>
    </Card>
  );
}
