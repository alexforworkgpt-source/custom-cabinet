import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../Dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '../Sheet';

interface ResponsiveOverlayProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  children: ReactNode;
  restoreFocusTo?: HTMLElement | null;
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
        <DialogContent className="max-h-[90vh] max-w-4xl p-5 sm:p-6">
          <DialogHeader className="pr-10">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          <div className="min-w-0">{children}</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="max-h-[calc(100dvh-env(safe-area-inset-top,0px))] rounded-t-2xl"
        showCloseButton
        enableDragToClose={false}
      >
        <SheetHeader className="pr-10">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="min-w-0 pt-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
