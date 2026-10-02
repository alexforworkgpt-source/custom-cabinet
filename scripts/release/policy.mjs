const shaPattern = /^[0-9a-f]{40}$/;
const repositoryPattern = /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\.git$/;

function exactFields(value, fields) {
  return (
    value &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.keys(value).sort().join() === [...fields].sort().join()
  );
}

export function publicEvidence(value) {
  return (
    typeof value === 'string' &&
    /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/(?:actions\/runs\/\d+|blob\/[0-9a-f]{40}\/[A-Za-z0-9_./-]+)$/.test(
      value,
    )
  );
}

export function validateRecord(record, source, upstream) {
  const fields = [
    'schema_version',
    'cabinet',
    'upstream',
    'bot',
    'changes',
    'limitations',
    'frontend_policy',
    'owner_approved',
  ];
  if (
    !exactFields(record, fields) ||
    record.schema_version !== 1 ||
    record.owner_approved !== true
  ) {
    throw new Error('Cabinet record must be a complete reviewed and approved schema v1 record');
  }
  for (const [value, keys] of [
    [record.cabinet, ['tag', 'sha', 'tree_sha']],
    [record.upstream, ['repository', 'tag', 'sha']],
    [record.bot, ['repository', 'sha', 'backend_contract', 'compatibility_evidence']],
    [record.frontend_policy, ['bscheker', 'simple_mode']],
  ]) {
    if (!exactFields(value, keys)) throw new Error('Record contains unknown or incomplete fields');
  }
  for (const key of ['tag', 'sha', 'tree_sha']) {
    if (record.cabinet?.[key] !== source[key])
      throw new Error('Cabinet record source does not match exact candidate');
  }
  for (const key of ['repository', 'tag', 'sha']) {
    if (record.upstream?.[key] !== upstream[key])
      throw new Error('Cabinet record upstream provenance does not match source');
  }
  if (
    !shaPattern.test(source.sha) ||
    !shaPattern.test(source.tree_sha) ||
    !repositoryPattern.test(upstream.repository) ||
    !shaPattern.test(upstream.sha) ||
    !repositoryPattern.test(record.bot?.repository) ||
    !shaPattern.test(record.bot?.sha) ||
    record.bot?.backend_contract !== '1' ||
    !publicEvidence(record.bot?.compatibility_evidence)
  ) {
    throw new Error('Exact provenance and verified Bot compatibility evidence are required');
  }
  if (
    !Array.isArray(record.changes) ||
    !record.changes.length ||
    record.changes.some((item) => typeof item !== 'string' || !item.trim())
  ) {
    throw new Error('Cabinet release must describe its changes');
  }
  if (
    !Array.isArray(record.limitations) ||
    !record.limitations.length ||
    record.limitations.some(
      (item) =>
        !exactFields(item, ['id', 'status', 'summary']) ||
        typeof item.id !== 'string' ||
        !item.id.trim() ||
        !['OPEN', 'BLOCKED'].includes(item.status) ||
        typeof item.summary !== 'string' ||
        !item.summary.trim(),
    ) ||
    !record.limitations.some(
      (item) => item.id === 'classic-auto-purchase' && item.status === 'OPEN',
    )
  ) {
    throw new Error(
      'Known backend classic auto-purchase and other unverified scenarios must remain explicit',
    );
  }
  if (
    record.frontend_policy?.bscheker !== 'excluded' ||
    record.frontend_policy?.simple_mode !== 'excluded'
  ) {
    throw new Error('Existing BSCHEKER and Simple/Lite Mode frontend exclusions must be preserved');
  }
}

export function releaseNotes(metadata) {
  return [
    `Custom Cabinet ${metadata.cabinet.tag}`,
    '',
    `Source: ${metadata.cabinet.sha}; tree: ${metadata.cabinet.tree_sha}.`,
    `Upstream Cabinet: ${metadata.upstream.repository}, ${metadata.upstream.tag}, ${metadata.upstream.sha}.`,
    `Verified Upstream Bot: ${metadata.bot.repository}, ${metadata.bot.sha}; contract ${metadata.bot.backend_contract}.`,
    `Compatibility evidence: ${metadata.bot.compatibility_evidence}.`,
    `Source gates: ${metadata.publication.source_gate_run_url}.`,
    `Reviewed record: ${metadata.publication.record_commit} / ${metadata.publication.record_path}.`,
    '',
    'Changes:',
    ...metadata.changes.map((value) => `- ${value}`),
    '',
    'Known limitations and accepted coverage:',
    ...metadata.limitations.map((value) => `- ${value.status} ${value.id}: ${value.summary}`),
    '',
    'BSCHEKER and Simple/Lite Mode remain excluded from Custom Cabinet frontend.',
    'Compiled production assets are published by Installer in Release Bundle.',
    'This Release does not deploy or update production.',
    '',
  ].join('\n');
}
