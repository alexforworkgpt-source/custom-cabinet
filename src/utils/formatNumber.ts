import { uiLocale } from './uiLocale';

export function formatDecimal(
  value: number,
  decimals: number,
  locale: string = uiLocale(),
): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

const MIN_VISIBLE_GB = 0.1;

export function formatGb(value: number, locale: string = uiLocale()): string {
  const shown = value > 0 && value < MIN_VISIBLE_GB ? MIN_VISIBLE_GB : value;
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(shown);
}

export function formatGbPair(
  usedGb: number,
  limitGb: number,
  unit: string,
  locale: string = uiLocale(),
): string {
  return `${formatGb(usedGb, locale)} / ${formatGb(limitGb, locale)} ${unit}`;
}

const AXIS_COMPACT_FROM = 10_000;

export function formatAxisTick(value: number, locale: string = uiLocale()): string {
  if (!Number.isFinite(value)) return '';
  if (Math.abs(value) < AXIS_COMPACT_FROM) {
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
  }
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}
