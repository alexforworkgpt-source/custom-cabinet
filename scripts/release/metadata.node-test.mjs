import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fixture, record } from './fixture.mjs';

test('metadata uses exact source provenance and only a reviewed default-branch record', async () => {
  const { prepareMetadata } = await import('./metadata.mjs');
  const { root, git, sha } = fixture();
  const source = { tag: 'cabinet-v2026.10.01', sha, tree_sha: git('rev-parse', 'HEAD^{tree}') };
  const value = record();
  value.cabinet = source;
  const path = 'releases/records/cabinet-v2026.10.01.json';
  mkdirSync(join(root, 'releases/records'), { recursive: true });
  writeFileSync(join(root, path), JSON.stringify(value));
  git('add', path);
  git('commit', '--quiet', '-m', 'Reviewed record fixture');
  const reviewed = git('rev-parse', 'HEAD');
  git('update-ref', 'refs/remotes/origin/main', reviewed);
  git('checkout', '--quiet', '--detach', sha);
  const metadata = prepareMetadata(
    root,
    source,
    reviewed,
    path,
    'main',
    'https://github.com/OWNER/custom-cabinet/actions/runs/123',
    sha,
  );
  assert.equal(metadata.upstream.sha, value.upstream.sha);
  assert.equal(metadata.publication.record_commit, reviewed);
  assert.match(metadata.publication.license_sha256, /^[0-9a-f]{64}$/);
  git('commit', '--quiet', '--allow-empty', '-m', 'Unreviewed side branch');
  assert.throws(() =>
    prepareMetadata(
      root,
      source,
      git('rev-parse', 'HEAD'),
      path,
      'main',
      metadata.publication.source_gate_run_url,
      sha,
    ),
  );
  assert.throws(() =>
    prepareMetadata(
      root,
      source,
      reviewed,
      '../.env.local',
      'main',
      metadata.publication.source_gate_run_url,
      sha,
    ),
  );
});
