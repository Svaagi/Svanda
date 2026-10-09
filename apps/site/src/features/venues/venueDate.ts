import type { Locale } from 'constants/locales';

// ISO dates are calendar days: read and format them in UTC so no time zone shifts the day.
export function formatVenueDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T00:00:00Z`));
}
