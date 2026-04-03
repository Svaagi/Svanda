import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import GlassBlob from 'components/GlassBlob';

import styles from './intro.module.css';

const ANIM = {
  xFarLeft:   -260,
  xMidLeft:   -180,
  xFarRight:   260,
  xMidRight:   180,
  xNearRight:  140,
  xExitFarLeft:  -200,
  xExitMidLeft:  -140,
  xExitFarRight:  200,
  xExitMidRight:  140,
  xExitNearRight: 100,
  yDown:   40,
  yExitDown: 28,
  yUp:    -24,
  yExitUp:  -16,
} as const;

const BLOBS = [
  {
    id: 'i-top',
    size: 600,
    height: 520,
    top: '-8%',
    left: '20%',
    color: [
      'radial-gradient(circle at 18% 22%, rgba(255,148,28,0.92) 0%, transparent 36%)',
      'radial-gradient(circle at 76% 34%, rgba(228,60,76,0.88) 0%, transparent 40%)',
      'radial-gradient(circle at 48% 78%, rgba(188,102,162,0.84) 0%, transparent 34%)',
      'rgba(220, 110, 120, 0.20)',
    ].join(', '),
    delay: 0,
    duration: 12,
    borderRadius: '78% 22% 26% 74% / 24% 78% 22% 76%',
    borderRadiusAlt: '24% 76% 76% 24% / 76% 22% 78% 22%',
  },
  {
    id: 'i-bottom',
    size: 580,
    height: 480,
    top: '46%',
    left: 'calc(100% - 560px)',
    color: [
      'radial-gradient(circle at 20% 26%, rgba(182,210,200,0.90) 0%, transparent 36%)',
      'radial-gradient(circle at 72% 52%, rgba(218,95,92,0.88) 0%, transparent 40%)',
      'radial-gradient(circle at 28% 80%, rgba(198,185,212,0.84) 0%, transparent 34%)',
      'rgba(195, 165, 190, 0.18)',
    ].join(', '),
    delay: 0.8,
    duration: 14,
    borderRadius: '24% 76% 74% 26% / 78% 22% 76% 24%',
    borderRadiusAlt: '76% 24% 24% 76% / 22% 78% 24% 76%',
  },
];

const IntroView = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // LEFT SIDE: x must always be <= 0 (enters from left, never crosses center)
  // "SAMO" — exits first
  const x1 = useTransform(scrollYProgress, [0.02, 0.22, 0.71, 0.88], [ANIM.xFarLeft, 0, 0, ANIM.xExitFarLeft]);
  // "KARAOKE" — exits third
  const x3 = useTransform(scrollYProgress, [0.07, 0.28, 0.73, 0.90], [ANIM.xMidLeft, 0, 0, ANIM.xExitMidLeft]);

  // RIGHT SIDE: x must always be >= 0 (enters from right, never crosses center)
  // "OBSLUHA" — exits second
  const x2 = useTransform(scrollYProgress, [0.04, 0.25, 0.72, 0.89], [ANIM.xFarRight, 0, 0, ANIM.xExitFarRight]);
  // "+ JUKEBOX" — exits fourth
  const x4 = useTransform(scrollYProgress, [0.10, 0.32, 0.74, 0.91], [ANIM.xMidRight, 0, 0, ANIM.xExitMidRight]);
  // "18 000+ SKLADIEB" — exits fifth
  const x6 = useTransform(scrollYProgress, [0.18, 0.40, 0.75, 0.92], [ANIM.xNearRight, 0, 0, ANIM.xExitNearRight]);

  // VERTICAL (no horizontal crossing risk)
  // Descriptor — exits last
  const y7 = useTransform(scrollYProgress, [0.24, 0.45, 0.76, 0.93], [ANIM.yDown, 0, 0, ANIM.yExitDown]);
  // Small tag — exits with row 1
  const y0 = useTransform(scrollYProgress, [0.02, 0.20, 0.71, 0.88], [ANIM.yUp, 0, 0, ANIM.yExitUp]);

  const opacity = useTransform(scrollYProgress, [0.01, 0.18, 0.79, 0.95], [0, 1, 1, 0]);

  return (
    <section ref={ref} className={styles.section}>
      <motion.div className={styles.viewport} style={{ opacity }}>

        {/* Blobs span the full viewport via position:absolute — not a grid item */}
        <div className={styles.blobLayer}>
          {BLOBS.map((blob) => <GlassBlob key={blob.id} config={blob} />)}
        </div>

        {/* ── COLUMN 1: Left content ── */}
        <div className={styles.leftCol}>
          {/* Top tag */}
          <motion.div className={styles.tag} style={{ y: y0 }}>
            {t('intro.tag')}
          </motion.div>

          {/* SAMO */}
          <motion.div className={`${styles.word} ${styles.w1}`} style={{ x: x1 }}>
            {t('intro.w1')}
          </motion.div>

          {/* KARAOKE */}
          <motion.div className={`${styles.word} ${styles.w3}`} style={{ x: x3 }}>
            {t('intro.w3')}
          </motion.div>

          {/* Descriptor */}
          <motion.div className={styles.descriptor} style={{ y: y7 }}>
            <p>{t('intro.descriptor1')}</p>
            <div className={styles.pills}>
              <span>{t('intro.pills.karaokeBox')}</span>
              <span>{t('intro.pills.jukebox')}</span>
              <span>{t('intro.pills.events')}</span>
            </div>
          </motion.div>
        </div>

        {/* ── COLUMN 2: Center safe zone — structurally reserved for the karaoke box ── */}
        <div className={styles.centerCol} aria-hidden="true" />

        {/* ── COLUMN 3: Right content ── */}
        <div className={styles.rightCol}>
          {/* OBSLUHA */}
          <motion.div className={`${styles.word} ${styles.w2}`} style={{ x: x2 }}>
            {t('intro.w2')}
          </motion.div>

          {/* + JUKEBOX */}
          <motion.div className={`${styles.word} ${styles.w4}`} style={{ x: x4 }}>
            {t('intro.w4')}
          </motion.div>

          {/* 18 000+ SKLADIEB */}
          <motion.div className={`${styles.word} ${styles.w6}`} style={{ x: x6 }}>
            {t('intro.w6')}
          </motion.div>
        </div>

      </motion.div>
    </section>
  );
};

export default IntroView;
