import { afterEach, expect, it, vi } from 'vitest';
import { hasTargetBotContract } from './upstreamBotContract';

const releaseSha = '0fb7453a1f606c51e4ad92fa155436eb06e04081';
const patchedSha = '4425f348070800e3bf9fb760f9ec787b8e6c5dc4';
const nextSha = '64beb370e6d69b23d3b651f91033f3b72e9e1f56';
const previousSha = '5bda3c56f0afd9f4813e9c6fa48934948b05ebae';

afterEach(() => vi.unstubAllEnvs());

it.each([
  [releaseSha, '', true],
  [patchedSha, '', true],
  [nextSha, '', true],
  [previousSha, '5.2.0', false],
  ['', '5.2.0', true],
  ['', '', false],
])('uses the pinned Bot revision before the local override (%s, %s)', (sha, override, expected) => {
  vi.stubEnv('VITE_UPSTREAM_BOT_SHA', sha);
  vi.stubEnv('VITE_UPSTREAM_BOT_CONTRACT', override);

  expect(hasTargetBotContract()).toBe(expected);
});
