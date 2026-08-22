export type DashboardPromoSlideId =
  | 'telegram'
  | 'email'
  | 'connection'
  | 'tariff'
  | 'gift'
  | 'earnings';

export interface DashboardPromoSlide {
  id: DashboardPromoSlideId;
  href: string;
}

export interface DashboardPromoSlideSelection {
  telegramLinked: boolean | undefined;
  emailLinked: boolean | undefined;
  subscriptionState: 'active' | 'none' | 'unknown';
  giftEnabled: boolean | undefined;
  referralEnabled: boolean | undefined;
}

export function selectDashboardPromoSlides({
  telegramLinked,
  emailLinked,
  subscriptionState,
  giftEnabled,
  referralEnabled,
}: DashboardPromoSlideSelection): DashboardPromoSlide[] {
  const slides: DashboardPromoSlide[] = [];

  if (telegramLinked === false) slides.push({ id: 'telegram', href: '/profile/accounts' });
  if (emailLinked === false) slides.push({ id: 'email', href: '/profile/accounts' });

  if (subscriptionState === 'active') {
    slides.push({ id: 'connection', href: '/connection' });
  } else if (subscriptionState === 'none') {
    slides.push({ id: 'tariff', href: '/subscription/purchase' });
  }

  if (giftEnabled === true) slides.push({ id: 'gift', href: '/gift' });
  if (referralEnabled === true) slides.push({ id: 'earnings', href: '/referral' });

  return slides.slice(0, 4);
}
