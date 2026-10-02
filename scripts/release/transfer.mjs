import { execFileSync } from 'node:child_process';
import { lstatSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const safeName = (name) => typeof name === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(name);

function ghApi(api, args, runner) {
  try {
    return runner('gh', ['api', ...args], {
      env: { ...process.env, GH_TOKEN: api.token },
      stdio: ['ignore', 'pipe', 'pipe'],
      maxBuffer: 32 * 1024 * 1024,
    });
  } catch {
    throw new Error('GitHub asset transfer failed; inspect the owned draft');
  }
}

export async function uploadAssets(api, receipt, run, directory, runner = execFileSync) {
  const release = await api.uniqueOwnedDraft(receipt, run);
  if (!Array.isArray(release.assets) || release.assets.length !== 0) {
    throw new Error('Owned draft must have no existing assets before upload');
  }
  const names = readdirSync(directory).sort();
  if (
    names.length === 0 ||
    names.some((name) => !safeName(name) || !lstatSync(join(directory, name)).isFile())
  ) {
    throw new Error('Prepared assets must be regular files with safe names');
  }
  for (const name of names) {
    const endpoint = `https://uploads.github.com/repos/${api.repository}/releases/${receipt.id}/assets?name=${encodeURIComponent(name)}`;
    const bytes = ghApi(
      api,
      [
        endpoint,
        '--method',
        'POST',
        '-H',
        'Content-Type: application/octet-stream',
        '--input',
        join(directory, name),
      ],
      runner,
    );
    const asset = JSON.parse(bytes);
    if (
      !Number.isSafeInteger(asset?.id) ||
      asset.id <= 0 ||
      asset.name !== name ||
      asset.state !== 'uploaded'
    ) {
      throw new Error('Uploaded asset identity is invalid');
    }
  }
}

export async function downloadAssets(api, receipt, run, directory, runner = execFileSync) {
  const { assets } = await api.uniqueOwnedDraft(receipt, run);
  if (
    !Array.isArray(assets) ||
    assets.length === 0 ||
    assets.some(
      (asset) =>
        !Number.isSafeInteger(asset?.id) ||
        asset.id <= 0 ||
        !safeName(asset.name) ||
        asset.state !== 'uploaded',
    ) ||
    new Set(assets.map((asset) => asset.name)).size !== assets.length ||
    new Set(assets.map((asset) => asset.id)).size !== assets.length
  ) {
    throw new Error('Owned draft asset identities are invalid');
  }
  mkdirSync(directory);
  for (const asset of assets) {
    const bytes = ghApi(
      api,
      [
        `repos/${api.repository}/releases/assets/${asset.id}`,
        '-H',
        'Accept: application/octet-stream',
      ],
      runner,
    );
    writeFileSync(join(directory, asset.name), bytes, { flag: 'wx' });
  }
}
