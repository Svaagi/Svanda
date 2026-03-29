import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { StepCard } from './components';
import { STEPS } from './constants';
import styles from './howItWorks.module.css';

const HowItWorksView = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const sectionY = useTransform(scrollYProgress, [0, 1], ['0px', '-180px']);
  const titleY = useTransform(scrollYProgress, [0, 0.5], ['60px', '0px']);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  const steps = STEPS.map((step) => ({
    ...step,
    title: t(`howItWorks.steps.${step.translationKey}.title`),
    description: t(`howItWorks.steps.${step.translationKey}.description`),
  }));

  return (
    <motion.section className={styles.howItWorks} id="how-it-works" ref={sectionRef} style={{ y: sectionY }}>
      <div className={styles.sectionMainBg} />

      <div className={styles.backgroundLayer}>
        <div className={styles.blobA} />
        <div className={styles.blobB} />
      </div>

      <div className={styles.backgroundLayerAccent}>
        <div className={styles.blobC} />
      </div>

      <div className={styles.sectionInner}>
        <motion.div
          className={styles.sectionHeader}
          style={{ y: titleY, opacity: titleOpacity }}
        >
          <span className={styles.sectionTag}>{t('howItWorks.tag')}</span>
          <h2 className={styles.sectionTitle}>
            {t('howItWorks.title1')}{' '}
            <span className={styles.titleAccent}>{t('howItWorks.title2')}</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            {t('howItWorks.subtitle')}
          </p>
        </motion.div>

        <div className={styles.stepsGrid}>
          {steps.map((step, index) => (
            <StepCard key={step.id} step={step} index={index} />
          ))}
        </div>

        <motion.div
          className={styles.connectorLine}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </motion.section>
  );
};

export default HowItWorksView;
