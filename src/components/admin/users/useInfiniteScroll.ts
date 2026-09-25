import { useEffect, useRef } from 'react';

export function useInfiniteScroll(onLoadMore: () => void, enabled: boolean) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!enabled || !node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      },
      { rootMargin: '320px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, onLoadMore]);

  return sentinelRef;
}
