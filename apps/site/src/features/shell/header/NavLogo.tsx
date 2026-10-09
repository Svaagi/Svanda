import { NAV_HOME_ID, NAV_HOME_PAGE, NAV_LOGO_CELL_PX } from 'constants/nav';
import { usePageLinkClick } from 'features/shell/navLink';
import { PixelLogo } from 'ui';
import { childTestId } from 'utils';

import styles from './header.module.css';

export type NavLogoProps = {
  onNavigate: (page: number) => void;
  testId?: string;
};

// Both cell sizes are rendered and a media query picks one, so the prerendered page already
// paints the right size; reading the viewport in JS would only correct it after hydration.
export function NavLogo({ onNavigate, testId = 'nav-logo' }: NavLogoProps) {
  const handleClick = usePageLinkClick(NAV_HOME_PAGE, onNavigate);

  return (
    <a
      href={`#${NAV_HOME_ID}`}
      className={styles.logo}
      onClick={handleClick}
      data-testid={testId}
    >
      <span className={styles.logoDesktop}>
        <PixelLogo
          cellSize={NAV_LOGO_CELL_PX.desktop}
          testId={childTestId(testId, 'desktop')}
        />
      </span>
      <span className={styles.logoMobile}>
        <PixelLogo
          cellSize={NAV_LOGO_CELL_PX.mobile}
          testId={childTestId(testId, 'mobile')}
        />
      </span>
    </a>
  );
}
