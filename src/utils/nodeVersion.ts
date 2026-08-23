export const GEOCHECK_MIN_NODE_VERSION = '3.3.0';

function parseVersion(value: string): [number, number, number] | null {
  const match = /^\s*v?(\d+)(?:\.(\d+))?(?:\.(\d+))?/.exec(value);
  if (!match) return null;
  return [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)];
}

export function isVersionAtLeast(value: string | null | undefined, minimum: string): boolean {
  if (!value) return false;

  const parsed = parseVersion(value);
  const floor = parseVersion(minimum);
  if (!parsed || !floor) return false;

  for (let i = 0; i < 3; i += 1) {
    if (parsed[i] !== floor[i]) return parsed[i] > floor[i];
  }
  return true;
}

export function supportsGeoCheck(
  versions: { node?: string; xray?: string } | null | undefined,
): boolean {
  return isVersionAtLeast(versions?.node, GEOCHECK_MIN_NODE_VERSION);
}
