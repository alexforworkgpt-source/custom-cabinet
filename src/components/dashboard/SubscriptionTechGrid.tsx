import { useId } from 'react';
import type { CSSProperties } from 'react';
import { useSubscriptionGridNodes } from './useSubscriptionGridNodes';

/** Stationary grid with staggered, genuinely growing nodes travelling from right to left. */
export function SubscriptionTechGrid({ className = 'text-champagne-50' }: { className?: string }) {
  const gridId = useId();
  const { ref, nodes } = useSubscriptionGridNodes();
  return (
    <svg
      ref={ref}
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-10 h-full w-full ${className}`}
    >
      <defs>
        <pattern id={gridId} width="32" height="32" patternUnits="userSpaceOnUse">
          <path
            d="M16.5 0V32M0 16.5H32"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.65"
            opacity="0.025"
          />
          <circle cx="16.5" cy="16.5" r="1.25" fill="currentColor" opacity="0.14" />
        </pattern>
        <linearGradient id={`${gridId}-strength`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="15%" stopColor="white" stopOpacity="0.01" />
          <stop offset="35%" stopColor="white" stopOpacity="0.06" />
          <stop offset="55%" stopColor="white" stopOpacity="0.22" />
          <stop offset="75%" stopColor="white" stopOpacity="0.55" />
          <stop offset="90%" stopColor="white" stopOpacity="0.82" />
          <stop offset="100%" stopColor="white" stopOpacity="1" />
        </linearGradient>
        <linearGradient id={`${gridId}-edges`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0.06" />
          <stop offset="15%" stopColor="white" stopOpacity="0.65" />
          <stop offset="35%" stopColor="white" stopOpacity="1" />
          <stop offset="65%" stopColor="white" stopOpacity="1" />
          <stop offset="85%" stopColor="white" stopOpacity="0.65" />
          <stop offset="100%" stopColor="white" stopOpacity="0.06" />
        </linearGradient>
        <mask id={`${gridId}-vertical-fade`}>
          <rect width="100%" height="100%" fill={`url(#${gridId}-edges)`} />
        </mask>
        <linearGradient id={`${gridId}-activity-strength`}>
          <stop offset="0%" stopColor="white" stopOpacity="0" />
          <stop offset="35%" stopColor="white" stopOpacity="0" />
          <stop offset="55%" stopColor="white" stopOpacity="0.22" />
          <stop offset="75%" stopColor="white" stopOpacity="0.55" />
          <stop offset="90%" stopColor="white" stopOpacity="0.82" />
          <stop offset="100%" stopColor="white" />
        </linearGradient>
        <mask id={`${gridId}-activity-fade`}>
          <rect
            width="100%"
            height="100%"
            fill={`url(#${gridId}-activity-strength)`}
            mask={`url(#${gridId}-vertical-fade)`}
          />
        </mask>
        <mask id={`${gridId}-fade`}>
          <rect
            width="100%"
            height="100%"
            fill={`url(#${gridId}-strength)`}
            mask={`url(#${gridId}-vertical-fade)`}
          />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${gridId})`} mask={`url(#${gridId}-fade)`} />
      <g mask={`url(#${gridId}-activity-fade)`} className="motion-reduce:hidden">
        {nodes.map((node) => (
          <circle
            key={`${node.x}-${node.y}`}
            cx={node.x}
            cy={node.y}
            r="1.25"
            fill="currentColor"
            className="animate-grid-node opacity-0 [animation-delay:var(--node-delay)] motion-reduce:animate-none"
            style={
              {
                '--node-delay': `${node.delay}s`,
                '--node-radius': `${node.radius}px`,
              } as CSSProperties
            }
          />
        ))}
      </g>
    </svg>
  );
}
