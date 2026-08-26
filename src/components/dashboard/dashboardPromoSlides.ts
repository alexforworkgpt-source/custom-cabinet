export type DashboardPromoSlideId =
  | 'telegram'
  | 'email'
  | 'connection'
  | 'tariff'
  | 'channel'
  | 'gift'
  | 'earnings';

export interface DashboardPromoSlide {
  id: DashboardPromoSlideId;
  href: string;
  external?: boolean;
}

export interface DashboardPromoSlideSelection {
  telegramLinked: boolean | undefined;
  emailLinked: boolean | undefined;
  subscriptionState: 'active' | 'none' | 'unknown';
  giftEnabled: boolean | undefined;
  referralEnabled: boolean | undefined;
}

interface LinkedProviderState {
  provider: string;
  linked: boolean;
}

const EMAIL_IDENTITY_PROVIDERS = new Set(['email', 'google', 'yandex']);

export function resolveEmailIdentityLinked(
  providers: readonly LinkedProviderState[],
  fallback: boolean | undefined,
): boolean | undefined {
  if (providers.some((item) => EMAIL_IDENTITY_PROVIDERS.has(item.provider) && item.linked)) {
    return true;
  }

  const directEmail = providers.find((item) => item.provider === 'email');
  return directEmail?.linked ?? fallback;
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

  if (subscriptionState !== 'unknown') {
    slides.push({
      id: 'channel',
      href: 'https://t.me/private_config_news',
      external: true,
    });
  }

  if (giftEnabled === true) slides.push({ id: 'gift', href: '/gift' });
  if (referralEnabled === true) slides.push({ id: 'earnings', href: '/referral' });

  return slides.slice(0, 5);
}
