import {
  NAV_ITEMS_LEFT,
  NAV_ITEMS_RIGHT,
  NAV_REVEAL_DELAY_OUTER,
} from 'constants/nav';
import { LanguageSwitch } from 'features/shell/languageSwitch';
import { MobileMenu } from 'features/shell/mobileMenu';
import { useGoToPage, useStageStore } from 'features/stage';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui';
import { childTestId } from 'utils';

import styles from './header.module.css';
import { NavItemList } from './NavItemList';
import { NavLogo } from './NavLogo';
import { navRevealStyle } from './navReveal';
import { ThemeToggle } from './ThemeToggle';

const OUTER_REVEAL_STYLE = navRevealStyle(NAV_REVEAL_DELAY_OUTER);

export type HeaderProps = {
  testId?: string;
};

// Slides in with `--sv-nav`, staggers its items with `--sv-menu` and fades the logo and bar
// with `--sv-logo`; all three are CSS variables the intro writes on <html>.
export function Header({ testId = 'header' }: HeaderProps) {
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const activePage = useStageStore((state) => state.page);
  const goToPage = useGoToPage();

  const handleNavigate = useCallback(
    (page: number) => {
      setIsMenuOpen(false);
      goToPage(page);
    },
    [goToPage],
  );

  return (
    <header className={styles.header} data-testid={testId}>
      <nav className={styles.nav} aria-label={t('nav.label')}>
        <div className={`${styles.side} ${styles.left}`}>
          <div className={styles.reveal} style={OUTER_REVEAL_STYLE}>
            <ThemeToggle testId={childTestId(testId, 'theme-toggle')} />
          </div>
          <NavItemList
            items={NAV_ITEMS_LEFT}
            activePage={activePage}
            onNavigate={handleNavigate}
            testId={childTestId(testId, 'items-left')}
          />
        </div>
        <NavLogo
          onNavigate={handleNavigate}
          testId={childTestId(testId, 'logo')}
        />
        <div className={`${styles.side} ${styles.right}`}>
          <NavItemList
            items={NAV_ITEMS_RIGHT}
            activePage={activePage}
            onNavigate={handleNavigate}
            testId={childTestId(testId, 'items-right')}
          />
          <div className={styles.reveal} style={OUTER_REVEAL_STYLE}>
            <div className={styles.languageSwitch}>
              <LanguageSwitch testId={childTestId(testId, 'language-switch')} />
            </div>
            <div className={styles.menuButton}>
              <Button
                variant="pixel"
                aria-expanded={isMenuOpen}
                aria-haspopup="dialog"
                onClick={() => setIsMenuOpen(true)}
                testId={childTestId(testId, 'menu-button')}
              >
                {t('nav.menu')}
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <MobileMenu
        open={isMenuOpen}
        onOpenChange={setIsMenuOpen}
        activePage={activePage}
        onNavigate={handleNavigate}
      />
    </header>
  );
}
