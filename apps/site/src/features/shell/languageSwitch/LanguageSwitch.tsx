import { type Locale, LOCALES } from 'constants/locales';
import { getLocalePath, rememberLocale, useLocale } from 'i18n';
import type { MouseEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router';
import { isPlainLeftClick } from 'utils';

import styles from './languageSwitch.module.css';

export function LanguageSwitch() {
  const { t } = useTranslation();
  const activeLocale = useLocale();
  const navigate = useNavigate();

  const handleSelect = (
    event: MouseEvent<HTMLAnchorElement>,
    locale: Locale,
  ) => {
    rememberLocale(locale);
    if (!isPlainLeftClick(event)) return;

    event.preventDefault();
    if (locale === activeLocale) return;
    // The hash is read at click time, not rendered into the href: prerendered links cannot
    // know it, and the current section may have changed since the last render.
    // Navigation errors surface through the router; nothing here awaits the result.
    void navigate({
      pathname: getLocalePath(locale),
      hash: window.location.hash,
    });
  };

  return (
    <nav
      className={styles.languageSwitch}
      aria-label={t('language.label')}
      data-testid="language-switch"
    >
      {LOCALES.map((locale) => (
        <Link
          key={locale}
          to={getLocalePath(locale)}
          className={styles.option}
          lang={locale}
          hrefLang={locale}
          title={t(`language.${locale}.name`)}
          aria-current={locale === activeLocale ? 'page' : undefined}
          onClick={(event) => handleSelect(event, locale)}
          data-testid={`language-switch-${locale}`}
        >
          {t(`language.${locale}.short`)}
        </Link>
      ))}
    </nav>
  );
}
