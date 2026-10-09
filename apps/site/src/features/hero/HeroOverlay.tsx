import { INTRO_HERO_REVEAL_VARS } from 'constants/intro';
import { KARAOKE_PAGE, STAGE_PAGE_IDS } from 'constants/stage';
import {
  useGoToPage,
  useIntroRevealVars,
  usePageLinkClick,
} from 'features/stage';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui';
import { childTestId } from 'utils';

import styles from './heroOverlay.module.css';
import { usePublishHeroTextTop } from './usePublishHeroTextTop';

export type HeroOverlayProps = {
  testId?: string;
};

// Tag and call to action, bottom centre. Revealed by the intro (`--sv-hero`) and gone early
// in the first page turn.
export function HeroOverlay({ testId = 'hero-overlay' }: HeroOverlayProps) {
  const { t } = useTranslation();
  const goToPage = useGoToPage();
  const handleCtaClick = usePageLinkClick(KARAOKE_PAGE, goToPage);
  const overlayRef = useRef<HTMLDivElement>(null);
  usePublishHeroTextTop(overlayRef);
  useIntroRevealVars(overlayRef, INTRO_HERO_REVEAL_VARS);

  return (
    <div ref={overlayRef} className={styles.heroOverlay} data-testid={testId}>
      <p className={styles.tag} data-testid={childTestId(testId, 'tag')}>
        {t('hero.tag')}
      </p>
      <Button asChild testId={childTestId(testId, 'cta')}>
        <a href={`#${STAGE_PAGE_IDS[KARAOKE_PAGE]}`} onClick={handleCtaClick}>
          {t('hero.cta')}
        </a>
      </Button>
    </div>
  );
}
