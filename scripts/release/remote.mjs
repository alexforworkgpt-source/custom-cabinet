import { git } from './source.mjs';

export function verifyRemoteTag(root, tag, sha) {
  if (!/^cabinet-v\d{4}\.\d{2}\.\d{2}(?:\.\d+)?$/.test(tag) || !/^[0-9a-f]{40}$/.test(sha))
    throw new Error('Invalid Cabinet source identity');
  const ref = `refs/tags/${tag}`;
  const refs = new Map(
    git(root, 'ls-remote', '--tags', 'origin', ref, `${ref}^{}`)
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [value, name] = line.split(/\s+/);
        return [name, value];
      }),
  );
  if ((refs.get(`${ref}^{}`) || refs.get(ref)) !== sha) {
    throw new Error('Remote Cabinet tag does not match selected source SHA');
  }
}
