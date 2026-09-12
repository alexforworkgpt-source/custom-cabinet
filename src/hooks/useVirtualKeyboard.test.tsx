// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { isTextEntry, resetVirtualKeyboard, useVirtualKeyboard } from './useVirtualKeyboard';

const focusIn = (element: Element) =>
  element.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
const focusOut = (element: Element, relatedTarget: Element | null) =>
  element.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget }));

afterEach(() => {
  cleanup();
  resetVirtualKeyboard();
  document.body.innerHTML = '';
});

describe('isTextEntry', () => {
  it('распознаёт поля ввода и редактируемый текст', () => {
    const editable = document.createElement('div');
    Object.defineProperty(editable, 'isContentEditable', { value: true });
    expect(isTextEntry(document.createElement('input'))).toBe(true);
    expect(isTextEntry(document.createElement('textarea'))).toBe(true);
    expect(isTextEntry(editable)).toBe(true);
    expect(isTextEntry(document.createElement('button'))).toBe(false);
    expect(isTextEntry(null)).toBe(false);
  });
});

describe('useVirtualKeyboard', () => {
  it('остаётся открытой при переходе между полями и закрывается на кнопке', () => {
    const input = document.createElement('input');
    const area = document.createElement('textarea');
    const button = document.createElement('button');
    document.body.append(input, area, button);
    const { result } = renderHook(() => useVirtualKeyboard());

    act(() => void focusIn(input));
    expect(result.current).toBe(true);
    act(() => void focusOut(input, area));
    expect(result.current).toBe(true);
    act(() => void focusOut(area, button));
    expect(result.current).toBe(false);
  });

  it('сбрасывается при смене экрана даже без blur', () => {
    const input = document.createElement('input');
    document.body.append(input);
    const { result } = renderHook(() => useVirtualKeyboard());

    act(() => void focusIn(input));
    expect(result.current).toBe(true);
    act(() => resetVirtualKeyboard());
    expect(result.current).toBe(false);
  });
});
