const TOP_GAP_PX = 8;

export interface SheetInsetsInput {
  requestedMaxHeight: string;
  topSafeArea: number;
  bottomSafeArea: number;
}

export function sheetInsets(input: SheetInsetsInput): {
  maxHeight: string;
  paddingBottom: string;
} {
  const topClearance =
    input.topSafeArea > 0
      ? `${input.topSafeArea + TOP_GAP_PX}px`
      : `max(${TOP_GAP_PX}px, env(safe-area-inset-top, 0px))`;
  return {
    maxHeight: `min(${input.requestedMaxHeight}, calc(var(--tg-viewport-stable-height, 100dvh) - ${topClearance}))`,
    paddingBottom: `max(env(safe-area-inset-bottom, 0px), ${input.bottomSafeArea}px)`,
  };
}
