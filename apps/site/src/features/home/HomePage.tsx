import { LanguageSwitch } from 'features/shell';
import { useLocale } from 'i18n';
import { useTranslation } from 'react-i18next';

export function HomePage() {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <main data-testid="home-page" data-locale={locale}>
      <LanguageSwitch />
      <h1 data-testid="home-page-title">{t('hero.title')}</h1>
      <p data-testid="home-page-subtitle">{t('hero.subtitle')}</p>
    </main>
  );
}
