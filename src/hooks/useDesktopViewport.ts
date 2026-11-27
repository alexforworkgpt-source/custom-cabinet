import { useEffect, useState } from 'react';

const desktopQuery = '(min-width: 1024px)';

export function useDesktopViewport() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(desktopQuery).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(desktopQuery);
    const handleChange = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  return isDesktop;
}
