import { useEffect, useRef, useState, type ComponentType } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
  ArrowRightIcon,
  DevicesIcon,
  GiftIcon,
  MailIcon,
  PauseIcon,
  PlayIcon,
  ShieldIcon,
  SubscriptionIcon,
  TelegramIcon,
  UsersIcon,
  WalletIcon,
} from '@/components/icons';
import type { DashboardPromoSlide, DashboardPromoSlideId } from './dashboardPromoSlides';

const AUTO_ADVANCE_MS = 6000;
const SWIPE_THRESHOLD_PX = 40;

interface IconProps {
  className?: string;
}

interface SlidePresentation {
  Icon: ComponentType<IconProps>;
  DetailIcon: ComponentType<IconProps>;
  gradient: string;
  glow: string;
  iconSurface: string;
  accentText: string;
}

const PRESENTATION: Record<DashboardPromoSlideId, SlidePresentation> = {
  telegram: {
    Icon: TelegramIcon,
    DetailIcon: ShieldIcon,
    gradient: 'from-accent-500/20 via-dark-900/95 to-dark-900',
    glow: 'bg-accent-500/30',
    iconSurface: 'border-accent-300/30 bg-accent-500/20 text-accent-300',
    accentText: 'text-accent-300',
  },
  email: {
    Icon: MailIcon,
    DetailIcon: ShieldIcon,
    gradient: 'from-success-500/20 via-dark-900/95 to-dark-900',
    glow: 'bg-success-500/25',
    iconSurface: 'border-success-300/30 bg-success-500/20 text-success-300',
    accentText: 'text-success-300',
  },
  connection: {
    Icon: DevicesIcon,
    DetailIcon: SubscriptionIcon,
    gradient: 'from-accent-600/20 via-dark-900/95 to-dark-900',
    glow: 'bg-accent-400/25',
    iconSurface: 'border-accent-300/30 bg-accent-500/20 text-accent-300',
    accentText: 'text-accent-300',
  },
  tariff: {
    Icon: SubscriptionIcon,
    DetailIcon: ShieldIcon,
    gradient: 'from-warning-500/20 via-dark-900/95 to-dark-900',
    glow: 'bg-warning-500/25',
    iconSurface: 'border-warning-300/30 bg-warning-500/20 text-warning-300',
    accentText: 'text-warning-300',
  },
  gift: {
    Icon: GiftIcon,
    DetailIcon: SubscriptionIcon,
    gradient: 'from-warning-500/20 via-dark-900/95 to-dark-900',
    glow: 'bg-warning-400/25',
    iconSurface: 'border-warning-300/30 bg-warning-500/20 text-warning-300',
    accentText: 'text-warning-300',
  },
  earnings: {
    Icon: WalletIcon,
    DetailIcon: UsersIcon,
    gradient: 'from-success-500/20 via-dark-900/95 to-dark-900',
    glow: 'bg-success-400/25',
    iconSurface: 'border-success-300/30 bg-success-500/20 text-success-300',
    accentText: 'text-success-300',
  },
};

interface DashboardPromoCarouselProps {
  slides: DashboardPromoSlide[];
}

export default function DashboardPromoCarousel({ slides }: DashboardPromoCarouselProps) {
  const { t } = useTranslation();
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

  if (slides.length === 0) return null;

  const activeSlide = slides[activeIndex] ?? slides[0];
  const presentation = PRESENTATION[activeSlide.id];
  const { Icon, DetailIcon } = presentation;
  const showPrevious = () =>
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  const showNext = () => setActiveIndex((current) => (current + 1) % slides.length);

  return (
    <section
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
          className={`group absolute inset-0 flex animate-fade-in overflow-hidden bg-gradient-to-r ${presentation.gradient} px-5 pb-10 pt-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent-400 sm:px-6 sm:pb-11 sm:pt-5`}
          aria-label={t(`dashboardPromo.slides.${activeSlide.id}.linkLabel`)}
          data-dashboard-promo-slide={activeSlide.id}
        >
          <div className="relative z-10 max-w-[68%] sm:max-w-[72%]">
            <p
              className={`mb-1 text-[10px] font-bold uppercase tracking-[0.16em] ${presentation.accentText}`}
            >
              {t(`dashboardPromo.slides.${activeSlide.id}.eyebrow`)}
            </p>
            <h2 className="font-display text-base font-semibold leading-tight text-dark-50 sm:text-xl">
              {t(`dashboardPromo.slides.${activeSlide.id}.title`)}
            </h2>
            <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-dark-300 sm:line-clamp-2 sm:text-sm">
              {t(`dashboardPromo.slides.${activeSlide.id}.description`)}
            </p>
            <span
              className={`mt-2 hidden items-center gap-1 text-xs font-semibold sm:inline-flex ${presentation.accentText}`}
            >
              {t(`dashboardPromo.slides.${activeSlide.id}.action`)}
              <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>

          <div className="pointer-events-none absolute inset-y-0 right-0 w-[42%] overflow-hidden">
            <div
              className={`absolute right-[-24px] top-1/2 h-28 w-28 -translate-y-1/2 rounded-full blur-2xl sm:h-36 sm:w-36 ${presentation.glow}`}
            />
            <div
              className="absolute inset-0 animate-float motion-reduce:animate-none"
              data-dashboard-promo-art
            >
              <div
                className={`absolute right-5 top-1/2 flex h-16 w-16 -translate-y-1/2 rotate-6 items-center justify-center rounded-2xl border shadow-card transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105 sm:right-8 sm:h-20 sm:w-20 ${presentation.iconSurface}`}
              >
                <Icon className="h-9 w-9 sm:h-11 sm:w-11" />
              </div>
            </div>
            <div
              className="absolute right-3 top-5 flex h-8 w-8 -rotate-6 items-center justify-center rounded-xl border border-dark-500/40 bg-dark-800/90 text-dark-200 shadow-soft sm:right-5 sm:top-6 sm:h-9 sm:w-9"
              data-dashboard-promo-detail-art
            >
              <DetailIcon className="h-4 w-4" />
            </div>
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
    </section>
  );
}
