import { forwardRef, type ComponentType, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { ChevronRightIcon } from '@/components/icons';
import { cn } from '@/lib/utils';

interface HubLinkProps extends Pick<LinkProps, 'to' | 'state' | 'onClick' | 'replace'> {
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  highlighted?: boolean;
  emoji?: string;
}

export const HubLink = forwardRef<HTMLAnchorElement, HubLinkProps>(
  ({ to, state, onClick, replace, icon: Icon, children, highlighted = false, emoji }, ref) => (
    <Link
      ref={ref}
      to={to}
      state={state}
      replace={replace}
      onClick={onClick}
      className={cn(
        'group flex min-h-12 items-center gap-3 rounded-xl px-2 py-2 text-sm font-medium text-dark-200 transition-colors hover:bg-dark-800/70 hover:text-dark-100',
        highlighted &&
          'gap-1.5 rounded-full px-3 py-1.5 text-[13px] text-warning-500/70 duration-200 hover:bg-warning-500/10 hover:text-warning-300',
      )}
    >
      {emoji ? (
        <span
          aria-hidden="true"
          className="flex h-5 w-5 shrink-0 items-center justify-center text-base"
        >
          {emoji}
        </span>
      ) : (
        <Icon
          className={cn(
            'h-5 w-5 shrink-0 text-dark-400 transition-colors group-hover:text-accent-400',
            highlighted && 'h-4 w-4 text-warning-500/70 group-hover:text-warning-300',
          )}
        />
      )}
      <span className="min-w-0 flex-1 break-words">{children}</span>
      {!highlighted && (
        <ChevronRightIcon className="h-4 w-4 shrink-0 text-dark-500 transition-colors group-hover:text-dark-300 rtl:rotate-180" />
      )}
    </Link>
  ),
);

HubLink.displayName = 'HubLink';
