import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import GlassBlob from 'components/GlassBlob';
import styles from './modes.module.css';

const BLOBS = [
  {
    id: 'm-top',
    size: 640,
    height: 560,
    top: '-10%',
    left: '4%',
    color: [
      'radial-gradient(circle at 26% 28%, rgba(112,0,255,1.0) 0%, transparent 42%)',
      'radial-gradient(circle at 65% 46%, rgba(245,18,102,1.0) 0%, transparent 40%)',
      'radial-gradient(circle at 46% 80%, rgba(178,0,228,0.90) 0%, transparent 34%)',
    ].join(', '),
    delay: 0,
    duration: 11,
    borderRadius: '74% 26% 28% 72% / 22% 76% 24% 78%',
    borderRadiusAlt: '26% 74% 76% 24% / 78% 22% 76% 24%',
  },
  {
    id: 'm-bottom',
    size: 600,
    height: 500,
    top: '44%',
    left: 'calc(100% - 580px)',
    color: [
      'radial-gradient(circle at 26% 28%, rgba(172,210,180,1.0) 0%, transparent 42%)',
      'radial-gradient(circle at 65% 54%, rgba(0,232,108,1.0) 0%, transparent 38%)',
      'radial-gradient(circle at 44% 80%, rgba(0,198,162,0.88) 0%, transparent 34%)',
    ].join(', '),
    delay: 1.2,
    duration: 13,
    borderRadius: '26% 74% 72% 28% / 76% 24% 74% 26%',
    borderRadiusAlt: '74% 26% 26% 74% / 24% 76% 28% 72%',
  },
];

const ModesView = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // "TWO" — top-left, sweeps in from far left with slight downward arc, exits upward
  const x1 = useTransform(scrollYProgress, [0.02, 0.22, 0.72, 0.94], [-420, 0, 0, 0]);
  const y1 = useTransform(scrollYProgress, [0.02, 0.22, 0.72, 0.94], [60, 0, 0, 0]);
  const y1exit = useTransform(scrollYProgress, [0.72, 0.94], [0, -160]);

  // "MODES." — top-right, diagonal from top-right corner, exits down
  const x2 = useTransform(scrollYProgress, [0.03, 0.25, 0.72, 0.94], [360, 0, 0, 0]);
  const y2 = useTransform(scrollYProgress, [0.03, 0.25, 0.72, 0.94], [-80, 0, 0, 0]);
  const y2exit = useTransform(scrollYProgress, [0.72, 0.94], [0, 160]);

  // "KARAOKE BOX" — left, slides from left, exits left
  const x3 = useTransform(scrollYProgress, [0.08, 0.28, 0.72, 0.94], [-260, 0, 0, -180]);
  const y3 = useTransform(scrollYProgress, [0.08, 0.28, 0.72, 0.94], [60, 0, 0, -60]);

  // "JUKEBOX" — right, slides from right, exits right
  const x4 = useTransform(scrollYProgress, [0.10, 0.30, 0.72, 0.94], [260, 0, 0, 180]);
  const y4 = useTransform(scrollYProgress, [0.10, 0.30, 0.72, 0.94], [-60, 0, 0, 60]);

  // "OR BOTH." — bottom-left, rises from below, exits left
  const y5 = useTransform(scrollYProgress, [0.16, 0.38, 0.72, 0.94], [120, 0, 0, 0]);
  const x5exit = useTransform(scrollYProgress, [0.72, 0.94], [0, -120]);
  const r5 = useTransform(scrollYProgress, [0.16, 0.38, 0.72, 0.94], [6, 0, 0, -4]);

  // Descriptors — enter with headlines, slide in from sides
  const xDescL = useTransform(scrollYProgress, [0.16, 0.36, 0.74, 0.94], [-180, 0, 0, -140]);
  const yDescL = useTransform(scrollYProgress, [0.16, 0.36], [0, 0]);
  const xDescR = useTransform(scrollYProgress, [0.16, 0.36, 0.74, 0.94], [180, 0, 0, 140]);
  const yDescR = useTransform(scrollYProgress, [0.16, 0.36], [0, 0]);

  // Tag — drops from top
  const yTag = useTransform(scrollYProgress, [0.02, 0.20, 0.74, 0.94], [-50, 0, 0, -36]);

  const opacity = useTransform(scrollYProgress, [0.01, 0.18, 0.79, 0.96], [0, 1, 1, 0]);

  return (
    <section ref={ref} className={styles.section} id="modes">
      <div className={styles.ghost}>MODES</div>

      <motion.div className={styles.viewport} style={{ opacity }}>
        <div className={styles.blobLayer}>
          {BLOBS.map((blob) => <GlassBlob key={blob.id} config={blob} />)}
        </div>

        {/* Tag */}
        <motion.div className={styles.tag} style={{ y: yTag }}>
          {t('modes.tag')}
        </motion.div>

        {/* TWO — top-left, large solid, diagonal arc entry */}
        <motion.div
          className={`${styles.word} ${styles.w1}`}
          style={{ x: x1, y: y1exit }}
        >
          {t('modes.w1')}
        </motion.div>

        {/* MODES. — top-right, outline, diagonal from corner */}
        <motion.div
          className={`${styles.word} ${styles.w2}`}
          style={{ x: x2, y: y2exit }}
        >
          {t('modes.w2')}
        </motion.div>

        {/* KARAOKE BOX — left-center, strong diagonal */}
        <motion.div className={`${styles.word} ${styles.w3}`} style={{ x: x3, y: y3 }}>
          KARAOKE
          <br />
          BOX
        </motion.div>

        {/* JUKEBOX — right, outline, diagonal from top-right */}
        <motion.div className={`${styles.word} ${styles.w4}`} style={{ x: x4, y: y4 }}>
          JUKEBOX
        </motion.div>

        {/* OR BOTH. — bottom-left, accent, rises then exits left */}
        <motion.div
          className={`${styles.word} ${styles.w5}`}
          style={{ y: y5, x: x5exit, rotate: r5 }}
        >
          {t('modes.w5')}
        </motion.div>

        {/* Descriptor left — staggered diagonal, enters lower */}
        <motion.div className={styles.descLeft} style={{ x: xDescL, y: yDescL }}>
          <strong>{t('modes.descLeftTitle')}</strong>
          <p>{t('modes.descLeftDesc')}</p>
        </motion.div>

        {/* Descriptor right — staggered diagonal, enters higher */}
        <motion.div className={styles.descRight} style={{ x: xDescR, y: yDescR }}>
          <strong>{t('modes.descRightTitle')}</strong>
          <p>{t('modes.descRightDesc')}</p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ModesView;
