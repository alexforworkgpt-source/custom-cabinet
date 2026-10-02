import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  collectNoLiteModePolicyFiles,
  findNoLiteModePolicyViolations,
} from './test/noLiteModeGuard';

describe('frontend policy without upstream Simple/Lite Mode', () => {
  it('rejects every excluded frontend integration surface', () => {
    const files = [
      { path: 'src/config/constants.ts', content: "LITE_MODE: 'cabinet-lite-mode'" },
      {
        path: 'src/api/branding.ts',
        content: "apiClient.get('/cabinet/branding/lite-mode')",
      },
      { path: 'src/hooks/useLiteMode.ts', content: 'export function useLiteMode() {}' },
      { path: 'src/components/admin/BrandingTab.tsx', content: "t('admin.settings.liteMode')" },
      { path: 'src/pages/HomeScreen.tsx', content: 'export default function HomeScreen() {}' },
      {
        path: 'src/pages/DashboardLite.tsx',
        content: 'export default function DashboardLite() {}',
      },
      {
        path: 'src/pages/SubscriptionScreen.tsx',
        content: 'export default function SubscriptionScreen() {}',
      },
      {
        path: 'src/pages/SubscriptionLite.tsx',
        content: 'export default function SubscriptionLite() {}',
      },
      { path: 'src/components/lite/LiteRow.tsx', content: '' },
      { path: 'src/utils/liteStatus.ts', content: 'export const liteStatus = () => {}' },
    ];

    expect(new Set(findNoLiteModePolicyViolations(files).map(({ path }) => path))).toEqual(
      new Set(files.map(({ path }) => path)),
    );
  });

  it('keeps the actual Custom Cabinet frontend free of the excluded feature', () => {
    const projectRoot = join(import.meta.dirname, '..');
    expect(findNoLiteModePolicyViolations(collectNoLiteModePolicyFiles(projectRoot))).toEqual([]);
  });
});
