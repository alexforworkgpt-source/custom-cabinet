import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { fadeIn } from '../motion/transitions';
import { Skeleton } from '../ui/skeleton';

export type SubscriptionLoadingStage = 'pending' | 'known' | 'ready';

export function SubscriptionLoadingHeight({
  stage,
  smooth,
  overview,
  children,
}: {
  stage: SubscriptionLoadingStage;
  smooth: boolean;
  overview?: boolean;
  children: ReactNode;
}) {
  const skeleton = overview && stage !== 'ready';
  const coverOverview = overview && stage === 'known';
  const shell = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const painted = useRef<{ stage: SubscriptionLoadingStage; height: number } | null>(null);

  useLayoutEffect(() => {
    const frame = shell.current;
    const inner = content.current;
    if (!frame || !inner) return;

    const previous = painted.current;
    const height = inner.getBoundingClientRect().height;
    painted.current = { stage, height };
    const resize =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(() => {
            painted.current = { stage, height: inner.getBoundingClientRect().height };
          });
    resize?.observe(inner);

    if (
      !previous ||
      !smooth ||
      previous.stage === 'ready' ||
      previous.stage === stage ||
      Math.abs(previous.height - height) < 1
    ) {
      return () => resize?.disconnect();
    }

    frame.style.height = `${previous.height}px`;
    frame.style.overflow = 'clip';
    const clear = () => {
      frame.style.removeProperty('height');
      frame.style.removeProperty('overflow');
    };
    // Give larger changes more time without keeping the content clipped for too long.
    const duration = Math.min(520, Math.max(260, Math.abs(height - previous.height) / 1.25));
    let elapsed = 0;
    let lastFrame = performance.now();
    let animating = true;
    const draw = (now: number) => {
      // A stalled frame should pause the resize instead of skipping to its end.
      elapsed += Math.max(0, Math.min(now - lastFrame, 1000 / 60));
      lastFrame = now;
      const progress = Math.min(elapsed / duration, 1);
      if (progress === 1) {
        animating = false;
        clear();
        return;
      }
      const eased = progress * progress * (3 - 2 * progress);
      const target = painted.current?.height ?? height;
      frame.style.height = `${previous.height + (target - previous.height) * eased}px`;
      animation = requestAnimationFrame(draw);
    };
    let animation = requestAnimationFrame(draw);

    return () => {
      resize?.disconnect();
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
        className={cn('flow-root', coverOverview && 'invisible')}
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
      {coverOverview && (
        <Skeleton variant="card" animate={false} className="absolute inset-0 h-full w-full" />
      )}
    </div>
  );
}
