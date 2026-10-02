import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

export function gitBytes(root, ...args) {
  try {
    return execFileSync('git', ['-C', root, ...args], { stdio: 'pipe' });
  } catch (error) {
    throw new Error('Unable to verify committed Cabinet source', { cause: error });
  }
}

export function git(root, ...args) {
  return gitBytes(root, ...args)
    .toString('utf8')
    .trim();
}

export function verifySource(root, tag, sha, workflowSha) {
  if (resolve(git(root, 'rev-parse', '--show-toplevel')) !== resolve(root)) {
    throw new Error('Cabinet source must be a Git repository root');
  }
  if (!/^cabinet-v\d{4}\.\d{2}\.\d{2}(?:\.\d+)?$/.test(tag)) {
    throw new Error('Cabinet tag must use cabinet-vYYYY.MM.DD[.N]');
  }
  if (
    !/^[0-9a-f]{40}$/.test(sha) ||
    workflowSha !== sha ||
    git(root, 'rev-parse', 'HEAD') !== sha
  ) {
    throw new Error('Cabinet checkout and publication workflow must match the exact source SHA');
  }
  if (git(root, 'rev-parse', '--verify', `refs/tags/${tag}^{commit}`) !== sha) {
    throw new Error('Cabinet tag does not match the selected source commit');
  }
  if (git(root, 'status', '--porcelain=v1', '--untracked-files=normal')) {
    throw new Error('Cabinet publication requires committed source without local changes');
  }
  const paths = gitBytes(root, 'ls-tree', '-r', '--name-only', '-z', sha)
    .toString('utf8')
    .split('\0')
    .filter(Boolean);
  if (
    paths.some((path) => {
      const parts = path.toLowerCase().split('/');
      const name = parts.at(-1);
      return (
        ['node_modules', 'dist', 'build', '.scratch', 'tmp', 'temp'].includes(parts[0]) ||
        parts[0].startsWith('.playwright-') ||
        name.endsWith('.zip') ||
        name === 'performance-audit-report.md' ||
        (name !== '.env.example' &&
          (name.endsWith('.env') || /^(?:\.env(?:\..+)?|env\.txt)$/.test(name)))
      );
    })
  ) {
    throw new Error('Cabinet commit contains private or generated material');
  }
  return { tag, sha, tree_sha: git(root, 'rev-parse', `${sha}^{tree}`) };
}
