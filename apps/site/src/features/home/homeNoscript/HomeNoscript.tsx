import { LEGAL_IDENTITY } from 'constants/legalIdentity';
import { useTranslation } from 'react-i18next';
import { childTestId } from 'utils';

import styles from './homeNoscript.module.css';

export type HomeNoscriptProps = {
  testId?: string;
};

const PRODUCT_IDS = ['karaoke', 'jukebox'] as const;

// The stage needs JavaScript to show its panels; without it, this carries the page copy.
export function HomeNoscript({ testId = 'home-noscript' }: HomeNoscriptProps) {
  const { t } = useTranslation();

  return (
    <noscript>
      <section className={styles.noscript} data-testid={testId}>
        <p className={styles.notice}>{t('seo.noscript')}</p>
        <p className={styles.body}>{t('hero.subtitle')}</p>
        {PRODUCT_IDS.map((productId) => (
          <div key={productId} data-testid={childTestId(testId, productId)}>
            <h2 className={styles.heading}>{t(`${productId}.title`)}</h2>
            <p className={styles.body}>{t(`${productId}.body`)}</p>
          </div>
        ))}
        <h2 className={styles.heading}>{t('nav.contact')}</h2>
        <p className={styles.body}>
          <a className={styles.link} href={`mailto:${LEGAL_IDENTITY.email}`}>
            {LEGAL_IDENTITY.email}
          </a>
        </p>
      </section>
    </noscript>
  );
}
