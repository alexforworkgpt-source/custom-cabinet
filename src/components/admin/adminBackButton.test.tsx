// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Link, MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/platform', async () => {
  const actual = await vi.importActual<typeof import('@/platform')>('@/platform');
  return { ...actual, usePlatform: () => ({ platform: 'web' }) };
});

const { AdminBackButton, backTo, resolveAdminBackTarget } = await import('./AdminBackButton');

afterEach(cleanup);

describe('resolveAdminBackTarget', () => {
  it('возвращает фактический внутренний экран-источник', () => {
    expect(resolveAdminBackTarget({ backTo: '/admin/payments?page=3' }, '/admin/users')).toBe(
      '/admin/payments?page=3',
    );
  });

  it('использует объявленного родителя для прямого входа и внешнего адреса', () => {
    expect(resolveAdminBackTarget(undefined, '/admin/users')).toBe('/admin/users');
    for (const value of ['//example.test', 'https://example.test', 'javascript:alert(1)']) {
      expect(resolveAdminBackTarget({ backTo: value }, '/admin/users')).toBe('/admin/users');
    }
  });
});

describe('backTo', () => {
  it('сохраняет pathname и query фактического источника', () => {
    expect(backTo({ pathname: '/admin/payments', search: '?page=3' })).toEqual({
      state: { backTo: '/admin/payments?page=3' },
    });
  });
});

describe('переход и возврат', () => {
  function Entrance() {
    const location = useLocation();
    return (
      <Link to="/admin/users/7" {...backTo(location)}>
        открыть
      </Link>
    );
  }

  it('кнопка ведёт на открывший экран, а не на запасного родителя', () => {
    render(
      <MemoryRouter initialEntries={['/admin/payments?page=3']}>
        <Routes>
          <Route path="/admin/users/:id" element={<AdminBackButton to="/admin/users" />} />
          <Route path="*" element={<Entrance />} />
        </Routes>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText('открыть'));
    expect(screen.getByRole('link', { name: 'common.back' }).getAttribute('href')).toBe(
      '/admin/payments?page=3',
    );
  });
});
