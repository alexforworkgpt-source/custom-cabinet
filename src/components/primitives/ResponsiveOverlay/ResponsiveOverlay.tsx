import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../Dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../Sheet';

interface ResponsiveOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  restoreFocusTo?: HTMLElement | null;
  centerHeader?: boolean;
  showCloseButton?: boolean;
  fullscreen?: boolean;
}

function useDesktopOverlay() {
  const [desktop, setDesktop] = useState(() =>
    typeof window === 'undefined' ? true : window.matchMedia('(min-width: 768px)').matches,
  );

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const update = () => setDesktop(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  return desktop;
}

export function ResponsiveOverlay({
  open,
  onOpenChange,
  title,
  description,
  children,
  restoreFocusTo,
  centerHeader = false,
  showCloseButton = true,
  fullscreen = false,
}: ResponsiveOverlayProps) {
  const desktop = useDesktopOverlay();
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(open);

  useEffect(() => {
    if (open && restoreFocusTo) restoreFocusRef.current = restoreFocusTo;

    if (wasOpenRef.current && !open) {
      const target = restoreFocusRef.current;
      if (target?.isConnected) requestAnimationFrame(() => target.focus());
      restoreFocusRef.current = null;
    }
    wasOpenRef.current = open;
  }, [open, restoreFocusTo]);

  if (desktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          showCloseButton={showCloseButton}
          className={cn(
            'max-h-[90vh] max-w-4xl p-5 sm:p-6',
            fullscreen &&
              'flex h-dvh max-h-dvh max-w-none flex-col overflow-hidden rounded-none border-0 pt-[max(0.75rem,env(safe-area-inset-top))] pr-[max(0.75rem,env(safe-area-inset-right))] pb-[max(0.75rem,env(safe-area-inset-bottom))] pl-[max(0.75rem,env(safe-area-inset-left))]',
          )}
        >
          <DialogHeader className={centerHeader ? 'px-10 text-center sm:text-center' : 'pr-10'}>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className={cn('min-w-0', fullscreen && 'min-h-0 flex-1')}>{children}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={cn(
          'max-h-[calc(100dvh-env(safe-area-inset-top,0px))] rounded-t-2xl',
          fullscreen &&
            'h-[calc(100dvh-env(safe-area-inset-top,0px))] max-h-[calc(100dvh-env(safe-area-inset-top,0px))] rounded-none border-0 pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)]',
        )}
        showDragHandle={!fullscreen}
        showCloseButton={showCloseButton}
        enableDragToClose={false}
      >
        <SheetHeader className={centerHeader ? 'px-10 text-center sm:text-center' : 'pr-10'}>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className={cn('min-w-0 pt-4', fullscreen && 'min-h-0 flex-1')}>{children}</div>
      </SheetContent>
    </Sheet>
  );
}
