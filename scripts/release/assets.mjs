import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const names = ['cabinet-release.json', 'cabinet-release.json.sha256'];

export function prepareAssets(directory, metadata) {
  mkdirSync(directory, { recursive: true });
  const bytes = `${JSON.stringify(metadata, null, 2)}\n`;
  writeFileSync(join(directory, names[0]), bytes);
  const digest = createHash('sha256').update(bytes).digest('hex');
  writeFileSync(join(directory, names[1]), `${digest}  ${names[0]}\n`);
}

export function verifyAssets(prepared, downloaded) {
  for (const directory of [prepared, downloaded]) {
    if (readdirSync(directory).sort().join() !== names.join()) {
      throw new Error('Cabinet Release asset set must contain only metadata and its checksum');
    }
  }
  for (const name of names) {
    if (!readFileSync(join(prepared, name)).equals(readFileSync(join(downloaded, name)))) {
      throw new Error('Downloaded Cabinet Release bytes differ from prepared assets');
    }
  }
  const metadata = readFileSync(join(prepared, names[0]));
  const checksum = `${createHash('sha256').update(metadata).digest('hex')}  ${names[0]}\n`;
  if (readFileSync(join(prepared, names[1]), 'utf8') !== checksum) {
    throw new Error('Prepared Cabinet metadata checksum is invalid');
  }
}
