import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { Card } from '@/components/data-display/Card';
import { BookOpenIcon, ChevronRightIcon } from '@/components/icons';
import { Button } from '@/components/primitives/Button';

export function SupportInstructionsCard() {
  const { t } = useTranslation();

  return (
    <Card
      size="sm"
      role="region"
      aria-label={t('instructions.title')}
      className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
    >
      <div className="flex min-w-0 items-start gap-3">
        <span className="shrink-0 text-accent-400" aria-hidden="true">
          <BookOpenIcon className="h-6 w-6" />
        </span>
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-dark-100">{t('instructions.title')}</h2>
          <p className="mt-1 text-sm leading-relaxed text-dark-400">
            {t('support.instructionsDescription')}
          </p>
        </div>
      </div>
      <Button asChild variant="secondary" className="min-h-11 h-auto py-2.5">
        <Link to="/instructions" state={{ instructionsOrigin: 'support' }}>
          {t('support.openInstructions')}
          <span aria-hidden="true">
            <ChevronRightIcon className="h-4 w-4 shrink-0 rtl:rotate-180" />
          </span>
        </Link>
      </Button>
    </Card>
  );
}
