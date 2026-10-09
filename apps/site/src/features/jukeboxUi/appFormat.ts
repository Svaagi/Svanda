import { JUKEBOX_UI_CURRENCY } from 'constants/jukeboxUi';
import type { Locale } from 'constants/locales';

const SECONDS_PER_MINUTE = 60;
const SECONDS_DIGITS = 2;
const INITIALS_WORDS = 2;

export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(seconds / SECONDS_PER_MINUTE);
  const paddedSeconds = String(seconds % SECONDS_PER_MINUTE).padStart(
    SECONDS_DIGITS,
    '0',
  );
  return `${minutes}:${paddedSeconds}`;
}

export function songInitials(artist: string): string {
  return artist
    .trim()
    .split(/\s+/)
    .slice(0, INITIALS_WORDS)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
}

const czkFormat = (locale: Locale) =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: JUKEBOX_UI_CURRENCY,
    maximumFractionDigits: 0,
  });

export function formatCzk(amount: number, locale: Locale): string {
  return czkFormat(locale).format(amount);
}

// The currency label the locale writes next to an amount (`Kč` in Czech).
export function czkSymbol(locale: Locale): string {
  return (
    czkFormat(locale)
      .formatToParts(0)
      .find(({ type }) => type === 'currency')?.value ?? JUKEBOX_UI_CURRENCY
  );
}
