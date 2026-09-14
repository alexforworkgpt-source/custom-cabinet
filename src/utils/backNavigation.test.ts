import { describe, expect, it } from 'vitest';
import { backTo, resolveAdminBackTarget, resolveNativeBackAction } from './backNavigation';

describe('resolveNativeBackAction', () => {
  it('использует реальную history при обычном переходе внутри приложения', () => {
    expect(
      resolveNativeBackAction({ depth: 2, pathname: '/admin/users/7', search: '', state: null }),
    ).toEqual({ kind: 'history' });
  });

  it('после reload сохраняет записанный экран-источник', () => {
    expect(
      resolveNativeBackAction({
        depth: 0,
        pathname: '/admin/users/7',
        search: '',
        state: { backTo: '/admin/payments?page=3' },
      }),
    ).toEqual({ kind: 'replace', to: '/admin/payments?page=3' });
  });

  it('при прямом входе без state возвращает в маршрут-родитель', () => {
    expect(
      resolveNativeBackAction({ depth: 0, pathname: '/admin/users/7', search: '', state: null }),
    ).toEqual({ kind: 'replace', to: '/admin/users' });
  });
});

describe('shared source contract', () => {
  it('строит и безопасно читает внутренний источник', () => {
    const source = backTo({ pathname: '/admin/payments', search: '?page=3' });
    expect(resolveAdminBackTarget(source.state, '/admin')).toBe('/admin/payments?page=3');
    expect(resolveAdminBackTarget({ backTo: '//example.test' }, '/admin')).toBe('/admin');
  });
});
