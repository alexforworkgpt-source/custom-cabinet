import { cn } from '@/lib/utils';

/** Shared presentation only; each existing form retains its own actions and queries. */
export const subscriptionActionStyles = {
  trigger: (isDark: boolean, compactOnMobile: boolean) =>
    cn(
      'w-full rounded-xl border p-4 text-left transition-colors',
      isDark
        ? 'border-dark-700/50 bg-dark-800/50 hover:border-dark-600'
        : 'border-champagne-300/60 bg-champagne-200/40 hover:border-champagne-400',
      compactOnMobile && 'min-h-16 p-3 sm:min-h-0 sm:p-4',
    ),
  row: (compactOnMobile: boolean) =>
    cn('flex items-center justify-between', compactOnMobile && 'gap-2 sm:gap-0'),
  text: (compactOnMobile: boolean) =>
    compactOnMobile ? 'min-w-0 flex-1 sm:flex-initial' : undefined,
  title: (compactOnMobile: boolean) =>
    cn('font-medium text-dark-100', compactOnMobile && 'text-sm sm:text-base'),
  description: (compactOnMobile: boolean) =>
    cn('mt-1 text-sm text-dark-400', compactOnMobile && 'mt-0.5 text-xs sm:mt-1 sm:text-sm'),
  chevron: (compactOnMobile: boolean) =>
    cn('text-dark-400', compactOnMobile && 'shrink-0 sm:shrink'),
  panel: (isDark: boolean) =>
    cn(
      'rounded-xl border p-4 sm:p-5',
      isDark ? 'border-dark-700/50 bg-dark-800/50' : 'border-champagne-300/60 bg-champagne-200/40',
    ),
  header: 'mb-3 flex items-center justify-between sm:mb-4',
  close:
    'flex h-11 w-11 shrink-0 items-center justify-center text-sm text-dark-400 hover:text-dark-200 sm:h-auto sm:w-auto',
  fields: 'space-y-3 sm:space-y-4',
  counter: 'flex items-center justify-center gap-4 sm:gap-6',
};
