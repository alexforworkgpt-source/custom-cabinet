import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { fixture, record } from './fixture.mjs';

test('Publication CLI reads a committed approved record and writes only two public assets', () => {
  const { root, git, sha } = fixture();
  const value = record();
  value.cabinet.sha = sha;
  value.cabinet.tree_sha = git('rev-parse', 'HEAD^{tree}');
  git('tag', value.cabinet.tag);
  const path = `releases/records/${value.cabinet.tag}.json`;
  mkdirSync(join(root, 'releases/records'), { recursive: true });
  writeFileSync(join(root, path), JSON.stringify(value));
  git('add', path);
  git('commit', '--quiet', '-m', 'Reviewed public record fixture');
  const reviewed = git('rev-parse', 'HEAD');
  git('update-ref', 'refs/remotes/origin/main', reviewed);
  git('checkout', '--quiet', '--detach', sha);
  const output = `${root}-output`;
  const env = {
    ...process.env,
    CABINET_TAG: value.cabinet.tag,
    CABINET_SHA: sha,
    WORKFLOW_SHA: sha,
    RECORD_COMMIT: reviewed,
    RECORD_PATH: path,
    DEFAULT_BRANCH: 'main',
    GITHUB_REPOSITORY: 'OWNER/custom-cabinet',
    GITHUB_RUN_ID: '123',
    RUNNER_TEMP: tmpdir(),
  };
  const run = (directory, extra = {}) =>
    spawnSync(
      process.execPath,
      [fileURLToPath(new URL('./publish.mjs', import.meta.url)), 'prepare', directory],
      { cwd: root, env: { ...env, ...extra }, encoding: 'utf8' },
    );
  const result = run(output);
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(readdirSync(join(output, 'assets')).sort(), [
    'cabinet-release.json',
    'cabinet-release.json.sha256',
  ]);
  assert.equal(
    JSON.parse(readFileSync(join(output, 'assets/cabinet-release.json'))).cabinet.sha,
    sha,
  );
  assert.equal(git('status', '--porcelain'), '');
  assert.notEqual(run(output, { WORKFLOW_SHA: 'f'.repeat(40) }).status, 0);
  assert.notEqual(run(join(tmpdir(), '..', 'outside-publication-fixture')).status, 0);
});
