import { createHash } from 'node:crypto';
import { git, gitBytes } from './source.mjs';
import { publicEvidence, validateRecord } from './policy.mjs';

export function prepareMetadata(root, source, commit, path, defaultBranch, runUrl, workflowSha) {
  if (
    !/^[0-9a-f]{40}$/.test(commit) ||
    !/^releases\/records\/[A-Za-z0-9_.-]+\.json$/.test(path) ||
    path.includes('..')
  ) {
    throw new Error('An exact reviewed commit and public releases/records JSON are required');
  }
  if (workflowSha !== source.sha || !publicEvidence(runUrl)) {
    throw new Error('Source gate workflow identity is invalid');
  }
  git(root, 'check-ref-format', `refs/heads/${defaultBranch}`);
  git(root, 'merge-base', '--is-ancestor', commit, `refs/remotes/origin/${defaultBranch}`);
  const record = JSON.parse(git(root, 'show', `${commit}:${path}`));
  const provenance = git(root, 'show', `${source.sha}:UPSTREAM.md`);
  const upstream = {
    repository: provenance.match(
      /<(https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\.git)>/,
    )?.[1],
    tag: provenance.match(/^- Upstream tag: `([^`]+)`/m)?.[1],
    sha: provenance.match(/^- Upstream Git SHA: `([0-9a-f]{40})`/m)?.[1],
  };
  validateRecord(record, source, upstream);
  return {
    ...record,
    publication: {
      workflow_sha: workflowSha,
      source_gate_run_url: runUrl,
      record_commit: commit,
      record_path: path,
      license_sha256: createHash('sha256')
        .update(gitBytes(root, 'show', `${source.sha}:LICENSE`))
        .digest('hex'),
    },
  };
}
