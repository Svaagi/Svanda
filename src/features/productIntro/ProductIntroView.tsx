import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { FeatureCard } from './components';
import { FEATURE_CARDS } from './constants';
import styles from './productIntro.module.css';

const ProductIntroView = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const titleY = useTransform(scrollYProgress, [0, 0.5], ['60px', '0px']);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  const cards = FEATURE_CARDS.map((card) => ({
    ...card,
    title: t(`productIntro.features.${card.translationKey}.title`),
    description: t(`productIntro.features.${card.translationKey}.description`),
  }));

  return (
    <motion.section className={styles.productIntro} id="product" ref={sectionRef} style={{}}>
      <div className={styles.sectionMainBg} />

      <div className={styles.backgroundBlobs}>
        <div className={styles.blobA} />
        <div className={styles.blobB} />
      </div>

      <div className={styles.backgroundBlobsAccent}>
        <div className={styles.blobC} />
      </div>

      <div className={styles.sectionInner}>
        <motion.div
          className={styles.sectionHeader}
          style={{ y: titleY, opacity: titleOpacity }}
        >
          <span className={styles.sectionTag}>{t('productIntro.tag')}</span>
          <h2 className={styles.sectionTitle}>
            {t('productIntro.title1')}
            <br />
            <span className={styles.titleAccent}>{t('productIntro.title2')}</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            {t('productIntro.subtitle')}
          </p>
        </motion.div>

        <div className={styles.featureGrid}>
          {cards.map((card, index) => (
            <FeatureCard key={card.id} card={card} index={index} isWide={index === 0 || index === 3} />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default ProductIntroView;
