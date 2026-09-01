import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router';
import {
  BackIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  InfoIcon,
} from '@/components/icons';
import { InstructionImage } from '@/components/instructions/InstructionImage';
import { staggerContainer, staggerItem } from '@/components/motion/transitions';
import { getInstructionArticle, type InstructionStep } from '@/content/instructionArticles';
import { getInstructionImageAlt, getInstructionImageData } from '@/content/instructionImages';
import {
  getInstructionNavigation,
  resolveInstructionActionRoute,
} from '@/content/instructionNavigation';
import { instructionSummaries } from '@/content/instructions';

function InstructionSteps({
  articleSlug,
  steps,
  startIndex = 0,
}: {
  articleSlug: string;
  steps: InstructionStep[];
  startIndex?: number;
}) {
  return (
    <ol className="space-y-9">
      {steps.map((step, index) => {
        const image = getInstructionImageData(articleSlug, startIndex + index);

        return (
          <li
            key={step.id}
            data-instruction-step={step.id}
            className="border-t border-dark-700 pt-6"
          >
            <h2 className="text-lg font-semibold text-dark-100 sm:text-xl">
              {index + 1}. {step.heading}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-dark-300 sm:text-base">{step.body}</p>
            {image ? (
              <InstructionImage
                src={image.src}
                alt={getInstructionImageAlt(step.heading)}
                caption={step.caption}
                width={image.width}
                height={image.height}
              />
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-dark-500">{step.caption}</p>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function InstructionArticlePage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const article = getInstructionArticle(slug);
  const [openScenario, setOpenScenario] = useState<string | null>(null);
  const reducedMotion = useReducedMotion();

  if (!article) {
    return (
      <main className="mx-auto flex min-h-72 w-full max-w-2xl flex-col items-center justify-center text-center">
        <BookOpenIcon className="h-10 w-10 text-dark-500" />
        <h1 className="mt-4 text-2xl font-bold text-dark-50">{t('instructions.notFound.title')}</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-dark-400">
          {t('instructions.notFound.description')}
        </p>
        <Link to="/instructions" className="btn-primary mt-6">
          {t('instructions.backToAll')}
        </Link>
      </main>
    );
  }

  const navigation = getInstructionNavigation(article.slug);
  const relatedArticles =
    navigation?.relatedSlugs
      .map((relatedSlug) => instructionSummaries.find((item) => item.slug === relatedSlug))
      .filter((item) => item !== undefined) ?? [];

  return (
    <motion.main
      className="mx-auto w-full max-w-3xl"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={staggerItem}>
        <Link
          to="/instructions"
          className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-medium text-dark-300 transition-colors hover:bg-dark-800/70 hover:text-dark-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
        >
          <BackIcon className="h-5 w-5 rtl:rotate-180" />
          {t('instructions.backToAll')}
        </Link>

        <header className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-accent-400">
            {t('instructions.eyebrow')}
          </p>
          <h1 className="text-2xl font-bold leading-tight text-dark-50 sm:text-4xl">
            {article.title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-dark-300">{article.intro}</p>
        </header>

        <aside
          className="mt-6 flex gap-3 rounded-2xl border border-accent-500/25 bg-accent-500/10 p-4"
          aria-label={t('instructions.beforeStart')}
        >
          <InfoIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent-400" />
          <div>
            <p className="text-sm font-semibold text-accent-300">{t('instructions.beforeStart')}</p>
            <p className="mt-1 text-sm leading-relaxed text-dark-300">{article.notice}</p>
          </div>
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
              <section
                key={scenario.id}
                className="scroll-mt-4 overflow-hidden rounded-2xl border border-dark-700 bg-dark-800/50"
              >
                <button
                  type="button"
                  className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-start transition-colors hover:bg-dark-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-400 sm:px-5"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={(event) => {
                    const shouldOpen = openScenario !== scenario.id;
                    const scenarioSection = event.currentTarget.closest('section');

                    setOpenScenario(shouldOpen ? scenario.id : null);

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
            <Link
              to={resolveInstructionActionRoute(navigation.action)}
              className="btn-primary mt-4 inline-flex min-h-11 items-center gap-2"
            >
              {t(`instructions.actions.${navigation.action}`)}
              <ChevronRightIcon className="h-5 w-5 rtl:rotate-180" />
            </Link>
          </section>
        )}

        {relatedArticles.length > 0 && (
          <section aria-label={t('instructions.related')}>
            <h2 className="text-lg font-semibold text-dark-100">{t('instructions.related')}</h2>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {relatedArticles.map((related) => (
                <Link
                  key={related.slug}
                  to={`/instructions/${related.slug}`}
                  className="group flex min-h-14 items-center gap-3 rounded-xl border border-dark-700 bg-dark-800/50 px-4 py-3 text-sm font-semibold text-dark-200 transition-colors hover:border-accent-500/40 hover:text-accent-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
                >
                  <span className="min-w-0 flex-1">{related.title}</span>
                  <ChevronRightIcon className="h-5 w-5 shrink-0 text-dark-500 group-hover:text-accent-400 rtl:rotate-180" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="text-sm leading-relaxed text-dark-400">{t('instructions.interfaceNote')}</p>
      </motion.footer>
    </motion.main>
  );
}
