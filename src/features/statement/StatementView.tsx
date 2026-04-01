import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './statement.module.css';

const StatementView = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // "PICK" — top-left, from far left
  const x1 = useTransform(scrollYProgress, [0.02, 0.22, 0.72, 0.94], [-900, 0, 0, 600]);

  // "A" — top-right, outline, from far right
  const x2 = useTransform(scrollYProgress, [0.04, 0.25, 0.72, 0.94], [700, 0, 0, -500]);

  // "SONG." — left column, slides in from left (moved from right)
  const x3 = useTransform(scrollYProgress, [0.07, 0.3, 0.72, 0.94], [-600, 0, 0, -400]);

  // "CHYŤ MIKROFÓN." — row 3, right side, from right
  const x4 = useTransform(scrollYProgress, [0.12, 0.35, 0.72, 0.94], [500, 0, 0, 380]);
  const y4 = useTransform(scrollYProgress, [0.12, 0.35, 0.72, 0.94], [0, 0, 0, 0]);

  // "SING." — bottom, rises from far bottom, exits top
  const y5 = useTransform(scrollYProgress, [0.18, 0.4, 0.72, 0.94], [300, 0, 0, -220]);

  // "ANY BAR. ANY NIGHT. ANY SONG." — lower-right, from right, with rotation
  const x6 = useTransform(scrollYProgress, [0.22, 0.44, 0.72, 0.94], [500, 0, 0, 350]);
  const r6 = useTransform(scrollYProgress, [0.22, 0.44, 0.72, 0.94], [8, 0, 0, -5]);

  // "10 CZK / SONG" tag — top-right corner, from top
  const y0 = useTransform(scrollYProgress, [0.02, 0.2, 0.74, 0.94], [-50, 0, 0, -40]);

  const opacity = useTransform(scrollYProgress, [0.01, 0.17, 0.79, 0.96], [0, 1, 1, 0]);

  return (
    <section ref={ref} className={styles.section}>
      <motion.div className={styles.viewport} style={{ opacity }}>
        {/* Corner tag */}
        <motion.div className={styles.cornerTag} style={{ y: y0 }}>
          {t('statement.cornerTag')}
        </motion.div>

        {/* PICK */}
        <motion.div className={`${styles.word} ${styles.w1}`} style={{ x: x1 }}>
          {t('statement.w1')}
        </motion.div>

        {/* A (outline) */}
        <motion.div className={`${styles.word} ${styles.w2}`} style={{ x: x2 }}>
          {t('statement.w2')}
        </motion.div>

        {/* SONG. */}
        <motion.div className={`${styles.word} ${styles.w3}`} style={{ x: x3 }}>
          {t('statement.w3')}
        </motion.div>

        {/* GRAB THE MIC. */}
        <motion.div className={`${styles.word} ${styles.w4}`} style={{ x: x4, y: y4 }}>
          {t('statement.w4')}
        </motion.div>

        {/* SING. */}
        <motion.div className={`${styles.word} ${styles.w5}`} style={{ y: y5 }}>
          {t('statement.w5')}
        </motion.div>

        {/* ANY BAR. ANY NIGHT. ANY SONG. */}
        <motion.div className={`${styles.word} ${styles.w6}`} style={{ x: x6, rotate: r6 }}>
          {t('statement.w6')}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default StatementView;
