// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useCountdown } from './useCountdown';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('useCountdown', () => {
  it('counts from a deadline and reaches zero', () => {
    const { result } = renderHook(() => useCountdown());

    act(() => result.current[1](3));
    expect(result.current[0]).toBe(3);

    act(() => vi.advanceTimersByTime(1_000));
    expect(result.current[0]).toBe(2);

    act(() => vi.advanceTimersByTime(3_000));
    expect(result.current[0]).toBe(0);
  });

  it('catches up after a background-tab sized timer jump', () => {
    const { result } = renderHook(() => useCountdown());

    act(() => result.current[1](60));
    act(() => vi.advanceTimersByTime(61_000));

    expect(result.current[0]).toBe(0);
  });

  it('restarts and sanitizes invalid durations', () => {
    const { result } = renderHook(() => useCountdown());

    act(() => result.current[1](5));
    act(() => vi.advanceTimersByTime(3_000));
    expect(result.current[0]).toBe(2);

    act(() => result.current[1](5));
    expect(result.current[0]).toBe(5);

    act(() => result.current[1](Number.NaN));
    expect(result.current[0]).toBe(0);
  });
});
