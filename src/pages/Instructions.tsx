import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router';
import { Card } from '@/components/data-display/Card';
import { InstructionSupportReturn } from '@/components/instructions/InstructionSupportReturn';
import {
  BookOpenIcon,
  ChevronRightIcon,
  CreditCardIcon,
  DevicesIcon,
  ShieldIcon,
} from '@/components/icons';
import { staggerContainer, staggerItem } from '@/components/motion/transitions';
import {
  instructionCategories,
  instructionSummaries,
  type InstructionCategory,
} from '@/content/instructions';

const categoryIcons = {
  connection: DevicesIcon,
  subscription: BookOpenIcon,
  balance: CreditCardIcon,
  account: ShieldIcon,
} satisfies Record<InstructionCategory, typeof BookOpenIcon>;

export default function Instructions() {
  const { t, i18n } = useTranslation();
  const fromSupport = useLocation().state?.instructionsOrigin === 'support';
  const isRussian = i18n.language.split('-')[0] === 'ru';

  return (
    <motion.div
      className="w-full space-y-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.header variants={staggerItem} className="max-w-2xl space-y-2">
        <InstructionSupportReturn fromSupport={fromSupport} />
        <h1 className="text-2xl font-bold text-dark-50 sm:text-3xl">{t('instructions.title')}</h1>
        <p className="text-sm leading-relaxed text-dark-400 sm:text-base">
          {t('instructions.subtitle')}
        </p>
        {!isRussian && (
          <p className="text-sm text-dark-400" role="note">
            {t('instructions.russianContentNote')}
          </p>
        )}
      </motion.header>

      <motion.div variants={staggerContainer} className="grid gap-4 lg:grid-cols-2">
        {instructionCategories.map((category) => {
          const Icon = categoryIcons[category];
          const articles = instructionSummaries.filter((item) => item.category === category);

          return (
            <motion.section
              key={category}
              variants={staggerItem}
              aria-labelledby={`instruction-category-${category}`}
            >
              <Card size="md" className="h-full">
                <div className="flex items-start gap-3">
                  <span
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-dark-800 text-accent-400"
                    aria-hidden="true"
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h2
                      id={`instruction-category-${category}`}
                      className="text-base font-semibold text-dark-100"
                    >
                      {t(`instructions.categories.${category}.title`)}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-dark-400">
                      {t(`instructions.categories.${category}.description`)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 divide-y divide-dark-700/60 border-t border-dark-700/60">
                  {articles.map((article) => (
                    <Link
                      key={article.slug}
                      to={`/instructions/${article.slug}`}
                      state={fromSupport ? { instructionsOrigin: 'support' } : undefined}
                      className="group -mx-1 flex min-h-16 items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-dark-800/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-400"
                    >
                      <div className="min-w-0 flex-1">
                        <h3 className="text-sm font-semibold leading-snug text-dark-100 transition-colors group-hover:text-accent-300">
                          {article.title}
                        </h3>
                        <p className="mt-1 text-sm leading-relaxed text-dark-400">
                          {article.summary}
                        </p>
                      </div>
                      <ChevronRightIcon className="h-5 w-5 shrink-0 text-dark-500 transition-colors group-hover:text-accent-400 rtl:rotate-180" />
                    </Link>
                  ))}
                </div>
              </Card>
            </motion.section>
          );
        })}
      </motion.div>
    </motion.div>
  );
}
