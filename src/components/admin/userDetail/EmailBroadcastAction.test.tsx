// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePermissionStore } from '@/store/permissions';
import { EmailBroadcastAction } from './EmailBroadcastAction';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

function Destination() {
  const location = useLocation();
  return <div>{`${location.search}|${JSON.stringify(location.state)}`}</div>;
}

function renderAction(props: { email: string | null; emailVerified: boolean }) {
  render(
    <MemoryRouter initialEntries={['/admin/users/42']}>
      <Routes>
        <Route path="/admin/users/:id" element={<EmailBroadcastAction userId={42} {...props} />} />
        <Route path="/admin/broadcasts/create" element={<Destination />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('EmailBroadcastAction', () => {
  afterEach(() => {
    cleanup();
    usePermissionStore.setState({ permissions: [], roles: [], roleLevel: 0, isLoaded: true });
  });

  it('opens a direct email broadcast for a confirmed address with broadcasts:send', () => {
    usePermissionStore.setState({ permissions: ['broadcasts:send'] });
    renderAction({ email: 'user@example.com', emailVerified: true });

    fireEvent.click(screen.getByRole('button', { name: 'admin.users.detail.header.writeEmail' }));

    expect(screen.getByText('?email_user=42|{"emailUserLabel":"user@example.com"}')).toBeTruthy();
  });

  it.each([
    ['missing permission', [], 'user@example.com', true],
    ['unconfirmed address', ['broadcasts:send'], 'user@example.com', false],
    ['missing address', ['broadcasts:send'], null, true],
  ])('hides the action for %s', (_case, permissions, email, emailVerified) => {
    usePermissionStore.setState({ permissions });
    renderAction({ email, emailVerified });

    expect(
      screen.queryByRole('button', { name: 'admin.users.detail.header.writeEmail' }),
    ).toBeNull();
  });
});
