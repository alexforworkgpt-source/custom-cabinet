const EXCLUDED_FEATURE_KEYS = /^(?:dpichecker|bschek|reachability)(?:$|[_:])/iu;

// This policy only filters display definitions; authorization data stays unchanged.
export function isCabinetFeatureVisible(key: string): boolean {
  return !EXCLUDED_FEATURE_KEYS.test(key);
}
