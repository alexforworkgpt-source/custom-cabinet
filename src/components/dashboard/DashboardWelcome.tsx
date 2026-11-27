import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { fadeIn } from '@/components/motion/transitions';
import { Skeleton, SkeletonGroup } from '@/components/ui/skeleton';
import { SubscriptionScenarioHero } from '../subscription/SubscriptionHero';
import DashboardTrialOffer, { type DashboardTrialOfferProps } from './DashboardTrialOffer';
import { SubscriptionHeroLink } from './SubscriptionActiveActions';

export default function DashboardWelcome({
  trialInfo,
  trialLoading,
  trialOfferCached,
  ...trial
}: Omit<DashboardTrialOfferProps, 'trialInfo'> & {
  trialInfo?: DashboardTrialOfferProps['trialInfo'];
  trialLoading: boolean;
  trialOfferCached: boolean;
}) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const offer = trialInfo?.is_available ? trialInfo : undefined;
  const [expandOnMount] = useState(() => !!offer && !trialOfferCached);
  const content = offer ? (
    <DashboardTrialOffer {...trial} trialInfo={offer} />
  ) : trialLoading ? (
    <SkeletonGroup>
      <Skeleton className="h-11 rounded-[14px]" />
    </SkeletonGroup>
  ) : (
    <SubscriptionHeroLink to="/subscription/purchase">
      {t('subscriptions.chooseTariff')}
    </SubscriptionHeroLink>
  );

  return (
    <motion.div variants={fadeIn}>
      <SubscriptionScenarioHero
        scenario={offer ? 'welcome-trial' : 'welcome'}
        title={t('dashboard.welcomeNoName')}
        action={
          <div className="min-h-11">
            <AnimatePresence initial={expandOnMount && !reduceMotion}>
              <motion.div
                key={offer ? 'trial-offer' : 'trial-availability'}
                initial={
                  reduceMotion
                    ? false
                    : { height: expandOnMount ? 44 : 0, opacity: 0, overflow: 'hidden' }
                }
                animate={{ height: 'auto', opacity: 1, transitionEnd: { overflow: 'visible' } }}
                exit={{ height: 0, opacity: 0, overflow: 'hidden' }}
                transition={{ duration: reduceMotion ? 0 : 0.22, ease: 'easeInOut' }}
              >
                {content}
              </motion.div>
            </AnimatePresence>
          </div>
        }
      />
    </motion.div>
  );
}
