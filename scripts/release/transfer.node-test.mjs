import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { GitHubReleases } from './github.mjs';

test('Assets are uploaded and downloaded by owned Release and asset IDs', async () => {
  const { uploadAssets, downloadAssets } = await import('./transfer.mjs');
  const directory = mkdtempSync(join(tmpdir(), 'cabinet-owned-assets-'));
  try {
    const prepared = join(directory, 'prepared');
    mkdirSync(prepared);
    writeFileSync(join(prepared, 'cabinet-release.json'), 'controlled metadata');
    writeFileSync(join(prepared, 'cabinet-release.json.sha256'), 'controlled checksum');
    const receipt = {
      repository: 'OWNER/custom-cabinet',
      tag: 'cabinet-v2026.10.01',
      id: 12,
      marker: '<!-- publication-run: 123/1 -->',
    };
    const owned = { id: 12, tag_name: receipt.tag, draft: true, body: receipt.marker, assets: [] };
    const api = new GitHubReleases(receipt.repository, 'fictional-token', async (url) =>
      Response.json(new URL(url).pathname.endsWith('/12') ? owned : [owned]),
    );
    const endpoints = [];
    const runner = (_command, args) => {
      endpoints.push(args[1]);
      if (args.includes('--input')) {
        const name = new URL(args[1]).searchParams.get('name');
        const asset = { id: 20 + owned.assets.length, name, state: 'uploaded' };
        owned.assets.push(asset);
        return Buffer.from(JSON.stringify(asset));
      }
      const asset = owned.assets.find((item) => args[1].endsWith(`/${item.id}`));
      return readFileSync(join(prepared, asset.name));
    };
    await uploadAssets(api, receipt, '123/1', prepared, runner);
    const downloaded = join(directory, 'downloaded');
    await downloadAssets(api, receipt, '123/1', downloaded, runner);
    assert.ok(
      endpoints.slice(0, 2).every((endpoint) => endpoint.includes('/releases/12/assets?name=')),
    );
    assert.deepEqual(endpoints.slice(2), [
      'repos/OWNER/custom-cabinet/releases/assets/20',
      'repos/OWNER/custom-cabinet/releases/assets/21',
    ]);
    assert.equal(
      readFileSync(join(downloaded, 'cabinet-release.json'), 'utf8'),
      'controlled metadata',
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
});
