import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
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
  const isRussian = i18n.language.split('-')[0] === 'ru';

  return (
    <motion.main
      className="mx-auto w-full max-w-5xl space-y-9"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.header variants={staggerItem} className="max-w-2xl space-y-2">
        <div className="flex items-center gap-3 text-accent-400">
          <BookOpenIcon className="h-6 w-6" />
          <span className="text-sm font-semibold uppercase tracking-[0.14em]">
            {t('instructions.eyebrow')}
          </span>
        </div>
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

      <div className="space-y-10">
        {instructionCategories.map((category) => {
          const Icon = categoryIcons[category];
          const articles = instructionSummaries.filter((item) => item.category === category);

          return (
            <motion.section
              key={category}
              variants={staggerItem}
              aria-labelledby={`instruction-category-${category}`}
              className="grid gap-4 border-t border-dark-700 pt-6 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-8"
            >
              <div>
                <Icon className="mb-3 h-6 w-6 text-accent-400" />
                <h2
                  id={`instruction-category-${category}`}
                  className="text-lg font-semibold text-dark-100"
                >
                  {t(`instructions.categories.${category}.title`)}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-dark-400">
                  {t(`instructions.categories.${category}.description`)}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {articles.map((article) => (
                  <Link
                    key={article.slug}
                    to={`/instructions/${article.slug}`}
                    className="group flex min-h-24 items-start gap-3 rounded-2xl border border-dark-700/70 bg-dark-800/50 p-4 transition-colors hover:border-accent-500/40 hover:bg-dark-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
                  >
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold leading-snug text-dark-100 group-hover:text-accent-300">
                        {article.title}
                      </h3>
                      <p className="mt-1 text-sm leading-relaxed text-dark-400">
                        {article.summary}
                      </p>
                    </div>
                    <ChevronRightIcon className="mt-1 h-5 w-5 shrink-0 text-dark-500 transition-colors group-hover:text-accent-400 rtl:rotate-180" />
                  </Link>
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>
    </motion.main>
  );
}
