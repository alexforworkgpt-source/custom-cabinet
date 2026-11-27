import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useHaptic } from '@/platform';
import { cn } from '@/lib/utils';
import type { User } from '@/types';
import type { UserAvatar } from '@/hooks/useUserAvatar';
import { UserIcon, UsersIcon } from '@/components/icons';
import { displayName } from '@/utils/displayName';
import { uiLocale } from '@/utils/uiLocale';
import '@/styles/cabinetPageHero.css';

interface Props {
  user: User | null;
  avatar: UserAvatar;
  groupName?: string | null;
}

/** The identity header is read-only; Profile owns the existing avatar query. */
export function ProfileIdentity({ user, avatar, groupName }: Props) {
  const { t } = useTranslation();
  const location = useLocation();
  const haptic = useHaptic();
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const loaded = avatar.src !== null && loadedSrc === avatar.src;
  const parts = [user?.first_name, user?.last_name]
    .filter(Boolean)
    .join(' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const initials = (parts.length > 1 ? [parts[0], parts[parts.length - 1]] : parts)
    .map((part) => Array.from(part)[0])
    .join('')
    .toLocaleUpperCase(uiLocale());
  return (
    <div className="cabinet-page-hero cabinet-page-hero--profile flex items-center gap-3">
      <span
        role="img"
        aria-label={t('profile.avatar')}
        className="relative flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#cbe5ff] bg-[#e6f2ff] text-[#145ca7] sm:h-[68px] sm:w-[68px]"
      >
        {avatar.src && (
          <img
            src={avatar.src}
            alt=""
            width={68}
            height={68}
            className={cn(
              'absolute inset-0 h-full w-full object-cover',
              loaded ? 'opacity-100' : 'opacity-0',
            )}
            onLoad={() => setLoadedSrc(avatar.src)}
            onError={avatar.onError}
          />
        )}
        {!loaded &&
          (initials ? (
            <span className="text-lg font-semibold" aria-hidden="true">
              {initials}
            </span>
          ) : (
            <UserIcon className="h-7 w-7" aria-hidden="true" />
          ))}
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="break-words text-lg font-semibold leading-snug [overflow-wrap:anywhere]">
          {displayName(user) || t('profile.accountInfo')}
        </h2>
        {user?.username && (
          <p className="mt-1 break-all text-sm text-[#c6dff8]">@{user.username}</p>
        )}
        {groupName && (
          <Link
            to="/info"
            state={{
              infoSection: 'loyalty',
              infoReturnTo: location.pathname + location.search + location.hash,
            }}
            onClick={() => haptic.impact('light')}
            className="profile-group-badge mt-2 inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-medium"
          >
            <UsersIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="min-w-0 [overflow-wrap:anywhere]">{groupName}</span>
          </Link>
        )}
      </div>
    </div>
  );
}
