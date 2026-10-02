import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fixture } from './fixture.mjs';

test('annotated tags work, but tracked private/generated files cannot be released', async () => {
  const { verifySource } = await import('./source.mjs');
  const { root, git, sha } = fixture();
  git('tag', '-a', 'cabinet-v2026.10.01', '-m', 'Source fixture tag');
  assert.equal(verifySource(root, 'cabinet-v2026.10.01', sha, sha).sha, sha);
  writeFileSync(join(root, '.env.production'), 'fictional-private-value');
  git('add', '.env.production');
  git('commit', '--quiet', '-m', 'Private fixture');
  const changed = git('rev-parse', 'HEAD');
  git('tag', 'cabinet-v2026.10.02');
  assert.throws(
    () => verifySource(root, 'cabinet-v2026.10.02', changed, changed),
    /private|generated/,
  );
});

test('Cabinet tag must point to the exact tested source commit', async () => {
  const { verifySource } = await import('./source.mjs');
  const { root, git, sha } = fixture();
  git('commit', '--quiet', '--allow-empty', '-m', 'Other source fixture');
  git('tag', 'cabinet-v2026.10.01');
  git('checkout', '--quiet', '--detach', sha);
  assert.throws(() => verifySource(root, 'cabinet-v2026.10.01', sha, sha), /tag.*commit/);
});

test('Tracked env files with a nonstandard prefix are private publication material', async () => {
  const { verifySource } = await import('./source.mjs');
  const { root, git } = fixture();
  writeFileSync(join(root, '.integration.env'), 'fictional-private-value');
  git('add', '.integration.env');
  git('commit', '--quiet', '-m', 'Private env fixture');
  const sha = git('rev-parse', 'HEAD');
  git('tag', 'cabinet-v2026.10.01');
  assert.throws(() => verifySource(root, 'cabinet-v2026.10.01', sha, sha), /private/);
});
