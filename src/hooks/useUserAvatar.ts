import { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { initDataUser } from '@telegram-apps/sdk-react';
import { authApi } from '../api/auth';
import type { User } from '../types';

const AVATAR_STALE_MS = 60 * 60 * 1000;

function readInitDataPhoto(): string | null {
  try {
    return initDataUser()?.photo_url ?? null;
  } catch {
    return null;
  }
}

export interface UserAvatar {
  src: string | null;
  onError: () => void;
}

export function useUserAvatar(user: User | null): UserAvatar {
  const initDataPhoto = useMemo(readInitDataPhoto, []);
  const [failed, setFailed] = useState<readonly string[]>([]);

  const { data } = useQuery({
    queryKey: ['my-avatar', user?.id ?? null],
    queryFn: authApi.getMyAvatar,
    enabled: Boolean(user?.telegram_id),
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
