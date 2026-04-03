import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import GlassBlob from 'components/GlassBlob';
import styles from './benefits.module.css';

const PANEL_SLIDE_START = 0.7;

// Animation travel distances (px). Negative = enters/exits left, positive = enters/exits right.
// Kept well within the side columns so no element can drift toward center.
const ENTER_L1 = -280;
const EXIT_L1  = -220;
const ENTER_L4 = -240;
const EXIT_L4  = -180;
const ENTER_R2 =  280;
const EXIT_R2  =  220;
const ENTER_R5 =  200;
const EXIT_R5  =  150;
const ENTER_DESC = 180;
const EXIT_DESC  = 130;
// Vertical travel distances (px). Positive = enters from below, negative = enters from above.
const ENTER_Y_STATS =  80;
const EXIT_Y_STATS  =  56;
const ENTER_Y_TAG   = -44;
const EXIT_Y_TAG    = -32;

const BLOBS = [
  {
    id: 'b-gold',
    size: 620,
    height: 540,
    top: '-10%',
    left: 'calc(100% - 600px)',
    color: [
      'radial-gradient(circle at 26% 26%, rgba(255,195,0,1.0) 0%, transparent 42%)',
      'radial-gradient(circle at 66% 52%, rgba(235,120,0,1.0) 0%, transparent 40%)',
      'radial-gradient(circle at 46% 82%, rgba(200,148,75,0.88) 0%, transparent 34%)',
    ].join(', '),
    delay: 0,
    duration: 11,
    borderRadius: '76% 24% 30% 70% / 26% 74% 22% 78%',
    borderRadiusAlt: '28% 72% 74% 26% / 76% 22% 78% 24%',
  },
  {
    id: 'b-teal',
    size: 600,
    height: 500,
    top: '42%',
    left: '4%',
    color: [
      'radial-gradient(circle at 26% 28%, rgba(175,215,200,1.0) 0%, transparent 42%)',
      'radial-gradient(circle at 66% 54%, rgba(0,178,145,1.0) 0%, transparent 38%)',
      'radial-gradient(circle at 20% 78%, rgba(0,148,198,0.90) 0%, transparent 34%)',
    ].join(', '),
    delay: 1.0,
    duration: 13,
    borderRadius: '22% 78% 74% 26% / 74% 24% 76% 26%',
    borderRadiusAlt: '74% 26% 24% 76% / 24% 76% 26% 74%',
  },
];

const BenefitsView = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // clamp: true — prevents extrapolation beyond defined scroll range at both ends,
  // guaranteeing no element can overshoot its bounded side at any scroll position.

  // "BEZ OBSLUHY" — row 1 left, enters/exits left (x <= 0)
  const x1 = useTransform(scrollYProgress, [0.02, 0.22, 0.72, 0.94], [ENTER_L1, 0, 0, EXIT_L1], { clamp: true });
  // "FUNGUJE." — row 1 right, enters/exits right (x >= 0)
  const x2 = useTransform(scrollYProgress, [0.03, 0.24, 0.72, 0.94], [ENTER_R2, 0, 0, EXIT_R2], { clamp: true });
  // "VIAC" — row 2 left, staggered slightly after row 1 (x <= 0)
  const x4 = useTransform(scrollYProgress, [0.07, 0.28, 0.72, 0.94], [ENTER_L4, 0, 0, EXIT_L4], { clamp: true });
  // "PRÍJMOV." — row 2 right, staggered after row 1 (x >= 0)
  const x5 = useTransform(scrollYProgress, [0.09, 0.31, 0.72, 0.94], [ENTER_R5, 0, 0, EXIT_R5], { clamp: true });
  // Stats — rise from bottom (vertical only, no horizontal risk)
  const yStats = useTransform(scrollYProgress, [0.22, 0.44, 0.74, 0.94], [ENTER_Y_STATS, 0, 0, EXIT_Y_STATS], { clamp: true });
  // Descriptor — from right (x >= 0)
  const xDesc = useTransform(scrollYProgress, [0.25, 0.46, 0.74, 0.94], [ENTER_DESC, 0, 0, EXIT_DESC], { clamp: true });
  // Tag from top (vertical only)
  const yTag = useTransform(scrollYProgress, [0.02, 0.2, 0.74, 0.94], [ENTER_Y_TAG, 0, 0, EXIT_Y_TAG], { clamp: true });

  const opacity = useTransform(scrollYProgress, [0.01, 0.18, 0.79, 0.96], [0, 1, 1, 0]);

  return (
    <section ref={ref} className={styles.section} id="benefits">
      <div className={styles.ghost}>REVENUE</div>

      <motion.div className={styles.viewport} style={{ opacity }}>
        <div className={styles.blobLayer}>
          {BLOBS.map((blob) => <GlassBlob key={blob.id} config={blob} />)}
        </div>

        {/* Grid — three columns: left content | center safe zone | right content */}
        <div className={styles.grid}>

          {/* LEFT COLUMN — x animations only go left (x <= 0) */}
          <div className={styles.leftCol}>
            {/* Tag */}
            <motion.div className={styles.tag} style={{ y: yTag }}>
              {t('benefits.tag')}
            </motion.div>

            {/* BEZ OBSLUHY — row 1 left, slides in from left */}
            <motion.div className={`${styles.word} ${styles.w1}`} style={{ x: x1 }}>
              {t('benefits.w1')}
            </motion.div>

            {/* VIAC — row 2 left, slides in from left */}
            <motion.div className={`${styles.word} ${styles.w4}`} style={{ x: x4 }}>
              {t('benefits.w4')}
            </motion.div>

            {/* Stats */}
            <motion.div className={styles.stats} style={{ y: yStats }}>
              <div className={styles.stat}>
                <span className={styles.val}>25,000+</span>
                <span className={styles.label}>{t('benefits.stat1Label')}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.stat}>
                <span className={styles.val}>10 CZK</span>
                <span className={styles.label}>{t('benefits.stat2Label')}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.stat}>
                <span className={styles.val}>0</span>
                <span className={styles.label}>{t('benefits.stat3Label')}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.stat}>
                <span className={styles.val}>24/7</span>
                <span className={styles.label}>{t('benefits.stat4Label')}</span>
              </div>
            </motion.div>
          </div>

          {/* CENTER COLUMN — empty safe zone for the karaoke machine */}
          <div className={styles.centerCol} />

          {/* RIGHT COLUMN — x animations only go right (x >= 0) */}
          <div className={styles.rightCol}>
            {/* FUNGUJE. — row 1 right, slides in from right */}
            <motion.div className={`${styles.word} ${styles.w2}`} style={{ x: x2 }}>
              {t('benefits.w2')}
            </motion.div>

            {/* PRÍJMOV. — row 2 right, slides in from right */}
            <motion.div className={`${styles.word} ${styles.w5}`} style={{ x: x5 }}>
              {t('benefits.w5')}
            </motion.div>

            {/* Descriptor — slides in from right */}
            <motion.p className={styles.desc} style={{ x: xDesc }}>
              {t('benefits.desc')}
            </motion.p>
          </div>

        </div>
      </motion.div>
    </section>
  );
};

export default BenefitsView;
