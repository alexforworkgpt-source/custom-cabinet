import { animate, useReducedMotion } from 'framer-motion';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { Subscription, SubscriptionListItem } from '@/types';
import SubscriptionCardSkeleton from './SubscriptionCardSkeleton';

export function DashboardSubscriptionLoading({
  pending,
  subscription,
  welcome,
  children,
}: {
  pending: boolean;
  subscription: Subscription | SubscriptionListItem | undefined;
  welcome: boolean;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const knownLayout = !!subscription || welcome;
  const [startedWithoutStatus] = useState(() => pending && !knownLayout);
  const [settled, setSettled] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const genericRef = useRef<HTMLDivElement>(null);
  const scenarioRef = useRef<HTMLDivElement>(null);

  const transitioning = startedWithoutStatus && knownLayout && !reduceMotion && !settled;
  const showScenario = knownLayout && !(startedWithoutStatus && reduceMotion);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const generic = genericRef.current;
    const scenario = scenarioRef.current;
    if (!transitioning || !wrapper || !generic || !scenario) return;

    const start = generic.getBoundingClientRect().height;
    const end = scenario.getBoundingClientRect().height;
    const transition = { duration: 0.26, ease: 'easeInOut' as const };
    wrapper.style.height = `${start}px`;
    const resize = animate(wrapper, { height: [start, end] }, transition);
    const fadeOut = animate(generic, { opacity: [1, 0] }, transition);
    const fadeIn = animate(scenario, { opacity: [0, 1] }, transition);
    let current = true;
    void Promise.all([resize, fadeOut, fadeIn]).then(() => {
      if (current) setSettled(true);
    });

    return () => {
      current = false;
      resize.stop();
      fadeOut.stop();
      fadeIn.stop();
      wrapper.style.removeProperty('height');
      generic.style.removeProperty('opacity');
      scenario.style.removeProperty('opacity');
    };
  }, [transitioning]);

  useLayoutEffect(() => {
    if (startedWithoutStatus && !pending && !transitioning && !settled) setSettled(true);
  }, [pending, settled, startedWithoutStatus, transitioning]);

  // Complete an in-progress change before showing the loaded card at its final height.
  if (!pending && !transitioning) return children;

  return (
    <div
      ref={wrapperRef}
      data-dashboard-subscription-loading
      className={transitioning ? 'relative overflow-hidden' : undefined}
    >
      {(!showScenario || transitioning) && (
        <div
          ref={genericRef}
          aria-hidden={transitioning || undefined}
          className={transitioning ? 'absolute inset-x-0 top-0' : undefined}
        >
          <SubscriptionCardSkeleton />
        </div>
      )}
      {showScenario && (
        <div ref={scenarioRef} className={transitioning ? 'opacity-0' : undefined}>
          <SubscriptionCardSkeleton subscription={subscription} welcome={welcome} />
        </div>
      )}
    </div>
  );
}
