import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

export function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'cabinet-release-fixture-'));
  const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8' }).trim();
  git('init', '--quiet', '--initial-branch=main');
  git('config', 'user.name', 'Release fixture');
  git('config', 'user.email', 'fixture@example.test');
  git('config', 'commit.gpgsign', 'false');
  git('config', 'tag.gpgsign', 'false');
  git('config', 'core.autocrlf', 'false');
  git('config', 'core.hooksPath', join(root, 'no-hooks'));
  writeFileSync(join(root, 'public.txt'), 'public fixture');
  writeFileSync(
    join(root, 'UPSTREAM.md'),
    `# Upstream\n<https://github.com/OWNER/upstream.git>.\n\n- Upstream tag: \`v1.79.0\`\n- Upstream Git SHA: \`${'a'.repeat(40)}\`\n`,
  );
  writeFileSync(join(root, 'LICENSE'), 'Fictional license fixture\n');
  git('add', 'public.txt', 'UPSTREAM.md', 'LICENSE');
  git('commit', '--quiet', '-m', 'Source fixture');
  return { root, git, sha: git('rev-parse', 'HEAD') };
}

export function record() {
  return {
    schema_version: 1,
    cabinet: { tag: 'cabinet-v2026.10.01', sha: 'b'.repeat(40), tree_sha: 'c'.repeat(40) },
    upstream: {
      repository: 'https://github.com/OWNER/upstream.git',
      tag: 'v1.79.0',
      sha: 'a'.repeat(40),
    },
    bot: {
      repository: 'https://github.com/OWNER/bot.git',
      sha: 'd'.repeat(40),
      backend_contract: '1',
      compatibility_evidence: 'https://github.com/OWNER/bot/actions/runs/123',
    },
    changes: ['Release process fixture'],
    limitations: [
      {
        id: 'classic-auto-purchase',
        status: 'OPEN',
        summary: 'Known backend defect remains open.',
      },
    ],
    frontend_policy: { bscheker: 'excluded', simple_mode: 'excluded' },
    owner_approved: true,
  };
}
