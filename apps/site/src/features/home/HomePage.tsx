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
import { HeroBackground, HeroOverlay } from 'features/hero';
import { IntroCanvas } from 'features/intro';
import { JukeboxStage, ProjectedScreen } from 'features/jukebox3d';
import { PixelJukeboxUi } from 'features/jukeboxUi';
import { ProductPanel, usePageAccent } from 'features/products';
import { Footer, Header, SkipLink } from 'features/shell';
import { PageLayer, StageShell } from 'features/stage';
import { useLocale } from 'i18n';
import { useTranslation } from 'react-i18next';
import { VisuallyHidden } from 'ui';

import styles from './homePage.module.css';

export function HomePage() {
  const { t } = useTranslation();
  const locale = useLocale();
  usePageAccent();

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
          <HeroBackground />
          <JukeboxStage />
          <PageLayer pageIndex={HERO_PAGE}>
            {/* The design shows no hero heading: the page h1 is for crawlers and readers. */}
            <h1 data-testid="home-page-title">
              <VisuallyHidden>{t('hero.heading')}</VisuallyHidden>
            </h1>
            <p data-testid="home-page-subtitle">
              <VisuallyHidden>{t('hero.subtitle')}</VisuallyHidden>
            </p>
            <HeroOverlay />
          </PageLayer>
          {/* Karaoke copy sits left and drifts in from the right; jukebox mirrors it. */}
          <PageLayer pageIndex={KARAOKE_PAGE} parallaxPx={-LAYER_PARALLAX_PX}>
            <ProductPanel productId="karaoke" />
          </PageLayer>
          <PageLayer pageIndex={JUKEBOX_PAGE} parallaxPx={LAYER_PARALLAX_PX}>
            <ProductPanel productId="jukebox" />
          </PageLayer>
          <PageLayer pageIndex={CUSTOM_PAGE} />
          <PageLayer
            pageIndex={VENUES_PAGE}
            fadeRate={VENUES_LAYER_FADE_RATE}
          />
          <ProjectedScreen>
            {({ mode }) => <PixelJukeboxUi section={mode} />}
          </ProjectedScreen>
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
