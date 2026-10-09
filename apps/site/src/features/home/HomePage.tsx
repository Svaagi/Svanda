import { useLocale } from 'i18n';

export function HomePage() {
  const locale = useLocale();

  return <main data-testid="home-page" data-locale={locale} />;
}
