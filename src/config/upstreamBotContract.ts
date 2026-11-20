const supportedVersions = {
  '0fb7453a1f606c51e4ad92fa155436eb06e04081': '5.2.0',
  '4425f348070800e3bf9fb760f9ec787b8e6c5dc4': '5.2.1',
  '64beb370e6d69b23d3b651f91033f3b72e9e1f56': '5.3.0',
} as const;

// The exact SHA takes precedence over a local test/dev override.
function botVersion() {
  const botSha = import.meta.env.VITE_UPSTREAM_BOT_SHA;
  return botSha
    ? supportedVersions[botSha as keyof typeof supportedVersions]
    : import.meta.env.VITE_UPSTREAM_BOT_CONTRACT;
}

export function hasTargetBotContract(): boolean {
  const version = botVersion();
  return version === '5.2.0' || version === '5.2.1' || version === '5.3.0';
}

export function hasRenewalOperationContract(): boolean {
  const version = botVersion();
  return version === '5.2.1' || version === '5.3.0';
}

export function hasBot53Contract(): boolean {
  return botVersion() === '5.3.0';
}
