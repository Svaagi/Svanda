import type { Locale } from 'constants/locales';
import { NAV_LOGO_CELL_PX } from 'constants/nav';
import { LanguageSwitch, ThemeToggle } from 'features/shell';
import { getLocalePath, useLocale } from 'i18n';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { PixelLogo } from 'ui';
import { childTestId } from 'utils';

import styles from './legalHeader.module.css';

export type LegalHeaderProps = {
  paths: Readonly<Record<Locale, string>>;
  testId?: string;
};

// The home header pages the scroll stage; a legal page only needs a way home, the language
// switch and the theme toggle.
export function LegalHeader({
  paths,
  testId = 'legal-header',
}: LegalHeaderProps) {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <header className={styles.legalHeader} data-testid={testId}>
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
