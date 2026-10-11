import type { Locale } from 'constants/locales';

import type { RangeFormat } from '../model';

const PERCENT_SCALE = 100;
const MULTIPLIER_DECIMALS = 1;

const numberFormat = (locale: Locale, fractionDigits: number) =>
  new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });

// The number a range shows for its value, in the locale's digits: 0.425 as `43` (percent),
// 1.5 as `1.5` or `1,5` (multiplier), 12 as `12` (px). The unit comes from the copy.
export function formatRangeNumber(
  value: number,
  format: RangeFormat,
  locale: Locale,
): string {
  if (format === 'percent') {
    return numberFormat(locale, 0).format(Math.round(value * PERCENT_SCALE));
  }
  if (format === 'multiplier') {
    return numberFormat(locale, MULTIPLIER_DECIMALS).format(value);
  }
  return numberFormat(locale, 0).format(value);
}
