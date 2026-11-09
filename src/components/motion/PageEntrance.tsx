import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { staggerContainer, staggerItem } from './transitions';

type EntranceProps = Omit<HTMLMotionProps<'div'>, 'initial' | 'animate' | 'exit' | 'variants'>;

/** Mount-only orchestration: query refreshes must not replay the page entrance. */
export function PageEntrance(props: EntranceProps) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      {...props}
      variants={staggerContainer}
      initial={reducedMotion ? false : 'initial'}
      animate="animate"
    />
  );
}

/** Keep loaded sections mounted while their data refreshes; skeletons stay separate. */
export const PageEntranceItem = forwardRef<HTMLDivElement, EntranceProps>((props, ref) => (
  <motion.div {...props} ref={ref} variants={staggerItem} />
));

PageEntranceItem.displayName = 'PageEntranceItem';
