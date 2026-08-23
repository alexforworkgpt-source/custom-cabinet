import { describe, expect, it } from 'vitest';
import type { NodeInfo } from '@/api/adminRemnawave';
import {
  buildGeoCheckRequest,
  isRouteReady,
  isValidInterfaceName,
  isValidIpAddress,
  suggestedInterfaces,
  suggestedIps,
} from './geoCheckRoute';

function node(overrides: Partial<NodeInfo> = {}): NodeInfo {
  return {
    uuid: 'n-1',
    name: 'Germany #2',
    address: '213.176.77.249',
    is_connected: true,
    is_disabled: false,
    is_node_online: true,
    is_xray_running: true,
    users_online: 10,
    xray_uptime: 0,
    is_traffic_tracking_active: false,
    consumption_multiplier: 1,
    ...overrides,
  };
}

describe('isValidIpAddress', () => {
  it.each([
    '1.2.3.4',
    '213.176.77.249',
    '0.0.0.0',
    '255.255.255.255',
    '2a0b:4141:820:140d::2',
    '::',
    '::1',
    '2001:db8::',
    '2001:0db8:85a3:0000:0000:8a2e:0370:7334',
    '::ffff:192.0.2.128',
  ])('accepts %s', (value) => expect(isValidIpAddress(value)).toBe(true));

  it.each([
    '',
    '   ',
    'not-an-ip',
    '256.1.1.1',
    '1.2.3',
    '1.2.3.4/24',
    '1.2.3.4 ; reboot',
    ':',
    '1:',
    'abcd:',
    ':abcd',
    '1:2:3:4:5:6:7',
    '1:2:3:4:5:6:7:8:9',
    '12345::1',
    '1::2::3',
    '1:::2',
    '192.0.2.1::',
    '::ffff:192.0.2.999',
  ])('rejects %s', (value) => expect(isValidIpAddress(value)).toBe(false));

  it('trims surrounding whitespace', () => {
    expect(isValidIpAddress('  1.2.3.4  ')).toBe(true);
  });
});

describe('isValidInterfaceName', () => {
  it.each(['eth0', 'ens3', 'wg0', 'br-lan', 'enp0s31f6'])('accepts %s', (value) =>
    expect(isValidInterfaceName(value)).toBe(true));

  it.each([
    '',
    'bad iface',
    'eth0;reboot',
    '../etc',
    '-eth0',
    'a'.repeat(33),
  ])('rejects %s', (value) => expect(isValidInterfaceName(value)).toBe(false));
});

describe('isRouteReady', () => {
  it('allows the default route without a value', () => {
    expect(isRouteReady('default', '')).toBe(true);
  });

  it('requires valid values for IP and interface routes', () => {
    expect(isRouteReady('ip', '')).toBe(false);
    expect(isRouteReady('ip', '1.2.3.4')).toBe(true);
    expect(isRouteReady('interface', '')).toBe(false);
    expect(isRouteReady('interface', 'ens3')).toBe(true);
  });
});

describe('buildGeoCheckRequest', () => {
  it('sends an empty body for the default route', () => {
    expect(buildGeoCheckRequest('default', 'ens3')).toEqual({});
  });

  it('sends exactly one trimmed route field', () => {
    expect(buildGeoCheckRequest('ip', ' 1.2.3.4 ')).toEqual({ ip: '1.2.3.4' });
    expect(buildGeoCheckRequest('interface', ' ens3 ')).toEqual({ interface: 'ens3' });
  });
});

describe('route suggestions', () => {
  it('deduplicates node addresses and excludes blocked addresses', () => {
    expect(
      suggestedIps(
        node({
          ips: [
            { ip: '213.176.77.249', status: 'OUTBOUND' },
            { ip: '2a0b:4141:820:140d::2', status: 'INBOUND' },
            { ip: '10.0.0.1', status: 'BLOCKED' },
          ],
        }),
      ),
    ).toEqual(['213.176.77.249', '2a0b:4141:820:140d::2']);
  });

  it('excludes the loopback interface', () => {
    expect(
      suggestedInterfaces(
        node({
          system: {
            info: { networkInterfaces: ['lo', 'ens3', 'wg0'] },
            stats: {},
          } as unknown as NodeInfo['system'],
        }),
      ),
    ).toEqual(['ens3', 'wg0']);
  });
});
