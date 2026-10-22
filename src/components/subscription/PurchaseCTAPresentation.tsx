import { cn } from '@/lib/utils';
import { ChevronRightIcon, TariffsIcon } from '@/components/icons';
import { HoverBorderGradient } from '../ui/hover-border-gradient';

interface Props {
  title: string;
  hint: string;
  expired?: boolean;
  reserveSpace?: boolean;
  compactOnMobile?: boolean;
  geometryTitles?: string[];
  geometryHints?: string[];
}

/** Read-only layout shared by the actual link and its non-interactive placeholder. */
export function PurchaseCTAPresentation({
  title,
  hint,
  expired = false,
  reserveSpace = false,
  compactOnMobile = false,
  geometryTitles = [],
  geometryHints = [],
}: Props) {
  const accentColor = expired ? 'rgb(var(--color-critical-500))' : 'rgb(var(--color-accent-400))';
  const geometryText = (values: string[], visible: string) =>
    compactOnMobile &&
    values
      .filter((value, index) => value !== visible && values.indexOf(value) === index)
      .map((value) => (
        <span
          key={value}
          aria-hidden="true"
          data-geometry-text={value}
          className="invisible [grid-area:1/1] before:content-[attr(data-geometry-text)] sm:hidden"
        />
      ));

  return (
    <HoverBorderGradient
      accentColor={accentColor}
      duration={4}
      className={cn(
        'group relative w-full cursor-pointer overflow-hidden rounded-2xl',
        reserveSpace && 'flex min-h-24 sm:min-h-20',
        compactOnMobile && 'flex min-h-[72px] sm:min-h-20',
      )}
    >
      <div
        className={cn(
          'relative flex w-full items-center justify-between rounded-[14px] px-5 py-4 transition-colors duration-300',
          compactOnMobile && 'gap-2 px-4 py-3 sm:gap-0 sm:px-5 sm:py-4',
        )}
        style={{
          background: expired
            ? 'linear-gradient(135deg, rgba(255,59,92,0.08), rgba(255,107,53,0.06))'
            : 'linear-gradient(135deg, rgba(var(--color-accent-400), 0.08), rgba(var(--color-accent-400), 0.06))',
        }}
      >
        <div
          className={cn(
            'flex items-center gap-3',
            compactOnMobile && 'min-w-0 flex-1 gap-2 sm:flex-initial sm:gap-3',
          )}
        >
          <div
            className={cn(
              'flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl',
              compactOnMobile && 'h-9 w-9 sm:h-10 sm:w-10',
            )}
            style={{
              background: expired ? 'rgba(255,59,92,0.12)' : 'rgba(var(--color-accent-400), 0.12)',
              color: accentColor,
            }}
          >
            <TariffsIcon className="h-[18px] w-[18px]" />
          </div>
          <div className={compactOnMobile ? 'min-w-0' : undefined}>
            <div
              className={cn('text-[15px] font-semibold text-dark-50', compactOnMobile && 'grid')}
            >
              <span className={compactOnMobile ? '[grid-area:1/1]' : undefined}>{title}</span>
              {geometryText(geometryTitles, title)}
            </div>
            <div className={cn('text-[12px] text-dark-400', compactOnMobile && 'grid')}>
              <span className={compactOnMobile ? '[grid-area:1/1]' : undefined}>{hint}</span>
              {geometryText(geometryHints, hint)}
            </div>
          </div>
        </div>
        <ChevronRightIcon className="h-5 w-5 flex-shrink-0 text-dark-500 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </HoverBorderGradient>
  );
}
