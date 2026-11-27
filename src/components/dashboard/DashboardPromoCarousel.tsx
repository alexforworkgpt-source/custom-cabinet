import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { staggerItem } from '@/components/motion/transitions';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlatform } from '@/platform';
import { ArrowRightIcon, PauseIcon, PlayIcon } from '@/components/icons';
import type { DashboardPromoSlide } from './dashboardPromoSlides';
import './DashboardPromoCarousel.css';

const AUTO_ADVANCE_MS = 6000;
const SWIPE_THRESHOLD_PX = 40;

interface DashboardPromoCarouselProps {
  slides: DashboardPromoSlide[];
  loading?: boolean;
}

export default function DashboardPromoCarousel({
  slides,
  loading = false,
}: DashboardPromoCarouselProps) {
  const { t } = useTranslation();
  const { openTelegramLink } = usePlatform();
  const [activeIndex, setActiveIndex] = useState(0);
  const [manualPaused, setManualPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [pageVisible, setPageVisible] = useState(() => !document.hidden);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const update = () => setPageVisible(!document.hidden);
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(0, slides.length - 1)));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2 || manualPaused || interactionPaused || reducedMotion || !pageVisible) {
      return;
    }
    const timer = window.setTimeout(() => {
      setActiveIndex((activeIndex + 1) % slides.length);
    }, AUTO_ADVANCE_MS);
    return () => window.clearTimeout(timer);
  }, [activeIndex, interactionPaused, manualPaused, pageVisible, reducedMotion, slides.length]);

  if (slides.length === 0) {
    if (!loading) return null;
    return (
      <section role="status" aria-label={t('common.loading')}>
        <div
          className="relative min-h-[148px] overflow-hidden rounded-2xl border border-dark-700/60 bg-dark-900 p-5 shadow-card sm:min-h-[160px] sm:p-6"
          aria-hidden="true"
        >
          <Skeleton className="mb-3 h-3 w-20 rounded" />
          <Skeleton className="mb-2 h-6 w-1/2 rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="absolute right-5 top-1/2 h-16 w-16 -translate-y-1/2 rounded-2xl sm:right-8 sm:h-20 sm:w-20" />
        </div>
      </section>
    );
  }

  const activeSlide = slides[activeIndex] ?? slides[0];
  const showPrevious = () =>
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  const showNext = () => setActiveIndex((current) => (current + 1) % slides.length);

  return (
    <motion.section
      variants={staggerItem}
      className="relative"
      aria-label={t('dashboardPromo.ariaLabel')}
      data-dashboard-promo-carousel
      onMouseEnter={() => setInteractionPaused(true)}
      onMouseLeave={() => setInteractionPaused(false)}
      onFocusCapture={() => setInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setInteractionPaused(false);
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const start = touchStartX.current;
        const end = event.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (start === null || end === undefined) return;
        if (end - start > SWIPE_THRESHOLD_PX) showPrevious();
        if (start - end > SWIPE_THRESHOLD_PX) showNext();
      }}
    >
      <div className="relative min-h-[148px] overflow-hidden rounded-2xl border border-dark-700/60 bg-dark-900 shadow-card sm:min-h-[160px]">
        <Link
          key={activeSlide.id}
          to={activeSlide.href}
          target={activeSlide.external ? '_blank' : undefined}
          rel={activeSlide.external ? 'noopener noreferrer' : undefined}
          onClick={(event) => {
            if (!activeSlide.external) return;
            event.preventDefault();
            openTelegramLink(activeSlide.href);
          }}
          className="dashboard-promo-slide group absolute inset-0 flex overflow-hidden px-5 pb-10 pt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-400 motion-safe:animate-fade-in sm:px-6 sm:pb-11 sm:pt-5"
          aria-label={t(`dashboardPromo.slides.${activeSlide.id}.linkLabel`)}
          data-dashboard-promo-slide={activeSlide.id}
        >
          <div className="relative z-10 max-w-[64%]">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--promo-primary)]">
              {t(`dashboardPromo.slides.${activeSlide.id}.eyebrow`)}
            </p>
            <h2 className="font-display text-base font-semibold leading-tight text-[var(--promo-title)] sm:text-xl">
              {t(`dashboardPromo.slides.${activeSlide.id}.title`)}
            </h2>
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[var(--promo-secondary)] sm:text-sm">
              {t(`dashboardPromo.slides.${activeSlide.id}.description`)}
            </p>
            <span className="mt-2 hidden items-center gap-1 text-xs font-semibold text-[var(--promo-primary)] sm:inline-flex">
              {t(`dashboardPromo.slides.${activeSlide.id}.action`)}
              <ArrowRightIcon className="h-3.5 w-3.5 motion-safe:transition-transform motion-safe:group-hover:translate-x-0.5 rtl:rotate-180" />
            </span>
          </div>

          <div
            className="pointer-events-none absolute inset-y-0 end-0 grid w-[42%] place-items-center overflow-hidden pe-1 pb-1.5"
            aria-hidden="true"
          >
            <span className="dashboard-promo-artwork" data-dashboard-promo-art />
          </div>
        </Link>

        {slides.length > 1 && (
          <div className="absolute inset-x-3 bottom-0 z-20 flex h-11 items-center justify-between">
            <div className="flex items-center" aria-label={t('dashboardPromo.slideControls')}>
              {slides.map((slide, index) => (
                <button
                  key={slide.id}
                  type="button"
                  className="flex h-11 w-11 items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
                  onClick={() => setActiveIndex(index)}
                  aria-label={t('dashboardPromo.showSlide', {
                    current: index + 1,
                    total: slides.length,
                  })}
                  aria-current={index === activeIndex ? 'true' : undefined}
                >
                  <span
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === activeIndex ? 'w-5 bg-accent-400' : 'w-1.5 bg-dark-500'
                    }`}
                  />
                </button>
              ))}
            </div>
            {!reducedMotion && (
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-xl text-dark-400 transition-colors hover:text-dark-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
                onClick={() => setManualPaused((current) => !current)}
                aria-label={t(manualPaused ? 'dashboardPromo.resume' : 'dashboardPromo.pause')}
              >
                {manualPaused ? (
                  <PlayIcon className="h-4 w-4" />
                ) : (
                  <PauseIcon className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </motion.section>
  );
}
