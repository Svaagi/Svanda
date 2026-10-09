import { MAIN_CONTENT_ID } from 'constants/nav';
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
import { IntroCanvas } from 'features/intro';
import { Footer, Header, SkipLink } from 'features/shell';
import { PageLayer, StageShell } from 'features/stage';
import { useLocale } from 'i18n';
import { useTranslation } from 'react-i18next';

import styles from './homePage.module.css';

export function HomePage() {
  const { t } = useTranslation();
  const locale = useLocale();

  return (
    <>
      <SkipLink />
      <Header />
      <main
        id={MAIN_CONTENT_ID}
        tabIndex={-1}
        className={styles.main}
        data-testid="home-page"
        data-locale={locale}
      >
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
          <PageLayer
            pageIndex={VENUES_PAGE}
            fadeRate={VENUES_LAYER_FADE_RATE}
          />
          <IntroCanvas />
        </StageShell>
        <section
          id={CONTACT_SECTION_ID}
          className={styles.contact}
          aria-label={t('nav.contact')}
          data-testid="contact-section"
        />
      </main>
      <Footer />
    </>
  );
}
