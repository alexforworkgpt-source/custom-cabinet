import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { Subscription } from '../../types';
import { subscriptionActionStyles as actionStyles } from './sheets/subscriptionActionStyles';
import { Skeleton, SkeletonSurface } from '../ui/skeleton';
import { SubscriptionPurchaseSkeleton } from './SubscriptionPurchaseSkeleton';
import { SubscriptionOverviewCard } from './SubscriptionOverviewCard';

import { PageEntrance } from '../motion/PageEntrance';
import { fadeIn } from '../motion/transitions';
import { cn } from '@/lib/utils';

type ManagementStage = 'pending' | 'known' | 'ready';

function ManagementLoadingHeight({
  stage,
  smooth,
  overview,
  children,
}: {
  stage: ManagementStage;
  smooth: boolean;
  overview?: boolean;
  children: ReactNode;
}) {
  const skeleton = overview && stage !== 'ready';
  const shell = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const painted = useRef<{ stage: ManagementStage; height: number } | null>(null);

  useLayoutEffect(() => {
    const frame = shell.current;
    const inner = content.current;
    if (!frame || !inner) return;

    const previous = painted.current;
    const height = inner.getBoundingClientRect().height;
    painted.current = { stage, height };
    const resize = new ResizeObserver(() => {
      painted.current = { stage, height: inner.getBoundingClientRect().height };
    });
    resize.observe(inner);

    if (
      !previous ||
      !smooth ||
      previous.stage === 'ready' ||
      previous.stage === stage ||
      Math.abs(previous.height - height) < 1
    ) {
      return () => resize.disconnect();
    }

    frame.style.height = `${previous.height}px`;
    frame.style.overflow = 'clip';
    const clear = () => {
      frame.style.removeProperty('height');
      frame.style.removeProperty('overflow');
    };
    let elapsed = 0;
    let lastFrame = performance.now();
    let animating = true;
    const draw = (now: number) => {
      // A stalled frame should pause the resize instead of skipping to its end.
      elapsed += Math.max(0, Math.min(now - lastFrame, 1000 / 60));
      lastFrame = now;
      const progress = Math.min(elapsed / 260, 1);
      if (progress === 1) {
        animating = false;
        clear();
        return;
      }
      const eased = progress * progress * (3 - 2 * progress);
      frame.style.height = `${previous.height + (height - previous.height) * eased}px`;
      animation = requestAnimationFrame(draw);
    };
    let animation = requestAnimationFrame(draw);

    return () => {
      resize.disconnect();
      cancelAnimationFrame(animation);
      if (animating) {
        painted.current = { stage, height: frame.getBoundingClientRect().height };
      }
      clear();
    };
  }, [stage, smooth]);

  return (
    <div
      ref={shell}
      className="relative has-[>div:empty]:hidden"
      data-subscription-overview-skeleton={skeleton ? stage : undefined}
    >
      <div
        ref={content}
        className={cn('flow-root', skeleton && 'invisible')}
        aria-hidden={skeleton || undefined}
      >
        {stage === 'ready' && children ? (
          <motion.div className="space-y-4" variants={fadeIn}>
            {children}
          </motion.div>
        ) : (
          children
        )}
      </div>
      {skeleton && (
        <Skeleton variant="card" animate={false} className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}

export function SubscriptionManagementLayout({
  loading,
  overview,
  purchase,
  smoothLoading,
  children,
}: {
  loading?: { subscription: Subscription | null };
  overview?: ReactNode;
  purchase: ReactNode;
  smoothLoading: boolean;
  children?: ReactNode;
}) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  const [startedCold] = useState(() => Boolean(loading && !loading.subscription));
  const keepInitial = startedCold && reducedMotion && smoothLoading;
  const known = loading && !keepInitial ? loading.subscription : null;
  const stage = !loading ? 'ready' : known ? 'known' : 'pending';
  const smooth = smoothLoading && !reducedMotion;

  return (
    <PageEntrance
      className={loading ? 'space-y-4 motion-safe:animate-pulse' : 'space-y-4'}
      data-subscription-management-loading={loading ? true : undefined}
      role={loading ? 'status' : undefined}
      aria-busy={loading ? true : undefined}
      aria-label={loading ? t('common.loading') : undefined}
    >
      <div className="space-y-4">
        <ManagementLoadingHeight stage={stage} smooth={smooth} overview>
          {loading ? (
            known ? (
              <SubscriptionOverviewCard subscription={known} measuring />
            ) : (
              <div className="h-[300px] sm:h-[320px]" />
            )
          ) : (
            overview
          )}
        </ManagementLoadingHeight>
        <ManagementLoadingHeight stage={stage} smooth={smooth}>
          {loading && !known ? <SubscriptionPurchaseSkeleton announce={false} /> : purchase}
        </ManagementLoadingHeight>
      </div>
      {loading && (
        <div data-subscription-devices-placeholder>
          <Skeleton variant="card" animate={false} className="h-16 sm:h-20" />
        </div>
      )}
      {(!loading || !keepInitial) && children}
    </PageEntrance>
  );
}

export function SubscriptionAddonsSkeleton({
  subscription,
  showDevices,
  showTraffic,
  isDark,
}: {
  subscription: Subscription;
  showDevices: boolean;
  showTraffic: boolean;
  isDark: boolean;
}) {
  const { t } = useTranslation();
  const actions = [
    ...(showDevices
      ? [
          {
            title: t('subscription.additionalOptions.buyDevices'),
            description: t('subscription.additionalOptions.currentDeviceLimit', {
              count: subscription.device_limit,
            }),
          },
          {
            title: t('subscription.additionalOptions.reduceDevices'),
            description: t('subscription.additionalOptions.reduceDevicesDescription'),
          },
        ]
      : []),
    ...(showTraffic
      ? [
          {
            title: t('subscription.additionalOptions.buyTraffic'),
            description: t('subscription.additionalOptions.currentTrafficLimit', {
              limit: subscription.traffic_limit_gb,
              used: subscription.traffic_used_gb.toFixed(1),
            }),
          },
        ]
      : []),
  ];
  return (
    <div
      className="rounded-3xl border border-dark-700/60 p-3"
      data-subscription-additional-options-skeleton
    >
      <div className="invisible text-sm font-semibold tracking-tight" aria-hidden="true">
        {t('subscription.additionalOptions.title')}
      </div>
      <div className="mt-2 space-y-2 sm:mt-3 sm:space-y-3">
        {actions.map(({ title, description }) => (
          <div key={title} data-subscription-addon-placeholder>
            <SkeletonSurface>
              <div className={actionStyles.trigger(isDark, true)}>
                <div className={actionStyles.row(true)}>
                  <div className={actionStyles.text(true)}>
                    <div className={actionStyles.title(true)}>{title}</div>
                    <div className={actionStyles.description(true)}>{description}</div>
                  </div>
                  <span className="h-5 w-5 shrink-0" />
                </div>
              </div>
            </SkeletonSurface>
          </div>
        ))}
        <div data-subscription-addon-placeholder>
          <SkeletonSurface>
            <div className="flex items-center justify-between gap-3 rounded-xl border p-3">
              <div>
                <div className="text-sm font-medium">{t('subscription.revoke.button')}</div>
                <div className="mt-0.5 text-xs">{t('subscription.revoke.description')}</div>
              </div>
              <span className="h-5 w-5 shrink-0" />
            </div>
          </SkeletonSurface>
        </div>
      </div>
    </div>
  );
}
