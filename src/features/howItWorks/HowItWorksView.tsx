import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import GlassBlob from 'features/hero/components/GlassBlob';
import styles from './howItWorks.module.css';

const BLOBS = [
  {
    id: 'h-coral', size: 620, top: '-8%', left: '-6%',
    color: [
      'radial-gradient(circle at 32% 28%, rgba(255,230,210,0.84) 0%, transparent 26%)',
      'radial-gradient(circle at 50% 48%, rgba(255,80,60,0.88) 0%, rgba(255,140,60,0.58) 38%, rgba(255,200,80,0.22) 66%, transparent 80%)',
    ].join(', '),
    blur: 6, delay: 0, duration: 9, borderRadius: '62% 38% 50% 50% / 46% 56% 44% 54%',
  },
  {
    id: 'h-lime', size: 560, top: '8%', left: '60%',
    color: [
      'radial-gradient(circle at 34% 30%, rgba(230,255,210,0.78) 0%, transparent 26%)',
      'radial-gradient(circle at 50% 48%, rgba(100,220,0,0.88) 0%, rgba(40,200,80,0.58) 40%, rgba(0,180,160,0.22) 66%, transparent 80%)',
    ].join(', '),
    blur: 7, delay: 1, duration: 10, borderRadius: '46% 54% 60% 40% / 54% 46% 56% 44%',
  },
  {
    id: 'h-indigo', size: 480, top: '52%', left: '32%',
    color: [
      'radial-gradient(circle at 36% 32%, rgba(220,215,255,0.72) 0%, transparent 26%)',
      'radial-gradient(circle at 52% 50%, rgba(80,0,220,0.82) 0%, rgba(140,0,255,0.52) 42%, rgba(200,60,255,0.18) 68%, transparent 82%)',
    ].join(', '),
    blur: 8, delay: 1.8, duration: 11, borderRadius: '50% 50% 44% 56% / 58% 42% 60% 40%',
  },
];

const HowItWorksView = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // "HOW" — top-left, from far left
  const x1 = useTransform(scrollYProgress, [0.02, 0.22, 0.72, 0.94], [-900, 0, 0, -700]);
  // "TO FUNGUJE." — row 2, right side, from far right
  const x2 = useTransform(scrollYProgress, [0.03, 0.24, 0.72, 0.94], [700, 0, 0, 550]);
  // "01 SCAN" — mid-left, from left
  const x3 = useTransform(scrollYProgress, [0.08, 0.3, 0.72, 0.94], [-700, 0, 0, -500]);
  // detail 1 — from right
  const xd1 = useTransform(scrollYProgress, [0.1, 0.32, 0.72, 0.94], [300, 0, 0, 200]);
  // "02 VYBERTE" — row 4, right side, from far right
  const x4 = useTransform(scrollYProgress, [0.12, 0.35, 0.72, 0.94], [750, 0, 0, 550]);
  // detail 2 — from left, with rotation
  const xd2 = useTransform(scrollYProgress, [0.14, 0.37, 0.72, 0.94], [-250, 0, 0, -180]);
  const rd2 = useTransform(scrollYProgress, [0.14, 0.37, 0.72, 0.94], [-5, 0, 0, 3]);
  // "03 SING." — accent, rises from bottom
  const y5 = useTransform(scrollYProgress, [0.18, 0.4, 0.72, 0.94], [280, 0, 0, -200]);
  // "THREE STEPS." tag — from top
  const yTag = useTransform(scrollYProgress, [0.02, 0.2, 0.74, 0.94], [-50, 0, 0, -38]);

  const opacity = useTransform(scrollYProgress, [0.01, 0.18, 0.79, 0.96], [0, 1, 1, 0]);

  return (
    <section ref={ref} className={styles.section} id="how-it-works">
      <div className={styles.ghost}>SCAN</div>

      <motion.div className={styles.viewport} style={{ opacity }}>
        <div className={styles.blobLayer}>
          {BLOBS.map((blob) => <GlassBlob key={blob.id} config={blob} />)}
        </div>

        {/* Tag */}
        <motion.div className={styles.tag} style={{ y: yTag }}>
          {t('howItWorks.tag')}
        </motion.div>

        {/* HOW */}
        <motion.div className={`${styles.word} ${styles.w1}`} style={{ x: x1 }}>
          {t('howItWorks.w1')}
        </motion.div>

        {/* IT WORKS. */}
        <motion.div className={`${styles.word} ${styles.w2}`} style={{ x: x2 }}>
          {t('howItWorks.w2')}
        </motion.div>

        {/* 01 SCAN */}
        <motion.div className={`${styles.word} ${styles.w3}`} style={{ x: x3 }}>
          <span className={styles.num}>01</span>{t('howItWorks.step1Label')}
        </motion.div>
        <motion.div className={styles.detail} style={{ x: xd1, top: '37%', right: '5vw' }}>
          {t('howItWorks.step1Detail')}
        </motion.div>

        {/* 02 SELECT */}
        <motion.div className={`${styles.word} ${styles.w4}`} style={{ x: x4 }}>
          <span className={styles.num}>02</span>{t('howItWorks.step2Label')}
        </motion.div>
        <motion.div className={styles.detail} style={{ x: xd2, rotate: rd2, top: '55%', left: '5vw' }}>
          {t('howItWorks.step2Detail')}
        </motion.div>

        {/* 03 SING. */}
        <motion.div className={`${styles.word} ${styles.w5}`} style={{ y: y5 }}>
          <span className={styles.num}>03</span>{t('howItWorks.step3Label')}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HowItWorksView;
