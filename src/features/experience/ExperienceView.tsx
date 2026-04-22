import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { scrollToSection } from 'utils';
import styles from './experience.module.css';

const ExperienceView = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  const bgX = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const leftY = useTransform(scrollYProgress, [0.08, 0.3, 0.7, 0.94], [60, 0, 0, -40]);
  const leftOpacity = useTransform(scrollYProgress, [0.05, 0.22, 0.78, 0.94], [0, 1, 1, 0]);
  const rightY = useTransform(scrollYProgress, [0.12, 0.34, 0.7, 0.94], [60, 0, 0, -40]);
  const rightOpacity = useTransform(scrollYProgress, [0.08, 0.26, 0.78, 0.94], [0, 1, 1, 0]);
  const yPlay = useTransform(scrollYProgress, [0.04, 0.22, 0.74, 0.94], [-60, 0, 0, -44]);

  return (
    <section ref={ref} className={styles.section} id="experience">
      <motion.div className={styles.viewport}>
        <div className={styles.gradientBg} />
        <div className={styles.circlesA} />
        <div className={styles.circlesB} />
        <div className={styles.grain} />

        <motion.div className={styles.bgTitle} style={{ x: bgX }}>
          SVANDA
        </motion.div>

        <motion.div className={styles.playBadge} style={{ y: yPlay }}>
          <span>PLAY</span>
        </motion.div>

        <motion.div
          className={styles.contentLeft}
          style={{ y: leftY, opacity: leftOpacity }}
        >
          <span className={styles.tag}>{t('experience.tag')}</span>

          <h2 className={styles.title}>
            <span className={styles.titleLine}>{t('experience.title1')}</span>
            <span className={`${styles.titleLine} ${styles.titleAccent}`}>
              {t('experience.title2')}
            </span>
          </h2>

          <div className={styles.body}>
            <p>{t('experience.body1')}</p>
            <p>{t('experience.body2')}</p>
          </div>
        </motion.div>

        <motion.div
          className={styles.contentRight}
          style={{ y: rightY, opacity: rightOpacity }}
        >
          <div className={styles.pills}>
            <span className={styles.pill}>{t('experience.pill1')}</span>
            <span className={styles.pill}>{t('experience.pill2')}</span>
            <span className={styles.pill}>{t('experience.pill3')}</span>
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNum}>5 000+</span>
              <span className={styles.statLabel}>{t('hero.stat1Label')}</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>10 Kč</span>
              <span className={styles.statLabel}>{t('hero.stat2Label')}</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <span className={styles.statNum}>24/7</span>
              <span className={styles.statLabel}>{t('hero.stat3Label')}</span>
            </div>
          </div>

          <button className={styles.cta} onClick={() => scrollToSection('contact')}>
            <span className={styles.ctaText}>{t('experience.cta')}</span>
            <span className={styles.arrow}>→</span>
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ExperienceView;
