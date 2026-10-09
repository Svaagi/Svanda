import {
  type JukeboxSection,
  PIXEL_UI_DEFAULTS,
  type PixelUiConfig,
} from 'constants/jukeboxUi';
import { type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { childTestId } from 'utils';

import { pixelCssVars } from '../appCssVars';
import { AppIcon } from '../appIcon';
import { AppScreen } from '../appScreen';
import { AppSectionToggle } from '../appSectionToggle';
import { AppPaymentModal } from '../payment';
import { useAppContent } from '../useAppContent';
import { PixelHeader } from './PixelHeader';
import styles from './pixelJukeboxUi.module.css';
import { PixelSongList } from './PixelSongList';

export type PixelJukeboxUiProps = {
  section: JukeboxSection;
  config?: PixelUiConfig;
  isPaymentOpen?: boolean;
  background?: ReactNode;
  testId?: string;
};

export function PixelJukeboxUi({
  section,
  config = PIXEL_UI_DEFAULTS[section],
  isPaymentOpen = false,
  background,
  testId = 'pixel-jukebox-ui',
}: PixelJukeboxUiProps) {
  const { t } = useTranslation();
  const content = useAppContent(section);
  const cssVars = useMemo(() => pixelCssVars(config), [config]);

  return (
    <AppScreen
      design="pixel"
      section={section}
      cssVars={cssVars}
      className={styles.pixelJukeboxUi}
      uiClassName={styles.ui}
      background={background}
      overlay={
        isPaymentOpen && (
          <AppPaymentModal
            design="pixel"
            payment={content.payment}
            testId={childTestId(testId, 'payment')}
          />
        )
      }
      testId={testId}
    >
      <PixelHeader
        credit={content.credit}
        currencySymbol={content.currencySymbol}
        testId={testId}
      />
      <AppSectionToggle
        section={section}
        className={styles.toggle}
        optionClassName={styles.toggleOption}
        testId={childTestId(testId, 'toggle')}
      />
      <div
        className={styles.search}
        data-testid={childTestId(testId, 'search')}
      >
        <span className={styles.input}>{t('jukeboxUi.search')}</span>
        <span className={styles.iconButton}>
          <AppIcon name="search" className={styles.searchIcon} />
        </span>
      </div>
      <PixelSongList
        songs={content.songs}
        testId={childTestId(testId, 'song')}
      />
      <div
        className={styles.nowPlaying}
        data-testid={childTestId(testId, 'now-playing')}
      >
        <AppIcon name="note" className={styles.noteIcon} />
        <span className={styles.songTitle}>{content.nowPlaying.label}</span>
        <span className={styles.duration}>{content.nowPlaying.time}</span>
      </div>
    </AppScreen>
  );
}
