import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';
import { prepareAssets, verifyAssets } from './assets.mjs';
import { GitHubReleases } from './github.mjs';
import { prepareMetadata } from './metadata.mjs';
import { releaseNotes } from './policy.mjs';
import { verifyRemoteTag } from './remote.mjs';
import { verifySource } from './source.mjs';
import { uploadAssets, downloadAssets } from './transfer.mjs';

const [command, directory, downloaded] = process.argv.slice(2);
const commands = [
  'source',
  'prepare',
  'check-release',
  'create-draft',
  'publish-draft',
  'cleanup-draft',
  'verify-download',
  'upload-assets',
  'download-assets',
];
if (command === '--help') {
  console.log(`Commands: ${commands.join(', ')}. Outputs must be inside RUNNER_TEMP.`);
} else {
  try {
    if (!commands.includes(command)) throw new Error('Unknown Cabinet publication command');
    const env = process.env;
    const root = process.cwd();
    if (command === 'source') {
      console.log(
        JSON.stringify(verifySource(root, env.CABINET_TAG, env.CABINET_SHA, env.WORKFLOW_SHA)),
      );
    } else {
      const temporary = resolve(env.RUNNER_TEMP || '');
      const output = resolve(directory || '');
      const inside = relative(temporary, output);
      if (
        !env.RUNNER_TEMP ||
        !directory ||
        !inside ||
        inside.startsWith('..') ||
        isAbsolute(inside) ||
        resolve(root) === output
      ) {
        throw new Error('Publication output must be a child directory of RUNNER_TEMP');
      }
      const receiptPath = join(output, 'draft-receipt.json');
      if (command === 'prepare') {
        const source = verifySource(root, env.CABINET_TAG, env.CABINET_SHA, env.WORKFLOW_SHA);
        const metadata = prepareMetadata(
          root,
          source,
          env.RECORD_COMMIT,
          env.RECORD_PATH,
          env.DEFAULT_BRANCH,
          `https://github.com/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}`,
          env.WORKFLOW_SHA,
        );
        mkdirSync(output, { recursive: true });
        prepareAssets(join(output, 'assets'), metadata);
        writeFileSync(join(output, 'notes.md'), releaseNotes(metadata));
      } else if (command === 'verify-download') {
        if (!downloaded) throw new Error('Downloaded asset directory is required');
        verifyAssets(join(output, 'assets'), resolve(downloaded));
      } else {
        const api = new GitHubReleases(env.GITHUB_REPOSITORY, env.GH_TOKEN);
        const run = `${env.GITHUB_RUN_ID}/${env.GITHUB_RUN_ATTEMPT}`;
        if (command === 'check-release') {
          if (await api.find(env.CABINET_TAG))
            throw new Error('Release already exists; select a new tag');
        } else if (command === 'create-draft') {
          verifyRemoteTag(root, env.CABINET_TAG, env.CABINET_SHA);
          const receipt = await api.createDraft(
            env.CABINET_TAG,
            readFileSync(join(output, 'notes.md'), 'utf8'),
            run,
            env.CABINET_SHA,
          );
          writeFileSync(receiptPath, `${JSON.stringify(receipt)}\n`);
        } else if (command !== 'cleanup-draft' || existsSync(receiptPath)) {
          const receipt = JSON.parse(readFileSync(receiptPath, 'utf8'));
          if (receipt.tag !== env.CABINET_TAG)
            throw new Error('Receipt tag does not match selected Cabinet');
          if (command === 'cleanup-draft') await api.cleanup(receipt, run);
          else if (command === 'upload-assets')
            await uploadAssets(api, receipt, run, join(output, 'assets'));
          else if (command === 'download-assets') {
            if (!downloaded) throw new Error('Downloaded asset directory is required');
            const target = resolve(downloaded);
            const child = relative(temporary, target);
            if (!child || child.startsWith('..') || isAbsolute(child)) {
              throw new Error('Downloaded assets must be inside RUNNER_TEMP');
            }
            await downloadAssets(api, receipt, run, target);
          } else {
            if (!['true', 'false'].includes(env.PRERELEASE))
              throw new Error('Explicit prerelease policy is required');
            verifyRemoteTag(root, env.CABINET_TAG, env.CABINET_SHA);
            await api.publish(receipt, run, env.PRERELEASE === 'true');
          }
        }
      }
    }
  } catch (error) {
    // Do not print API response bodies, environment values or nested command output.
    console.error(error instanceof Error ? error.message : 'Cabinet publication failed');
    process.exitCode = 1;
  }
}
