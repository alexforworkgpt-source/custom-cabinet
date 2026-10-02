// @vitest-environment jsdom
import { act, cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FortuneWheel from './FortuneWheel';

const prizes = [
  { id: 1, emoji: '🎁', color: '#22C55E' },
  { id: 2, emoji: '📅', color: '#F59E0B' },
  { id: 3, emoji: '💩', color: '#8B5A2B' },
] as never;
const rest = { prizes, isSpinning: false, targetRotation: null, onSpinComplete: () => {} };
const ROTATING = 'svg > g[transform^="rotate("]';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

function follows(later: Element, earlier: Element): boolean {
  return Boolean(earlier.compareDocumentPosition(later) & Node.DOCUMENT_POSITION_FOLLOWING);
}

function pick(container: HTMLElement, selector: string): Element {
  const node = container.querySelector(selector);
  if (!node) throw new Error(`FortuneWheel is missing ${selector}`);
  return node;
}

describe('FortuneWheel rendering layers', () => {
  it('renders the rim and LEDs after the rotating group, then the hub', () => {
    const { container } = render(<FortuneWheel {...rest} />);
    const rotating = pick(container, ROTATING);
    const ring = pick(container, 'circle[stroke="url(#ringGrad)"]');
    const led = pick(container, '.led-dot');
    const hub = pick(container, 'circle[fill="url(#hubGrad)"]');

    expect(follows(ring, rotating)).toBe(true);
    expect(follows(led, rotating)).toBe(true);
    expect(follows(hub, ring)).toBe(true);
    expect(follows(hub, led)).toBe(true);
  });

  it('uses an SVG transform attribute and fill-opacity animation', () => {
    const { container } = render(<FortuneWheel {...rest} />);
    expect(container.querySelectorAll('svg [style*="transform"]').length).toBe(0);
    expect(pick(container, ROTATING).getAttribute('transform')).toBe('rotate(0 200 200)');

    const css = container.querySelector('svg style')?.textContent ?? '';
    expect(css).toMatch(/\.led-glow\s*{[^}]*fill-opacity/);
    expect(css).not.toMatch(/(?<![a-z-])opacity\s*:/);
  });

  it('spins for five seconds and reports completion once', () => {
    vi.useFakeTimers({
      toFake: [
        'setTimeout',
        'clearTimeout',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'performance',
      ],
    });
    const onSpinComplete = vi.fn();
    const { container, rerender } = render(
      <FortuneWheel {...rest} onSpinComplete={onSpinComplete} />,
    );
    rerender(
      <FortuneWheel {...rest} isSpinning targetRotation={90} onSpinComplete={onSpinComplete} />,
    );

    act(() => vi.advanceTimersByTime(2500));
    expect(pick(container, ROTATING).getAttribute('transform')).not.toBe('rotate(0 200 200)');
    expect(onSpinComplete).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(3000));
    expect(onSpinComplete).toHaveBeenCalledTimes(1);
    expect(pick(container, ROTATING).getAttribute('transform')).toBe('rotate(1890 200 200)');
  });
});
