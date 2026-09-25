// @vitest-environment jsdom
import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const theme = {
  setHeaderColor: vi.fn(),
  setBottomBarColor: vi.fn(),
  setBackgroundColor: vi.fn(),
  getThemeParams: () => null,
};
let isDark = true;

vi.mock('@/platform', () => ({
  usePlatform: () => ({ theme, capabilities: { hasThemeSync: true } }),
}));
vi.mock('../hooks/useTheme', () => ({ useTheme: () => ({ isDark }) }));
vi.mock('../api/themeColors', () => ({
  themeColorsQueryOptions: () => ({ queryKey: ['theme-colors'] }),
}));
vi.mock('@tanstack/react-query', () => ({
  useQuery: () => ({
    data: {
      darkBackground: '#0b1f1c',
      darkSurface: '#123456',
      lightBackground: '#f7e7ce',
      lightSurface: '#fef9f0',
    },
  }),
}));

const { ThemeColorsProvider } = await import('./ThemeColorsProvider');

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  isDark = true;
});

describe('ThemeColorsProvider — цвета клиента Telegram', () => {
  it('в тёмной теме фон клиента = тёмный фон страницы, шапка = поверхность', () => {
    render(
      <ThemeColorsProvider>
        <span />
      </ThemeColorsProvider>,
    );
    expect(theme.setBackgroundColor).toHaveBeenLastCalledWith('#0b1f1c');
    expect(theme.setHeaderColor).toHaveBeenLastCalledWith('#123456');
    expect(theme.setBottomBarColor).toHaveBeenLastCalledWith('#123456');
  });

  it('в светлой теме фон клиента = светлый фон страницы', () => {
    isDark = false;
    render(
      <ThemeColorsProvider>
        <span />
      </ThemeColorsProvider>,
    );
    expect(theme.setBackgroundColor).toHaveBeenLastCalledWith('#f7e7ce');
    expect(theme.setHeaderColor).toHaveBeenLastCalledWith('#fef9f0');
  });
});
