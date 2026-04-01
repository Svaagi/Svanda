import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import GlassBlob from 'features/hero/components/GlassBlob';
import styles from './benefits.module.css';

const BLOBS = [
  {
    id: 'b-gold', size: 600, top: '-12%', left: '54%',
    color: [
      'radial-gradient(circle at 34% 28%, rgba(255,250,200,0.84) 0%, transparent 26%)',
      'radial-gradient(circle at 50% 48%, rgba(255,180,0,0.90) 0%, rgba(220,120,0,0.58) 40%, rgba(180,60,0,0.20) 68%, transparent 82%)',
    ].join(', '),
    blur: 7, delay: 0, duration: 9, borderRadius: '52% 48% 44% 56% / 46% 58% 42% 54%',
  },
  {
    id: 'b-mint', size: 540, top: '46%', left: '-8%',
    color: [
      'radial-gradient(circle at 36% 30%, rgba(210,255,240,0.82) 0%, transparent 26%)',
      'radial-gradient(circle at 50% 50%, rgba(0,180,140,0.88) 0%, rgba(0,160,200,0.56) 40%, rgba(60,80,220,0.20) 68%, transparent 82%)',
    ].join(', '),
    blur: 8, delay: 1.2, duration: 11, borderRadius: '44% 56% 58% 42% / 56% 44% 52% 48%',
  },
];

const BenefitsView = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // "BEZ OBSLUHY" — row 1 left, from far left
  const x1 = useTransform(scrollYProgress, [0.02, 0.22, 0.72, 0.94], [-900, 0, 0, -700]);
  // "FUNGUJE." — row 1 right (same row), from far right
  const x2 = useTransform(scrollYProgress, [0.03, 0.24, 0.72, 0.94], [900, 0, 0, 700]);
  // "VIAC" — row 2 left, from left
  const x4 = useTransform(scrollYProgress, [0.1, 0.32, 0.72, 0.94], [-700, 0, 0, -500]);
  // "PRÍJMOV." — row 2 right (same row), from right
  const x5 = useTransform(scrollYProgress, [0.12, 0.35, 0.72, 0.94], [600, 0, 0, 450]);
  // Stats — rise from bottom
  const yStats = useTransform(scrollYProgress, [0.22, 0.44, 0.74, 0.94], [100, 0, 0, 70]);
  // Descriptor — from left
  const xDesc = useTransform(scrollYProgress, [0.25, 0.46, 0.74, 0.94], [-300, 0, 0, -220]);
  // Tag from top
  const yTag = useTransform(scrollYProgress, [0.02, 0.2, 0.74, 0.94], [-50, 0, 0, -38]);

  const opacity = useTransform(scrollYProgress, [0.01, 0.18, 0.79, 0.96], [0, 1, 1, 0]);

  return (
    <section ref={ref} className={styles.section} id="benefits">
      <div className={styles.ghost}>REVENUE</div>

      <motion.div className={styles.viewport} style={{ opacity }}>
        <div className={styles.blobLayer}>
          {BLOBS.map((blob) => <GlassBlob key={blob.id} config={blob} />)}
        </div>

        {/* Tag */}
        <motion.div className={styles.tag} style={{ y: yTag }}>
          {t('benefits.tag')}
        </motion.div>

        {/* BEZ OBSLUHY — row 1 left */}
        <motion.div className={`${styles.word} ${styles.w1}`} style={{ x: x1 }}>
          {t('benefits.w1')}
        </motion.div>

        {/* FUNGUJE. — row 1 right (same row) */}
        <motion.div className={`${styles.word} ${styles.w2}`} style={{ x: x2 }}>
          {t('benefits.w2')}
        </motion.div>

        {/* VIAC — row 2 left */}
        <motion.div className={`${styles.word} ${styles.w4}`} style={{ x: x4 }}>
          {t('benefits.w4')}
        </motion.div>

        {/* PRÍJMOV. — row 2 right (same row) */}
        <motion.div className={`${styles.word} ${styles.w5}`} style={{ x: x5 }}>
          {t('benefits.w5')}
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

        {/* Descriptor */}
        <motion.p className={styles.desc} style={{ x: xDesc }}>
          {t('benefits.desc')}
        </motion.p>
      </motion.div>
    </section>
  );
};

export default BenefitsView;
