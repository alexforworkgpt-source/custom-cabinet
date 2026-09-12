// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/hooks/useHeaderHeight', () => ({
  useHeaderHeight: () => ({
    mobile: 168,
    mobileCss: '168px',
    desktop: 56,
    topSafeArea: 104,
    bottomSafeArea: 34,
    isMobileFullscreen: true,
  }),
}));
vi.mock('@/platform', async () => {
  const actual = await vi.importActual<typeof import('@/platform')>('@/platform');
  return { ...actual, usePlatform: () => ({ haptic: { impact: vi.fn() } }) };
});

import { Sheet, SheetContent, SheetDescription, SheetTitle } from './Sheet';

afterEach(cleanup);

describe('Sheet Telegram geometry', () => {
  it('применяет верхний и нижний safe-area к fullscreen overlay', () => {
    render(
      <Sheet open>
        <SheetContent fullHeight showCloseButton>
          <SheetTitle>Настройки</SheetTitle>
          <SheetDescription>Описание</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    const style = screen.getByRole('dialog').getAttribute('style') ?? '';
    expect(style).toContain(
      'max-height: min(100dvh, calc(var(--tg-viewport-stable-height, 100dvh) - 112px))',
    );
    expect(style).toContain('padding-bottom: max(env(safe-area-inset-bottom, 0px), 34px)');
  });

  it('кнопка закрытия имеет доступное имя и закрывает overlay', () => {
    const onOpenChange = vi.fn();
    render(
      <Sheet open onOpenChange={onOpenChange}>
        <SheetContent showCloseButton>
          <SheetTitle>Настройки</SheetTitle>
          <SheetDescription>Описание</SheetDescription>
        </SheetContent>
      </Sheet>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
