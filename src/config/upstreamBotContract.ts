// Opt in only for a build bound to the verified, unchanged target Bot.
// Older Bot versions may ignore new query/body fields instead of rejecting them.
export function hasTargetBotContract(): boolean {
  const botSha = import.meta.env.VITE_UPSTREAM_BOT_SHA;
  if (botSha) return botSha === '0fb7453a1f606c51e4ad92fa155436eb06e04081';
  return import.meta.env.VITE_UPSTREAM_BOT_CONTRACT === '5.2.0';
}
