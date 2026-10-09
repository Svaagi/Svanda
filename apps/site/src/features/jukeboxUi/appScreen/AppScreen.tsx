import type { JukeboxSection, JukeboxUiDesign } from 'constants/jukeboxUi';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { childTestId, classNames } from 'utils';

import { type AppCssVars, toStyle } from '../appCssVars';
import styles from './appScreen.module.css';

export type AppScreenProps = {
  design: JukeboxUiDesign;
  section: JukeboxSection;
  cssVars: AppCssVars;
  // Design styles for the screen and for the UI layer (spacing, font).
  className?: string;
  uiClassName?: string;
  // Drawn behind the UI (the lava lamp); the screen shows its base colour without one.
  background?: ReactNode;
  overlay?: ReactNode;
  children: ReactNode;
  testId: string;
};

// The 540 x 960 app screen both designs share. It scales with its width: every length
// inside is a multiple of `--u`, one design pixel.
export function AppScreen({
  design,
  section,
  cssVars,
  className,
  uiClassName,
  background,
  overlay,
  children,
  testId,
}: AppScreenProps) {
  const { t } = useTranslation();

  return (
    <div
      className={classNames(styles.appScreen, className)}
      style={toStyle(cssVars)}
      role="img"
      aria-label={t('jukeboxUi.label')}
      data-design={design}
      data-section={section}
      data-testid={testId}
    >
      {background && (
        <div
          className={styles.background}
          data-testid={childTestId(testId, 'background')}
        >
          {background}
        </div>
      )}
      <div className={classNames(styles.ui, uiClassName)}>{children}</div>
      {overlay}
    </div>
  );
}
