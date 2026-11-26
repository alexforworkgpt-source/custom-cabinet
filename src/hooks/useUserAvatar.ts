import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { initDataUser } from '@telegram-apps/sdk-react';
import { authApi } from '../api/auth';
import type { User } from '../types';

const AVATAR_STALE_MS = 60 * 60 * 1000;

function readInitDataPhoto(telegramId: number | null): string | null {
  if (telegramId === null) return null;
  try {
    const telegramUser = initDataUser();
    return telegramUser?.id === telegramId ? (telegramUser.photo_url ?? null) : null;
  } catch {
    return null;
  }
}

export interface UserAvatar {
  src: string | null;
  onError: () => void;
}

export function useUserAvatar(user: User | null, fetchEnabled = true): UserAvatar {
  const telegramId = user?.telegram_id ?? null;
  const initDataPhoto = useMemo(() => readInitDataPhoto(telegramId), [telegramId]);
  const [failed, setFailed] = useState<readonly string[]>([]);

  const { data } = useQuery({
    queryKey: ['my-avatar', user?.id ?? null, telegramId],
    queryFn: authApi.getMyAvatar,
    enabled: fetchEnabled && Boolean(telegramId),
    staleTime: AVATAR_STALE_MS,
    retry: false,
  });

  const candidates = useMemo(
    () => [initDataPhoto, data?.photo_url ?? null].filter((url): url is string => Boolean(url)),
    [initDataPhoto, data?.photo_url],
  );
  const src = candidates.find((url) => !failed.includes(url)) ?? null;

  const onError = useCallback(() => {
    if (src) setFailed((prev) => (prev.includes(src) ? prev : [...prev, src]));
  }, [src]);

  return { src, onError };
}

export function useAvatarPreload(user: User | null, fetchEnabled: boolean) {
  const { src, onError } = useUserAvatar(user, fetchEnabled);

  useEffect(() => {
    if (!src) return;
    const image = new Image();
    image.fetchPriority = 'low';
    image.onerror = onError;
    image.src = src;

    return () => {
      image.onerror = null;
    };
  }, [src, onError]);
}
