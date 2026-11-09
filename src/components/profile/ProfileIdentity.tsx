import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { User } from '@/types';
import type { UserAvatar } from '@/hooks/useUserAvatar';
import { UserIcon } from '@/components/icons';
import { displayName } from '@/utils/displayName';
import { uiLocale } from '@/utils/uiLocale';

interface Props {
  user: User | null;
  avatar: UserAvatar;
}

/** The identity header is read-only; Profile owns the existing avatar query. */
export function ProfileIdentity({ user, avatar }: Props) {
  const { t } = useTranslation();
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
    <div className="mb-4 flex items-center gap-3">
      <span
        role="img"
        aria-label={t('profile.avatar')}
        className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-dark-700 bg-dark-800/50 text-accent-400 sm:h-16 sm:w-16"
      >
        {avatar.src && (
          <img
            src={avatar.src}
            alt=""
            width={64}
            height={64}
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
        <h2 className="break-words text-lg font-semibold leading-snug text-dark-100 [overflow-wrap:anywhere]">
          {displayName(user) || t('profile.accountInfo')}
        </h2>
        {user?.username && <p className="mt-1 break-all text-sm text-dark-400">@{user.username}</p>}
      </div>
    </div>
  );
}
