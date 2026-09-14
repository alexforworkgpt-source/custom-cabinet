import { getFallbackParentPath } from './navigation';
import { getDirectCabinetBackPath } from './userCabinetRouteState';

export interface AdminBackState {
  backTo?: string;
}

function isInternalPath(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('/') && !value.startsWith('//');
}

export function resolveAdminBackTarget(state: unknown, fallback: string): string {
  const target = (state as AdminBackState | null | undefined)?.backTo;
  return isInternalPath(target) ? target : fallback;
}

export function backTo(from: { pathname: string; search?: string }): {
  state: AdminBackState;
} {
  return { state: { backTo: `${from.pathname}${from.search ?? ''}` } };
}

export type NativeBackAction = { kind: 'history' } | { kind: 'replace'; to: string };

export function resolveNativeBackAction(input: {
  depth: number;
  pathname: string;
  search: string;
  state: unknown;
}): NativeBackAction {
  if (input.depth > 0) return { kind: 'history' };

  const source = resolveAdminBackTarget(input.state, '');
  if (source) return { kind: 'replace', to: source };

  const cabinetTarget = getDirectCabinetBackPath(input.pathname, input.search);
  return {
    kind: 'replace',
    to: cabinetTarget ?? getFallbackParentPath(input.pathname),
  };
}
