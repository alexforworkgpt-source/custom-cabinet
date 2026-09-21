import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExpandIcon } from '@/components/icons';
import { Button } from '@/components/primitives/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/primitives/Dialog';

interface InstructionImageProps {
  src: string;
  alt: string;
  title: string;
  caption: string;
  width: number;
  height: number;
}

export function InstructionImage({
  src,
  alt,
  title,
  caption,
  width,
  height,
}: InstructionImageProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  return (
    <figure className="mt-4 md:mx-auto md:max-w-lg">
      <div className="relative overflow-hidden rounded-2xl border border-dark-700 bg-white p-1 sm:p-2">
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className="mx-auto block h-auto w-full"
        />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label={t('instructions.expandScreenshot')}
          className="absolute right-3 top-3 bg-dark-950/85 shadow-lg backdrop-blur-sm"
        >
          <ExpandIcon className="h-5 w-5" />
        </Button>
      </div>
      <figcaption className="mt-2 text-sm leading-relaxed text-dark-400">{caption}</figcaption>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-4xl gap-3 p-3 sm:p-4">
          <DialogHeader className="pr-12 text-left">
            <DialogTitle>{t('instructions.screenshotTitle', { title })}</DialogTitle>
            <DialogDescription>{caption}</DialogDescription>
          </DialogHeader>
          <div className="overflow-auto rounded-xl border border-dark-700 bg-white p-1 sm:p-2">
            <img
              src={src}
              alt={alt}
              width={width}
              height={height}
              decoding="async"
              className="mx-auto block h-auto w-full max-w-[780px]"
            />
          </div>
        </DialogContent>
      </Dialog>
    </figure>
  );
}
