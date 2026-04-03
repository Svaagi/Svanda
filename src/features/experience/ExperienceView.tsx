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

  // SVANDA — decorative, enters from left, exits left
  const x1 = useTransform(scrollYProgress, [0.02, 0.22, 0.72, 0.94], [-700, 0, 0, -560]);
  // EXPERIENCE — right lane, enters from right, exits right
  const x2 = useTransform(scrollYProgress, [0.03, 0.24, 0.72, 0.94], [360, 0, 0, 300]);
  // THE FUTURE OF — left lane beside box, slides in from left
  const y3 = useTransform(scrollYProgress, [0.06, 0.28, 0.72, 0.94], [-60, 0, 0, -50]);
  // BAR ENTERTAINMENT — right lane beside box, slides in from right
  const y4 = useTransform(scrollYProgress, [0.1, 0.32, 0.72, 0.94], [80, 0, 0, -60]);
  // SELF-SERVICE. — left lane, slides in from left
  const x5 = useTransform(scrollYProgress, [0.14, 0.36, 0.72, 0.94], [-300, 0, 0, -240]);
  const y5 = useTransform(scrollYProgress, [0.14, 0.36, 0.72, 0.94], [40, 0, 0, -30]);
  // Sub copy — bottom-right, slides from right, slight rotation
  const x6 = useTransform(scrollYProgress, [0.2, 0.42, 0.74, 0.94], [220, 0, 0, 180]);
  const r6 = useTransform(scrollYProgress, [0.2, 0.42, 0.74, 0.94], [3, 0, 0, -2]);
  // Bg title drift
  const bgX = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  // PLAY badge — from top
  const yPlay = useTransform(scrollYProgress, [0.04, 0.22, 0.74, 0.94], [-60, 0, 0, -44]);


  return (
    <section ref={ref} className={styles.section} id="experience">
      <motion.div className={styles.viewport} style={{}}>
        <div className={styles.gradientBg} />
        <div className={styles.circlesA} />
        <div className={styles.circlesB} />
        <div className={styles.grain} />
        <motion.div className={styles.bgTitle} style={{ x: bgX }}>
          EXPERIENCE
        </motion.div>
        {/* PLAY badge */}
        <motion.div className={styles.playBadge} style={{ y: yPlay }}>
          <span>PLAY</span>
        </motion.div>

        {/* SVANDA */}
        <motion.div className={`${styles.word} ${styles.w1}`} style={{ x: x1 }}>
          SVANDA
        </motion.div>

        {/* EXPERIENCE */}
        <motion.div className={`${styles.word} ${styles.w2}`} style={{ x: x2 }}>
          {t('experience.w2')}
        </motion.div>

        {/* THE FUTURE OF */}
        <motion.div className={`${styles.word} ${styles.w3}`} style={{ y: y3 }}>
          {t('experience.w3')}
        </motion.div>

        {/* BAR ENTERTAINMENT */}
        <motion.div className={`${styles.word} ${styles.w4}`} style={{ y: y4 }}>
          {t('experience.w4')}
        </motion.div>

        {/* SELF-SERVICE. */}
        <motion.div className={`${styles.word} ${styles.w5}`} style={{ x: x5, y: y5 }}>
          {t('experience.w5')}
        </motion.div>

        {/* Sub copy + CTA */}
        <motion.div className={styles.sub} style={{ x: x6, rotate: r6 }}>
          <p>
            {t('experience.subDesc1')}<br />
            {t('experience.subDesc2')}
          </p>
          <button className={styles.cta} onClick={() => scrollToSection('contact')}>
            <span className={styles.arrow}>→</span>
            <span className={styles.ctaText}>{t('experience.cta')}</span>
          </button>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ExperienceView;
