import { describe, expect, it } from 'vitest';
import { GEOCHECK_MIN_NODE_VERSION, isVersionAtLeast, supportsGeoCheck } from './nodeVersion';

describe('isVersionAtLeast', () => {
  it('compares numeric version segments instead of strings', () => {
    expect(isVersionAtLeast('3.2.9', '3.3.0')).toBe(false);
    expect(isVersionAtLeast('3.3.0', '3.3.0')).toBe(true);
    expect(isVersionAtLeast('3.10.0', '3.3.0')).toBe(true);
    expect(isVersionAtLeast('4.0.0', '3.3.0')).toBe(true);
  });

  it('accepts common node version decorations', () => {
    expect(isVersionAtLeast('v3.3.0', '3.3.0')).toBe(true);
    expect(isVersionAtLeast('3.3.0-rc.1', '3.3.0')).toBe(true);
  });

  it('rejects absent and malformed versions', () => {
    expect(isVersionAtLeast(undefined, '3.3.0')).toBe(false);
    expect(isVersionAtLeast(null, '3.3.0')).toBe(false);
    expect(isVersionAtLeast('unknown', '3.3.0')).toBe(false);
  });
});

describe('supportsGeoCheck', () => {
  it('keeps GeoCheck hidden below the Remnawave node 3.3.0 gate', () => {
    expect(GEOCHECK_MIN_NODE_VERSION).toBe('3.3.0');
    expect(supportsGeoCheck({ node: '2.8' })).toBe(false);
    expect(supportsGeoCheck({ node: '3.2.9' })).toBe(false);
    expect(supportsGeoCheck({ node: '3.3.0' })).toBe(true);
  });

  it('gates on the node version, not the Xray version', () => {
    expect(supportsGeoCheck({ xray: '25.8.3' })).toBe(false);
    expect(supportsGeoCheck(null)).toBe(false);
  });
});
