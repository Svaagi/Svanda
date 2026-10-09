import {
  CONTACT_SECTION_ID,
  CUSTOM_PAGE,
  HERO_PAGE,
  JUKEBOX_PAGE,
  KARAOKE_PAGE,
  LAYER_PARALLAX_PX,
  VENUES_LAYER_FADE_RATE,
  VENUES_PAGE,
} from 'constants/stage';
import { LanguageSwitch } from 'features/shell';
import { PageLayer, StageShell } from 'features/stage';
import { useLocale } from 'i18n';
import { useTranslation } from 'react-i18next';

import styles from './homePage.module.css';

export function HomePage() {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <main data-testid="home-page" data-locale={locale}>
      <div className={styles.header}>
        <LanguageSwitch />
      </div>
      <StageShell>
        <PageLayer pageIndex={HERO_PAGE}>
          <div className={styles.hero}>
            <h1 data-testid="home-page-title">{t('hero.title')}</h1>
            <p data-testid="home-page-subtitle">{t('hero.subtitle')}</p>
          </div>
        </PageLayer>
        {/* Karaoke copy sits left and drifts in from the right; jukebox mirrors it. */}
        <PageLayer pageIndex={KARAOKE_PAGE} parallaxPx={-LAYER_PARALLAX_PX} />
        <PageLayer pageIndex={JUKEBOX_PAGE} parallaxPx={LAYER_PARALLAX_PX} />
        <PageLayer pageIndex={CUSTOM_PAGE} />
        <PageLayer pageIndex={VENUES_PAGE} fadeRate={VENUES_LAYER_FADE_RATE} />
      </StageShell>
      <section
        id={CONTACT_SECTION_ID}
        className={styles.contact}
        aria-label={t('nav.contact')}
        data-testid="contact-section"
      />
    </main>
  );
}
