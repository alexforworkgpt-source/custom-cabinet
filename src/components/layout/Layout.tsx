import { AppShell } from './AppShell';
import { MobileNavigationProvider } from './AppShell/MobileNavigation';

interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout component that wraps all pages.
 * Uses the new AppShell system with:
 * - Desktop sidebar navigation
 * - Mobile bottom navigation
 * - Command palette (⌘K)
 * - Platform-aware features (Telegram integration)
 */
export default function Layout({ children }: LayoutProps) {
  return (
    <MobileNavigationProvider>
      <AppShell>{children}</AppShell>
    </MobileNavigationProvider>
  );
}
