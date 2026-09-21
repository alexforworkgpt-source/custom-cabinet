import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams, useSearchParams } from 'react-router';
import {
  BackIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  InfoIcon,
} from '@/components/icons';
import { InstructionSteps } from '@/components/instructions/InstructionSteps';
import { InstructionSupportReturn } from '@/components/instructions/InstructionSupportReturn';
import { staggerContainer, staggerItem } from '@/components/motion/transitions';
import { Button } from '@/components/primitives/Button';
import { Card } from '@/components/data-display/Card';
import { getInstructionArticle } from '@/content/instructionArticles';
import {
  getInstructionNavigation,
  resolveInstructionActionRoute,
} from '@/content/instructionNavigation';
import { instructionSummaries } from '@/content/instructions';

export default function InstructionArticlePage() {
  const { t, i18n } = useTranslation();
  const { slug } = useParams();
  const fromSupport = useLocation().state?.instructionsOrigin === 'support';
  const instructionState = fromSupport ? { instructionsOrigin: 'support' } : undefined;
  const article = getInstructionArticle(slug);
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedScenario = searchParams.get('scenario');
  const openScenario = article?.scenarios?.some((scenario) => scenario.id === requestedScenario)
    ? requestedScenario
    : null;
  const reducedMotion = useReducedMotion();
  const isRussian = i18n.language.split('-')[0] === 'ru';

  if (!article) {
    return (
      <div className="mx-auto flex min-h-72 w-full max-w-2xl flex-col items-center justify-center text-center">
        <BookOpenIcon className="h-10 w-10 text-dark-500" />
        <h1 className="mt-4 text-2xl font-bold text-dark-50">{t('instructions.notFound.title')}</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-dark-400">
          {t('instructions.notFound.description')}
        </p>
        <Button asChild className="mt-6">
          <Link to="/instructions" state={instructionState}>
            {t('instructions.backToAll')}
          </Link>
        </Button>
      </div>
    );
  }

  const navigation = getInstructionNavigation(article.slug);
  const relatedArticles =
    navigation?.relatedSlugs
      .map((relatedSlug) => instructionSummaries.find((item) => item.slug === relatedSlug))
      .filter((item) => item !== undefined) ?? [];

  return (
    <motion.div
      className="mx-auto w-full max-w-3xl"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={staggerItem}>
        <div className="mb-6">
          <Link
            to="/instructions"
            state={instructionState}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-dark-300 transition-colors hover:bg-dark-800/70 hover:text-dark-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
          >
            <BackIcon className="h-5 w-5 rtl:rotate-180" />
            {t('instructions.backToAll')}
          </Link>
        </div>

        <header className="space-y-2">
          <h1 className="text-2xl font-bold leading-tight text-dark-50 sm:text-3xl">
            {article.title}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-dark-300 sm:text-base">
            {article.intro}
          </p>
          {!isRussian && (
            <p className="text-sm text-dark-400" role="note">
              {t('instructions.russianContentNote')}
            </p>
          )}
        </header>

        <aside className="mt-6" aria-label={t('instructions.beforeStart')}>
          <Card size="md" className="flex gap-3 border-accent-500/25 bg-accent-500/10 shadow-none">
            <InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent-400" />
            <div>
              <p className="text-sm font-semibold text-accent-300">
                {t('instructions.beforeStart')}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-dark-300">{article.notice}</p>
            </div>
          </Card>
        </aside>
      </motion.div>

      {article.scenarios ? (
        <motion.div variants={staggerItem} className="mt-9 space-y-3">
          {article.scenarios.map((scenario) => {
            const isOpen = openScenario === scenario.id;
            const scenarioSteps = article.steps.filter((step) => step.group === scenario.id);
            const scenarioStartIndex = article.steps.findIndex(
              (step) => step.group === scenario.id,
            );
            const panelId = `instruction-scenario-${scenario.id}`;

            return (
              <section key={scenario.id} className="scroll-mt-4">
                <Card size="sm" className="p-0">
                  <button
                    type="button"
                    className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-dark-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-400 sm:px-5"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={(event) => {
                      const shouldOpen = openScenario !== scenario.id;
                      const scenarioSection = event.currentTarget.closest('section');
                      const nextSearchParams = new URLSearchParams(searchParams);

                      if (shouldOpen) {
                        nextSearchParams.set('scenario', scenario.id);
                      } else {
                        nextSearchParams.delete('scenario');
                      }
                      setSearchParams(nextSearchParams, { replace: true });

                      if (shouldOpen && window.matchMedia('(max-width: 1023px)').matches) {
                        requestAnimationFrame(() => {
                          scenarioSection?.scrollIntoView({
                            behavior: reducedMotion ? 'auto' : 'smooth',
                            block: 'start',
                          });
                        });
                      }
                    }}
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold text-dark-100">{scenario.title}</span>
                      <span className="mt-1 block text-sm text-dark-400">{scenario.summary}</span>
                      <span className="mt-2 block text-xs font-medium text-dark-500">
                        {t('instructions.stepsCount', { count: scenarioSteps.length })}
                      </span>
                    </span>
                    <ChevronDownIcon
                      className={`h-5 w-5 shrink-0 text-dark-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={panelId}
                        data-instruction-scenario={scenario.id}
                        initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={reducedMotion ? undefined : { height: 0, opacity: 0 }}
                        transition={{ duration: reducedMotion ? 0 : 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-dark-700 px-4 pb-6 pt-2 sm:px-5">
                          <InstructionSteps
                            articleSlug={article.slug}
                            steps={scenarioSteps}
                            startIndex={Math.max(0, scenarioStartIndex)}
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </section>
            );
          })}
        </motion.div>
      ) : (
        <motion.div variants={staggerItem} className="mt-9">
          <InstructionSteps articleSlug={article.slug} steps={article.steps} />
        </motion.div>
      )}

      <motion.footer
        variants={staggerItem}
        className="mt-10 space-y-8 border-t border-dark-700 pt-6"
      >
        {navigation && (
          <section aria-label={t('instructions.continueInCabinet')}>
            <h2 className="text-lg font-semibold text-dark-100">
              {t('instructions.continueInCabinet')}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-dark-400">
              {t('instructions.safeActionNote')}
            </p>
            <Button asChild className="mt-4">
              <Link to={resolveInstructionActionRoute(navigation.action)}>
                {t(`instructions.actions.${navigation.action}`)}
                <ChevronRightIcon className="h-5 w-5 rtl:rotate-180" />
              </Link>
            </Button>
          </section>
        )}

        {relatedArticles.length > 0 && (
          <section aria-label={t('instructions.related')}>
            <h2 className="text-lg font-semibold text-dark-100">{t('instructions.related')}</h2>
            <Card size="sm" className="mt-3 divide-y divide-dark-700/60">
              {relatedArticles.map((related) => (
                <Link
                  key={related.slug}
                  to={`/instructions/${related.slug}`}
                  state={instructionState}
                  className="group -mx-1 flex min-h-14 items-center gap-3 rounded-xl px-2 py-3 text-sm font-semibold text-dark-200 transition-colors hover:bg-dark-800/70 hover:text-accent-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-400"
                >
                  <span className="min-w-0 flex-1">{related.title}</span>
                  <ChevronRightIcon className="h-5 w-5 shrink-0 text-dark-500 transition-colors group-hover:text-accent-400 rtl:rotate-180" />
                </Link>
              ))}
            </Card>
          </section>
        )}

        <p className="text-sm leading-relaxed text-dark-400">{t('instructions.interfaceNote')}</p>
        <InstructionSupportReturn fromSupport={fromSupport} />
      </motion.footer>
    </motion.div>
  );
}
