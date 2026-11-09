import { afterEach, expect, it, vi } from 'vitest';
import { hasTargetBotContract } from './upstreamBotContract';

const releaseSha = '0fb7453a1f606c51e4ad92fa155436eb06e04081';
const previousSha = '5bda3c56f0afd9f4813e9c6fa48934948b05ebae';

afterEach(() => vi.unstubAllEnvs());

it.each([
  [releaseSha, '', true],
  [previousSha, '5.2.0', false],
  ['', '5.2.0', true],
  ['', '', false],
])('uses the pinned Bot revision before the local override (%s, %s)', (sha, override, expected) => {
  vi.stubEnv('VITE_UPSTREAM_BOT_SHA', sha);
  vi.stubEnv('VITE_UPSTREAM_BOT_CONTRACT', override);

  expect(hasTargetBotContract()).toBe(expected);
});
