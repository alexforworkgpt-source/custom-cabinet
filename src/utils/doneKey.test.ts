// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { installDoneKey, isSingleLineTextEntry, isTouchOnly, stampEnterKeyHint } from './doneKey';

const tick = () => new Promise((resolve) => setTimeout(resolve, 0));
const pressEnter = (element: Element, init: KeyboardEventInit = {}) =>
  element.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true, ...init }),
  );

afterEach(() => {
  document.body.innerHTML = '';
});

describe('isSingleLineTextEntry', () => {
  it('отделяет однострочные поля от textarea и кнопочных input', () => {
    const text = document.createElement('input');
    const number = document.createElement('input');
    number.type = 'number';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    expect(isSingleLineTextEntry(text)).toBe(true);
    expect(isSingleLineTextEntry(number)).toBe(true);
    expect(isSingleLineTextEntry(checkbox)).toBe(false);
    expect(isSingleLineTextEntry(document.createElement('textarea'))).toBe(false);
  });
});

describe('stampEnterKeyHint', () => {
  it('ставит done только однострочным полям без своей подсказки', () => {
    document.body.innerHTML = `
      <input id="plain" />
      <input id="own" enterkeyhint="go" />
      <input id="check" type="checkbox" />
      <textarea id="multi"></textarea>`;
    stampEnterKeyHint(document.body);
    expect(document.getElementById('plain')?.getAttribute('enterkeyhint')).toBe('done');
    expect(document.getElementById('own')?.getAttribute('enterkeyhint')).toBe('go');
    expect(document.getElementById('check')?.hasAttribute('enterkeyhint')).toBe(false);
    expect(document.getElementById('multi')?.hasAttribute('enterkeyhint')).toBe(false);
  });
});

describe('installDoneKey', () => {
  it('обрабатывает существующие и добавленные позже поля', async () => {
    const stop = installDoneKey({ hideKeyboard: vi.fn() });
    const input = document.createElement('input');
    document.body.append(input);
    await tick();
    expect(input.getAttribute('enterkeyhint')).toBe('done');
    stop();
  });

  it('Enter снимает фокус и просит платформу закрыть клавиатуру', () => {
    const hideKeyboard = vi.fn();
    const stop = installDoneKey({ hideKeyboard });
    const input = document.createElement('input');
    document.body.append(input);
    input.focus();
    pressEnter(input);
    expect(document.activeElement).not.toBe(input);
    expect(hideKeyboard).toHaveBeenCalledOnce();
    stop();
  });

  it('не меняет textarea, IME и уже обработанный Enter', () => {
    const hideKeyboard = vi.fn();
    const stop = installDoneKey({ hideKeyboard });
    const area = document.createElement('textarea');
    const composing = document.createElement('input');
    const handled = document.createElement('input');
    handled.addEventListener('keydown', (event) => event.preventDefault());
    document.body.append(area, composing, handled);

    area.focus();
    pressEnter(area);
    composing.focus();
    pressEnter(composing, { isComposing: true });
    handled.focus();
    pressEnter(handled);

    expect(document.activeElement).toBe(handled);
    expect(hideKeyboard).not.toHaveBeenCalled();
    stop();
  });
});

describe('isTouchOnly', () => {
  it('включает поведение только для coarse pointer без hover', () => {
    expect(
      isTouchOnly((query) => ({ matches: query === '(hover: none) and (pointer: coarse)' })),
    ).toBe(true);
    expect(isTouchOnly(() => ({ matches: false }))).toBe(false);
    expect(isTouchOnly(undefined)).toBe(false);
  });
});
