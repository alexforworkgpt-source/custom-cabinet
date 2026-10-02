import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixture } from './fixture.mjs';

test('Remote annotated Cabinet tag must dereference to selected source, not its tag object', async () => {
  const { verifyRemoteTag } = await import('./remote.mjs');
  const { root, git, sha } = fixture();
  git('tag', '-a', 'cabinet-v2026.10.01', '-m', 'Source fixture');
  git('remote', 'add', 'origin', root);
  verifyRemoteTag(root, 'cabinet-v2026.10.01', sha);
  assert.throws(
    () =>
      verifyRemoteTag(
        root,
        'cabinet-v2026.10.01',
        git('rev-parse', 'refs/tags/cabinet-v2026.10.01'),
      ),
    /source/,
  );
  assert.throws(() => verifyRemoteTag(root, 'cabinet-v2026.10.02', sha), /source/);
});
