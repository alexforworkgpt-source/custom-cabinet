import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

test('Downloaded metadata must match prepared bytes, even with a replaced checksum pair', async () => {
  const { prepareAssets, verifyAssets } = await import('./assets.mjs');
  const root = mkdtempSync(join(tmpdir(), 'cabinet-metadata-assets-'));
  const prepared = join(root, 'prepared');
  const downloaded = join(root, 'downloaded');
  prepareAssets(prepared, { public: 'fixture' });
  prepareAssets(downloaded, { public: 'fixture' });
  verifyAssets(prepared, downloaded);
  prepareAssets(downloaded, { public: 'changed' });
  assert.throws(() => verifyAssets(prepared, downloaded), /bytes/);
  writeFileSync(
    join(downloaded, 'cabinet-release.json'),
    readFileSync(join(prepared, 'cabinet-release.json')),
  );
  assert.throws(() => verifyAssets(prepared, downloaded), /bytes/);
  prepareAssets(downloaded, { public: 'fixture' });
  writeFileSync(join(downloaded, 'unexpected.zip'), 'fixture');
  assert.throws(() => verifyAssets(prepared, downloaded), /set/);
});
