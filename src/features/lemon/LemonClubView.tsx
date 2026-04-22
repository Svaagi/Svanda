import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import LavaField from 'components/LavaField';
import { useBlobColors } from 'hooks/useBlobColors';
import crowdPhoto from 'assets/images/lemon/crowd.jpg';
import groupPhoto from 'assets/images/lemon/group.jpg';
import vocalistPhoto from 'assets/images/lemon/vocalist.jpg';
import styles from './lemon.module.css';

const LemonClubView = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const { lemon: lemonColors } = useBlobColors();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // "LEMON" — top-left, from far left (decorative, shorter travel)
  const x1 = useTransform(scrollYProgress, [0.02, 0.22, 0.72, 0.94], [-300, 0, 0, -220]);
  // "MUSIC CLUB" — outline, top-right, from right (shorter travel)
  const x2 = useTransform(scrollYProgress, [0.03, 0.24, 0.72, 0.94], [300, 0, 0, 220]);
  // "FIRST CUSTOMER" tag — drops from top
  const y3 = useTransform(scrollYProgress, [0.05, 0.24, 0.72, 0.94], [-24, 0, 0, -18]);
  // "BRNO, 2024" — rises from bottom
  const y4 = useTransform(scrollYProgress, [0.1, 0.32, 0.72, 0.94], [36, 0, 0, 26]);
  // Left photos — parallax up
  const yPhotosL = useTransform(scrollYProgress, [0, 1], [40, -40]);
  // Right photos — slightly different parallax
  const yPhotosR = useTransform(scrollYProgress, [0, 1], [50, -25]);
  // "25,000+ SONGS PLAYED" — gentle diagonal from bottom-left, stays in left lane
  const x5 = useTransform(scrollYProgress, [0.14, 0.36, 0.72, 0.94], [-180, 0, 0, -130]);
  const y5 = useTransform(scrollYProgress, [0.14, 0.36, 0.72, 0.94], [50, 0, 0, -36]);
  // Detail — from right, shorter travel
  const x6 = useTransform(scrollYProgress, [0.18, 0.4, 0.72, 0.94], [120, 0, 0, 80]);
  const r6 = useTransform(scrollYProgress, [0.18, 0.4, 0.72, 0.94], [3, 0, 0, -2]);
  // Ghost text drift
  const bgX = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  const opacity = useTransform(scrollYProgress, [0.01, 0.18, 0.79, 0.96], [0, 1, 1, 0]);

  return (
    <section ref={ref} className={styles.section} id="lemon">
      <div className={styles.blobLayer}>
        <LavaField id="lemon" colors={[...lemonColors.top, ...lemonColors.bottom]} />
      </div>
      <motion.div className={styles.viewport} style={{ opacity }}>
        <div className={styles.darkBg} />
        <motion.div className={styles.ghost} style={{ x: bgX }}>
          LEMON
        </motion.div>
        {/* First customer tag — top-right */}
        <motion.div className={styles.firstTag} style={{ y: y3 }}>
          {t('lemon.firstTag')}
        </motion.div>

        {/* Brno, 2025 — top-left under LEMON */}
        <motion.div className={styles.since} style={{ y: y4 }}>
          Brno, 2025
        </motion.div>

        {/* LEMON */}
        <motion.div className={`${styles.word} ${styles.w1}`} style={{ x: x1 }}>
          LEMON
        </motion.div>

        {/* MUSIC CLUB */}
        <motion.div className={`${styles.word} ${styles.w2}`} style={{ x: x2 }}>
          MUSIC CLUB
        </motion.div>

        {/* Left photo column — 1 tall photo */}
        <motion.div className={styles.photoLeft} style={{ y: yPhotosL }}>
          <div className={styles.photo}>
            <img src={vocalistPhoto} alt="Vocalist on stage" className={styles.photoImg} />
          </div>
        </motion.div>

        {/* Right photo column — 2 stacked photos */}
        <motion.div className={styles.photoRight} style={{ y: yPhotosR }}>
          <div className={styles.photo}>
            <img src={crowdPhoto} alt="Bar crowd" className={styles.photoImg} />
          </div>
          <div className={styles.photo}>
            <img src={groupPhoto} alt="Group at the bar" className={styles.photoImg} />
          </div>
        </motion.div>

        {/* 25,000+ SONGS PLAYED */}
        <motion.div className={`${styles.word} ${styles.w5}`} style={{ x: x5, y: y5 }}>
          {t('lemon.w5')}
        </motion.div>

        {/* Detail copy */}
        <motion.div className={styles.detail} style={{ x: x6, rotate: r6 }}>
          <p>
            {t('lemon.detail1')}<br />
            {t('lemon.detail2')}
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default LemonClubView;
