import {
  GLASS_UI_DEFAULTS,
  type GlassUiConfig,
  type JukeboxSection,
} from 'constants/jukeboxUi';
import { type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { childTestId, classNames } from 'utils';

import { glassCssVars } from '../appCssVars';
import { AppIcon } from '../appIcon';
import { AppScreen } from '../appScreen';
import { AppSectionToggle } from '../appSectionToggle';
import { AppPaymentModal } from '../payment';
import { useAppContent } from '../useAppContent';
import styles from './glassJukeboxUi.module.css';
import { GlassSongList } from './GlassSongList';

export type GlassJukeboxUiProps = {
  section: JukeboxSection;
  config?: GlassUiConfig;
  isPaymentOpen?: boolean;
  background?: ReactNode;
  testId?: string;
};

export function GlassJukeboxUi({
  section,
  config = GLASS_UI_DEFAULTS[section],
  isPaymentOpen = false,
  background,
  testId = 'glass-jukebox-ui',
}: GlassJukeboxUiProps) {
  const { t } = useTranslation();
  const content = useAppContent(section);
  const cssVars = useMemo(() => glassCssVars(config), [config]);
  const { nowPlaying } = content;

  return (
    <AppScreen
      design="glass"
      section={section}
      cssVars={cssVars}
      className={styles.glassJukeboxUi}
      uiClassName={styles.ui}
      background={background}
      overlay={
        isPaymentOpen && (
          <AppPaymentModal
            design="glass"
            payment={content.payment}
            testId={childTestId(testId, 'payment')}
          />
        )
      }
      testId={testId}
    >
      <div className={styles.balanceRow}>
        <div
          className={classNames(styles.glass, styles.balance)}
          data-testid={childTestId(testId, 'credit')}
        >
          <span>
            {content.credit}
            <span className={styles.currency}>{content.currencySymbol}</span>
          </span>
          <span className={classNames(styles.glass, styles.plus)}>
            <AppIcon name="plus" className={styles.plusIcon} />
          </span>
        </div>
      </div>
      <AppSectionToggle
        section={section}
        className={styles.toggle}
        optionClassName={classNames(styles.glass, styles.toggleOption)}
        testId={childTestId(testId, 'toggle')}
      />
      <div
        className={styles.search}
        data-testid={childTestId(testId, 'search')}
      >
        <span className={classNames(styles.glass, styles.input)}>
          <span>{t('jukeboxUi.search')}</span>
          <AppIcon name="search" className={styles.searchIcon} />
        </span>
        <span className={classNames(styles.glass, styles.queue)}>
          {t('jukeboxUi.queue')}
        </span>
      </div>
      <GlassSongList
        songs={content.songs}
        testId={childTestId(testId, 'song')}
      />
      <div
        className={styles.nowPlaying}
        data-testid={childTestId(testId, 'now-playing')}
      >
        <span className={styles.thumb}>{nowPlaying.initials}</span>
        <span className={styles.songTitle}>{nowPlaying.label}</span>
        <span className={styles.duration}>{nowPlaying.time}</span>
      </div>
    </AppScreen>
  );
}
