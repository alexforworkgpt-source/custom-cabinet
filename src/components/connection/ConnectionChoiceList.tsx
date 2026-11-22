import type { ReactNode } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ConnectionChoiceList({
  open,
  className,
  children,
}: {
  open: boolean;
  className: string;
  children: ReactNode;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={reducedMotion ? undefined : { opacity: 0, height: 0 }}
          transition={
            reducedMotion ? { duration: 0 } : { duration: 0.24, ease: [0.22, 1, 0.36, 1] }
          }
          className={cn('grid overflow-hidden sm:grid-cols-2', className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
