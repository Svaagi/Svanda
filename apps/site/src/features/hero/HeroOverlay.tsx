import { KARAOKE_PAGE, STAGE_PAGE_IDS } from 'constants/stage';
import { useGoToPage, usePageLinkClick } from 'features/stage';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui';
import { childTestId } from 'utils';

import styles from './heroOverlay.module.css';

export type HeroOverlayProps = {
  testId?: string;
};

// Tag and call to action, bottom centre. Revealed by the intro (`--sv-hero`) and gone early
// in the first page turn.
export function HeroOverlay({ testId = 'hero-overlay' }: HeroOverlayProps) {
  const { t } = useTranslation();
  const goToPage = useGoToPage();
  const handleCtaClick = usePageLinkClick(KARAOKE_PAGE, goToPage);

  return (
    <div className={styles.heroOverlay} data-testid={testId}>
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
