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

  // "SVANDA" — top-left, from far left
  const x1 = useTransform(scrollYProgress, [0.02, 0.22, 0.72, 0.94], [-900, 0, 0, -700]);
  // "EXPERIENCE" — outline, from far right
  const x2 = useTransform(scrollYProgress, [0.03, 0.24, 0.72, 0.94], [900, 0, 0, 700]);
  // "THE FUTURE OF" — drops from top, in front
  const y3 = useTransform(scrollYProgress, [0.06, 0.28, 0.72, 0.94], [-150, 0, 0, -110]);
  // "BAR ENTERTAINMENT" — rises from bottom
  const y4 = useTransform(scrollYProgress, [0.1, 0.32, 0.72, 0.94], [200, 0, 0, -150]);
  // "SELF-SERVICE." — diagonal from bottom-left
  const x5 = useTransform(scrollYProgress, [0.14, 0.36, 0.72, 0.94], [-500, 0, 0, -350]);
  const y5 = useTransform(scrollYProgress, [0.14, 0.36, 0.72, 0.94], [120, 0, 0, -90]);
  // Sub copy — from right with rotation
  const x6 = useTransform(scrollYProgress, [0.2, 0.42, 0.74, 0.94], [300, 0, 0, 220]);
  const r6 = useTransform(scrollYProgress, [0.2, 0.42, 0.74, 0.94], [6, 0, 0, -4]);
  // Bg title drift
  const bgX = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  // PLAY badge — from top
  const yPlay = useTransform(scrollYProgress, [0.04, 0.22, 0.74, 0.94], [-60, 0, 0, -44]);

  const opacity = useTransform(scrollYProgress, [0.01, 0.18, 0.79, 0.96], [0, 1, 1, 0]);

  return (
    <section ref={ref} className={styles.section} id="experience">
      {/* Animated gradient bg — covers the 3D box */}
      <div className={styles.gradientBg} />

      {/* Concentric circles — two layers cross-fading for continuous outward movement */}
      <div className={styles.circlesA} />
      <div className={styles.circlesB} />
      {/* Film grain — physical texture quality */}
      <div className={styles.grain} />

      <motion.div className={styles.bgTitle} style={{ x: bgX }}>
        EXPERIENCE
      </motion.div>

      <motion.div className={styles.viewport} style={{ opacity }}>
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
