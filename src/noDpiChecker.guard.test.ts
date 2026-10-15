import { join } from 'node:path';
import { expect, it, vi } from 'vitest';
import { adminSettingsApi } from './api/adminSettings';
import apiClient from './api/client';
import { rbacApi } from './api/rbac';
import {
  collectNoDpiCheckerPolicyFiles,
  findNoDpiCheckerPolicyViolations,
} from './test/noDpiCheckerGuard';

vi.mock('./api/client', () => ({ default: { get: vi.fn(), put: vi.fn() } }));

it('filters excluded server settings and permission definitions without changing assigned permissions', async () => {
  const settings = ['DPICHECKER_ENABLED', 'BSCHEK_ENABLED', 'CASHERA_ENABLED'].map((key) => ({
    key,
    category: { key: key.split('_')[0] },
  }));
  vi.mocked(apiClient.get).mockResolvedValueOnce({ data: settings });
  expect((await adminSettingsApi.getSettings()).map(({ key }) => key)).toEqual(['CASHERA_ENABLED']);
  vi.mocked(apiClient.get).mockResolvedValueOnce({
    data: [{ key: 'DPICHECKER' }, { key: 'CASHERA' }],
  });
  expect((await adminSettingsApi.getCategories()).map(({ key }) => key)).toEqual(['CASHERA']);
  vi.mocked(apiClient.get).mockResolvedValueOnce({
    data: [
      { section: 'dpichecker', actions: ['read', 'run'] },
      { section: 'reachability', actions: ['read', 'run'] },
      { section: 'users', actions: ['read'] },
    ],
  });
  expect(await rbacApi.getPermissionRegistry()).toEqual([{ section: 'users', actions: ['read'] }]);
  const permissions = ['users:read', 'dpichecker:read'];
  vi.mocked(apiClient.put).mockResolvedValueOnce({ data: { id: 7, permissions } });
  await rbacApi.updateRole(7, { permissions });
  expect(apiClient.put).toHaveBeenCalledWith('/cabinet/admin/rbac/roles/7', { permissions });
});

it('rejects excluded service routes, requests, settings, permissions and assets', () => {
  const files = [
    { path: 'src/App.tsx', content: '<Route path="/admin/dpichecker" />' },
    { path: 'src/api/dpichecker.ts', content: '' },
    {
      path: 'src/hooks/useStatus.ts',
      content: "apiClient.get('/cabinet/admin/dpichecker/status')",
    },
    { path: 'src/components/admin/constants.ts', content: "categories: ['DPICHECKER']" },
    { path: 'src/types/permissions.ts', content: "'dpichecker:run'" },
    { path: 'src/locales/ru.json', content: '{"service":{"title":"DPI//CHECKER"}}' },
    { path: 'tests/e2e/fixtures/admin.json', content: '{"dpichecker_enabled":true}' },
    { path: 'public/dpichecker.png', content: '' },
  ];

  expect(findNoDpiCheckerPolicyViolations(files).map(({ path }) => path)).toEqual(
    files.map(({ path }) => path),
  );
});

it('keeps the actual frontend tree free of the excluded service', () => {
  const projectRoot = join(import.meta.dirname, '..');
  expect(findNoDpiCheckerPolicyViolations(collectNoDpiCheckerPolicyFiles(projectRoot))).toEqual([]);
});

it('allows only the exact exclusion declaration, never a client in the policy module', () => {
  const path = 'src/config/cabinetFeatureVisibility.ts';
  const content =
    'const EXCLUDED_FEATURE_KEYS = /^(?:dpichecker|bschek|reachability)(?:$|[_:])/iu;';
  expect(findNoDpiCheckerPolicyViolations([{ path, content }])).toEqual([]);
  expect(
    findNoDpiCheckerPolicyViolations([
      { path, content: `${content}\nfetch("/cabinet/admin/dpichecker")` },
    ]),
  ).toHaveLength(1);
});
