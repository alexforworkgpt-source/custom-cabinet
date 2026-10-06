// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PlatformContext } from '@/platform/PlatformContext';
import { createTelegramAdapter } from '@/platform/adapters/TelegramAdapter';
import { createWebAdapter } from '@/platform/adapters/WebAdapter';
import { WebBackButton } from '@/components/WebBackButton';
import { InfoNavigation } from '@/components/info/InfoNavigation';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

afterEach(cleanup);

describe('Profile exit on web and Telegram', () => {
  it('returns a directly opened web screen to Profile', () => {
    render(
      <PlatformContext.Provider value={createWebAdapter()}>
        <MemoryRouter initialEntries={['/profile/notifications']}>
          <Routes>
            <Route path="/profile/notifications" element={<WebBackButton to="/profile" />} />
            <Route path="/profile" element={<h1>Profile</h1>} />
          </Routes>
        </MemoryRouter>
      </PlatformContext.Provider>,
    );
    fireEvent.click(screen.getByRole('link', { name: 'common.back' }));
    expect(screen.getByRole('heading', { name: 'Profile' })).toBeTruthy();
  });

  it('does not duplicate the native Telegram exit on the Information list', () => {
    render(
      <PlatformContext.Provider value={createTelegramAdapter()}>
        <MemoryRouter initialEntries={['/info']}>
          <InfoNavigation
            sections={[]}
            activeSection="faq"
            showMobileContent={false}
            sectionHref="/info"
            onSelect={() => {}}
            onBack={() => {}}
          >
            <p>Document</p>
          </InfoNavigation>
        </MemoryRouter>
      </PlatformContext.Provider>,
    );
    expect(screen.queryByRole('link', { name: 'common.back' })).toBeNull();
  });
});
