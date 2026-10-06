import { useEffect, useRef, type ComponentType, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/data-display/Card';
import { BackIcon } from '@/components/icons';
import { WebBackButton } from '@/components/WebBackButton';
import { Button } from '@/components/primitives/Button';
import { HubLink } from '@/components/profile/HubLink';
import { cn } from '@/lib/utils';

export interface InfoSection {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  emoji?: string;
}

interface InfoNavigationProps {
  sections: InfoSection[];
  activeSection: string;
  showMobileContent: boolean;
  sectionHref: string;
  onSelect: (id: string) => void;
  onBack: () => void;
  children: ReactNode;
}

export function InfoNavigation({
  sections,
  activeSection,
  showMobileContent,
  sectionHref,
  onSelect,
  onBack,
  children,
}: InfoNavigationProps) {
  const { t } = useTranslation();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const selectedLinkRef = useRef<HTMLAnchorElement>(null);
  const wasShowingContent = useRef(false);
  const selected = sections.find((section) => section.id === activeSection);

  useEffect(() => {
    const target = showMobileContent
      ? headingRef.current
      : wasShowingContent.current
        ? selectedLinkRef.current
        : null;
    if (target && target.offsetParent !== null) target.focus({ preventScroll: true });
    wasShowingContent.current = showMobileContent;
  }, [showMobileContent]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3 md:hidden">
        {showMobileContent ? (
          <Button
            variant="ghost"
            size="icon-lg"
            onClick={onBack}
            aria-label={t('common.back')}
            className="shrink-0"
          >
            <BackIcon className="h-5 w-5 rtl:rotate-180" />
          </Button>
        ) : (
          <WebBackButton to="/profile" />
        )}
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="min-w-0 break-words text-2xl font-bold text-dark-50 sm:text-3xl"
        >
          {showMobileContent ? (selected?.label ?? t('info.title')) : t('info.title')}
        </h1>
      </div>

      <Card size="md" className={cn('md:hidden', showMobileContent && 'hidden')}>
        <nav
          aria-label={t('info.title')}
          className="divide-y divide-dark-700 [&>a]:rounded-none [&>a:first-child]:rounded-t-xl [&>a:last-child]:rounded-b-xl"
        >
          {sections.map((section) => (
            <HubLink
              key={section.id}
              ref={section.id === activeSection ? selectedLinkRef : undefined}
              to={sectionHref}
              replace={false}
              state={{ infoSection: section.id }}
              icon={section.icon}
              emoji={section.emoji}
              onClick={() => onSelect(section.id)}
            >
              {section.label}
            </HubLink>
          ))}
        </nav>
      </Card>

      <div className="hidden items-center gap-3 md:flex">
        <WebBackButton to="/profile" />
        <h1 className="min-w-0 text-2xl font-bold text-dark-50 sm:text-3xl">{t('info.title')}</h1>
      </div>
      <div className="hidden flex-wrap gap-2 pb-1 md:flex">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onSelect(section.id)}
            aria-pressed={activeSection === section.id}
            className={cn(
              'flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
              activeSection === section.id
                ? 'bg-accent-500 text-on-accent'
                : 'bg-dark-800 text-dark-300 hover:bg-dark-700',
            )}
          >
            {section.emoji ? <span className="text-base">{section.emoji}</span> : <section.icon />}
            <span className="max-w-[140px] truncate">{section.label}</span>
          </button>
        ))}
      </div>
      <div className={cn('min-w-0', !showMobileContent && 'hidden md:block')}>{children}</div>
    </div>
  );
}
