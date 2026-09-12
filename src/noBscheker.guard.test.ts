import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  collectNoBschekerPolicyFiles,
  findNoBschekerPolicyViolations,
} from './test/noBschekerGuard';

describe('frontend policy without BSCHEKER', () => {
  it('rejects every forbidden frontend integration surface', () => {
    const files = [
      { path: 'src/App.tsx', content: '<Route path="/admin/reachability" />' },
      { path: 'src/pages/AdminPanel.tsx', content: "to: '/admin/reachability'" },
      { path: 'src/types/permissions.ts', content: "'reachability:read'" },
      { path: 'src/pages/AdminSettings.tsx', content: "'BSCHEK_API_KEY'" },
      {
        path: 'src/api/admin.ts',
        content: "apiClient.get('/cabinet/admin/reachability/status')",
      },
      { path: 'src/hooks/useReachabilityStatus.ts', content: 'refetchInterval: 5_000' },
      { path: 'src/locales/ru.json', content: '{"bscheker":{"title":"BSCHEKER"}}' },
      { path: 'tests/e2e/fixtures/admin.json', content: '{"bscheker_enabled":true}' },
    ];

    expect(findNoBschekerPolicyViolations(files).map(({ path }) => path)).toEqual(
      files.map(({ path }) => path),
    );
  });

  it('rejects the operator icon bundle that belongs only to the excluded feature', () => {
    expect(
      findNoBschekerPolicyViolations([{ path: 'src/assets/operators/mts.png', content: '' }]),
    ).toEqual([{ path: 'src/assets/operators/mts.png', marker: 'operator-assets' }]);
  });

  it('keeps the actual Custom Cabinet frontend tree free of the excluded feature', () => {
    const projectRoot = join(import.meta.dirname, '..');
    expect(findNoBschekerPolicyViolations(collectNoBschekerPolicyFiles(projectRoot))).toEqual([]);
  });
});
