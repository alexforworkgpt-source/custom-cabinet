import { describe, expect, it } from 'vitest';
import { formatAxisTick, formatDecimal, formatGb, formatGbPair } from './formatNumber';

const plain = (value: string) => value.replace(/[\u00A0\u202F]/g, ' ');

describe('formatDecimal', () => {
  it('uses the requested locale for grouping and decimals', () => {
    expect(plain(formatDecimal(3002, 2, 'ru-RU'))).toBe('3 002,00');
    expect(formatDecimal(1234.5, 2, 'en-US')).toBe('1,234.50');
  });
});

describe('formatGb', () => {
  it('keeps small non-zero traffic visible', () => {
    expect(formatGb(0.03, 'ru-RU')).toBe('0,1');
  });

  it('formats a used/limit pair with one unit', () => {
    expect(plain(formatGbPair(870, 1500, 'ГБ', 'ru-RU'))).toBe('870 / 1 500 ГБ');
  });
});

describe('formatAxisTick', () => {
  it('keeps small values readable and compacts large values', () => {
    expect(plain(formatAxisTick(9999, 'ru-RU'))).toBe('9 999');
    expect(plain(formatAxisTick(4_000_000, 'ru-RU'))).toBe('4 млн');
    expect(formatAxisTick(4_000_000, 'en-US')).toBe('4M');
  });

  it('does not render invalid numbers', () => {
    expect(formatAxisTick(Number.NaN, 'ru-RU')).toBe('');
  });
});
