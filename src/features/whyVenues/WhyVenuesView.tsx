import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { BenefitItem } from './components';
import { BENEFITS } from './constants';
import styles from './whyVenues.module.css';

const WhyVenuesView = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const sectionY = useTransform(scrollYProgress, [0, 1], ['0px', '-360px']);
  const titleY = useTransform(scrollYProgress, [0, 0.5], ['60px', '0px']);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  const benefits = BENEFITS.map((benefit) => ({
    ...benefit,
    title: t(`whyVenues.benefits.${benefit.translationKey}.title`),
    description: t(`whyVenues.benefits.${benefit.translationKey}.description`),
  }));

  return (
    <motion.section className={styles.whyVenues} id="why-venues" ref={sectionRef} style={{ y: sectionY }}>
      <div className={styles.sectionMainBg} />

      <div className={styles.background}>
        <div className={styles.blobA} />
        <div className={styles.blobB} />
      </div>

      <div className={styles.backgroundAccent}>
        <div className={styles.blobC} />
      </div>

      <div className={styles.sectionInner}>
        <motion.div
          className={styles.sectionHeader}
          style={{ y: titleY, opacity: titleOpacity }}
        >
          <span className={styles.sectionTag}>{t('whyVenues.tag')}</span>
          <h2 className={styles.sectionTitle}>
            {t('whyVenues.title1')}
            <br />
            <span className={styles.titleAccent}>{t('whyVenues.title2')}</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            {t('whyVenues.subtitle')}
          </p>
        </motion.div>

        <div className={styles.benefitsGrid}>
          {benefits.map((benefit, index) => (
            <BenefitItem key={benefit.id} benefit={benefit} index={index} />
          ))}
        </div>
      </div>
    </motion.section>
  );
};

export default WhyVenuesView;
