import type { Locale } from 'constants/locales';
import { NAV_LOGO_CELL_PX } from 'constants/nav';
import { getLocalePath, useLocale } from 'i18n';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { PixelLogo } from 'ui';
import { childTestId } from 'utils';

import { ThemeToggle } from '../header';
import { LanguageSwitch } from '../languageSwitch';
import styles from './subpageHeader.module.css';

export type SubpageHeaderProps = {
  paths: Readonly<Record<Locale, string>>;
  testId?: string;
};

// The home header pages the scroll stage; a subpage only needs a way home, the language
// switch and the theme toggle.
export function SubpageHeader({
  paths,
  testId = 'subpage-header',
}: SubpageHeaderProps) {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <header className={styles.subpageHeader} data-testid={testId}>
      <Link
        to={getLocalePath(locale)}
        className={styles.home}
        aria-label={t('legal.homeLink')}
        data-testid={childTestId(testId, 'home')}
      >
        <PixelLogo
          cellSize={NAV_LOGO_CELL_PX.mobile}
          testId={childTestId(testId, 'logo')}
        />
      </Link>
      <div className={styles.controls}>
        <LanguageSwitch
          paths={paths}
          testId={childTestId(testId, 'language-switch')}
        />
        <ThemeToggle testId={childTestId(testId, 'theme-toggle')} />
      </div>
    </header>
  );
}
