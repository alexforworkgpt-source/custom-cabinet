import { describe, expect, it } from 'vitest';
import { sheetInsets } from './sheetInsets';

describe('sheetInsets', () => {
  it('ограничивает fullscreen sheet шапкой Telegram и нижним SDK inset', () => {
    expect(
      sheetInsets({ requestedMaxHeight: '100dvh', topSafeArea: 104, bottomSafeArea: 34 }),
    ).toEqual({
      maxHeight: 'min(100dvh, calc(var(--tg-viewport-stable-height, 100dvh) - 112px))',
      paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 34px)',
    });
  });

  it('обычный sheet сохраняет лимит 85vh и browser safe-area', () => {
    expect(sheetInsets({ requestedMaxHeight: '85vh', topSafeArea: 0, bottomSafeArea: 0 })).toEqual({
      maxHeight:
        'min(85vh, calc(var(--tg-viewport-stable-height, 100dvh) - max(8px, env(safe-area-inset-top, 0px))))',
      paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 0px)',
    });
  });
});
