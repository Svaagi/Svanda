import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import GlassBlob from 'features/hero/components/GlassBlob';
import styles from './lemon.module.css';

const BLOBS = [
  {
    id: 'l-yellow', size: 620, top: '-12%', left: '55%',
    color: [
      'radial-gradient(circle at 34% 28%, rgba(255,255,180,0.28) 0%, transparent 26%)',
      'radial-gradient(circle at 50% 48%, rgba(255,220,0,0.72) 0%, rgba(255,180,0,0.48) 38%, rgba(255,120,0,0.20) 66%, transparent 80%)',
    ].join(', '),
    blur: 6, delay: 0, duration: 10, borderRadius: '54% 46% 48% 52% / 46% 58% 42% 54%',
  },
  {
    id: 'l-rainbow', size: 580, top: '42%', left: '-6%',
    color: [
      'radial-gradient(circle at 20% 30%, rgba(255,80,80,0.55) 0%, transparent 30%)',
      'radial-gradient(circle at 50% 50%, rgba(124,58,237,0.50) 0%, rgba(0,200,255,0.38) 50%, rgba(0,220,120,0.22) 70%, transparent 85%)',
    ].join(', '),
    blur: 7, delay: 1.2, duration: 12, borderRadius: '42% 58% 56% 44% / 58% 42% 60% 40%',
  },
];

const LemonClubView = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

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
      <motion.div className={styles.viewport} style={{ opacity }}>
        <div className={styles.darkBg} />
        <motion.div className={styles.ghost} style={{ x: bgX }}>
          LEMON
        </motion.div>
        <div className={styles.blobLayer}>
          {BLOBS.map((blob) => <GlassBlob key={blob.id} config={blob} />)}
        </div>

        {/* First customer tag — top-right */}
        <motion.div className={styles.firstTag} style={{ y: y3 }}>
          {t('lemon.firstTag')}
        </motion.div>

        {/* Brno, 2024 — top-left under LEMON */}
        <motion.div className={styles.since} style={{ y: y4 }}>
          Brno, 2024
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
            <div className={styles.photoPlaceholder}>
              {/* REPLACE: real photo of vocalist or bar atmosphere */}
              <span className={styles.photoLabel}>Vocalist on stage</span>
              <span className={styles.photoNote}>Replace with real photo</span>
            </div>
          </div>
        </motion.div>

        {/* Right photo column — 2 stacked photos */}
        <motion.div className={styles.photoRight} style={{ y: yPhotosR }}>
          <div className={styles.photo}>
            <div className={styles.photoPlaceholder}>
              {/* REPLACE: real photo */}
              <span className={styles.photoLabel}>Bar crowd</span>
              <span className={styles.photoNote}>Replace with real photo</span>
            </div>
          </div>
          <div className={styles.photo}>
            <div className={styles.photoPlaceholder}>
              {/* REPLACE: real photo */}
              <span className={styles.photoLabel}>Machine in action</span>
              <span className={styles.photoNote}>Replace with real photo</span>
            </div>
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
