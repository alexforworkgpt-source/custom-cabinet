import type React from 'react';
import { Button } from '@/components/primitives/Button';
import { cn } from '@/lib/utils';

interface HoverBorderGradientProps extends React.HTMLAttributes<HTMLElement> {
  /** Rendered HTML element. Default: 'div' */
  as?: React.ElementType;
  /** Hex color for the rotating gradient beam (e.g. '#00E5A0') */
  accentColor?: string;
  /** Full rotation duration in seconds. Default: 3 */
  duration?: number;
  /** Disables the element (applies to interactive elements like buttons) */
  disabled?: boolean;
  /** Native button type when rendered with `as="button"`. */
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Animated conic-gradient border that rotates around the element.
 *
 * Uses pure CSS `@property --border-angle` animation — no JS loops,
 * GPU-friendly, works in Telegram Mini App WebView.
 *
 * Fallback: browsers without `@property` show a static gradient border.
 */
export function HoverBorderGradient({
  children,
  className,
  as: Tag = 'div',
  accentColor,
  duration,
  style,
  type,
  ...props
}: HoverBorderGradientProps) {
  const cssVars: Record<string, string> = {};

  if (accentColor) {
    cssVars['--accent-color'] = accentColor;
    // 30% opacity hex suffix for hover glow
    cssVars['--accent-glow'] = `${accentColor}4D`;
  }

  if (duration !== undefined) {
    cssVars['--border-duration'] = `${duration}s`;
  }

  const mergedStyle = { ...cssVars, ...style } as React.CSSProperties;
  const mergedClassName = cn('hover-border-gradient', className);

  if (Tag === 'button') {
    return (
      <Button
        type={type ?? 'button'}
        variant="ghost"
        size="lg"
        className={cn('h-auto', mergedClassName)}
        style={mergedStyle}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </Button>
    );
  }

  return (
    <Tag className={mergedClassName} style={mergedStyle} {...props}>
      {children}
    </Tag>
  );
}
