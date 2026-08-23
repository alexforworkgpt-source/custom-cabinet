import type { GeoCheckRequest, NodeInfo } from '@/api/adminRemnawave';

export type GeoCheckRouteMode = 'default' | 'ip' | 'interface';

const IPV4_RE = /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/;
const IPV6_GROUP_RE = /^[0-9a-fA-F]{1,4}$/;
const INTERFACE_RE = /^[A-Za-z0-9][A-Za-z0-9_.@-]{0,31}$/;

function isValidIpv6Address(value: string): boolean {
  const halves = value.split('::');
  if (halves.length > 2) return false;

  const groups = halves.flatMap((half) => (half ? half.split(':') : []));
  let groupCount = 0;

  for (const [index, group] of groups.entries()) {
    if (group.includes('.')) {
      if (index !== groups.length - 1 || !value.endsWith(group) || !IPV4_RE.test(group))
        return false;
      groupCount += 2;
    } else {
      if (!IPV6_GROUP_RE.test(group)) return false;
      groupCount += 1;
    }
  }

  return halves.length === 2 ? groupCount < 8 : groupCount === 8;
}

export function isValidIpAddress(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  if (IPV4_RE.test(trimmed)) return true;
  return isValidIpv6Address(trimmed);
}

export function isValidInterfaceName(value: string): boolean {
  return INTERFACE_RE.test(value.trim());
}

export function isRouteReady(mode: GeoCheckRouteMode, value: string): boolean {
  if (mode === 'default') return true;
  if (mode === 'ip') return isValidIpAddress(value);
  return isValidInterfaceName(value);
}

export function buildGeoCheckRequest(mode: GeoCheckRouteMode, value: string): GeoCheckRequest {
  const trimmed = value.trim();
  if (mode === 'ip' && trimmed) return { ip: trimmed };
  if (mode === 'interface' && trimmed) return { interface: trimmed };
  return {};
}

export function suggestedIps(node: NodeInfo): string[] {
  const fromPanel = (node.ips ?? [])
    .filter((entry) => entry.status !== 'BLOCKED')
    .map((entry) => entry.ip);
  return Array.from(new Set([node.address, ...fromPanel].filter(Boolean)));
}

export function suggestedInterfaces(node: NodeInfo): string[] {
  return (node.system?.info?.networkInterfaces ?? []).filter((name) => name !== 'lo');
}
