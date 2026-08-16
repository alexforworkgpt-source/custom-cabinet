export type UserCabinetOverlay = 'devices' | 'connection' | 'balance' | 'topup' | null;

export interface UserCabinetRouteState {
  overlay: UserCabinetOverlay;
  subscriptionId?: number;
}

const SUBSCRIPTION_PATH = /^\/subscriptions\/(\d+)\/?$/;

function positiveInteger(value: string | null): number | undefined {
  if (!value || !/^\d+$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export function getUserCabinetRouteState(pathname: string, search: string): UserCabinetRouteState {
  const params = new URLSearchParams(search);

  if (pathname === '/' && params.get('overlay') === 'devices') {
    return { overlay: 'devices', subscriptionId: positiveInteger(params.get('sub')) };
  }

  if (pathname === '/connection') {
    return { overlay: 'connection', subscriptionId: positiveInteger(params.get('sub')) };
  }

  if (pathname === '/balance/top-up/result' || pathname.startsWith('/balance/top-up/result/')) {
    return { overlay: null };
  }

  if (pathname === '/balance') {
    return { overlay: 'balance' };
  }

  if (pathname === '/balance/top-up' || pathname.startsWith('/balance/top-up/')) {
    return { overlay: 'topup' };
  }

  const subscriptionMatch = SUBSCRIPTION_PATH.exec(pathname);
  if (subscriptionMatch) {
    return {
      overlay: null,
      subscriptionId: positiveInteger(subscriptionMatch[1]),
    };
  }

  return {
    overlay: null,
    subscriptionId: positiveInteger(params.get('sub')),
  };
}

export function getCabinetClosePath(subscriptionId?: number): string {
  return subscriptionId ? `/?sub=${subscriptionId}` : '/';
}

export function getDirectConnectionBackPath(search: string): string | null {
  const params = new URLSearchParams(search);
  const step = params.get('step');
  if (step === 'success') {
    params.set('step', 'add');
  } else if (step === 'add') {
    params.set('step', 'application');
  } else if (step === 'application') {
    params.set('step', 'platform');
    params.delete('app');
  } else {
    return null;
  }
  const query = params.toString();
  return `/connection${query ? `?${query}` : ''}`;
}

export function getDirectCabinetBackPath(pathname: string, search: string): string | null {
  if (pathname === '/connection') {
    const connectionBackPath = getDirectConnectionBackPath(search);
    if (connectionBackPath) return connectionBackPath;
  }

  const routeState = getUserCabinetRouteState(pathname, search);
  return routeState.overlay ? getCabinetClosePath(routeState.subscriptionId) : null;
}
