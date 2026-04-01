import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import GlassBlob from 'features/hero/components/GlassBlob';
import styles from './modes.module.css';

const BLOBS = [
  {
    id: 'm-electric', size: 680, top: '-16%', left: '-8%',
    color: [
      'radial-gradient(circle at 30% 26%, rgba(180,140,255,0.22) 0%, transparent 26%)',
      'radial-gradient(circle at 48% 44%, rgba(100,0,255,0.75) 0%, rgba(180,0,255,0.50) 38%, rgba(60,0,180,0.20) 68%, transparent 82%)',
    ].join(', '),
    blur: 4, delay: 0, duration: 9, borderRadius: '60% 40% 52% 48% / 50% 62% 38% 50%',
  },
  {
    id: 'm-hotpink', size: 580, top: '5%', left: '62%',
    color: [
      'radial-gradient(circle at 34% 28%, rgba(255,160,200,0.22) 0%, transparent 26%)',
      'radial-gradient(circle at 50% 48%, rgba(255,20,100,0.72) 0%, rgba(255,60,180,0.46) 40%, rgba(180,0,120,0.16) 68%, transparent 82%)',
    ].join(', '),
    blur: 5, delay: 1, duration: 10, borderRadius: '44% 56% 48% 52% / 58% 44% 56% 42%',
  },
  {
    id: 'm-neongreen', size: 520, top: '48%', left: '28%',
    color: [
      'radial-gradient(circle at 36% 30%, rgba(160,255,180,0.18) 0%, transparent 26%)',
      'radial-gradient(circle at 50% 50%, rgba(0,255,100,0.62) 0%, rgba(0,200,160,0.38) 42%, rgba(0,120,200,0.14) 68%, transparent 82%)',
    ].join(', '),
    blur: 6, delay: 1.8, duration: 11, borderRadius: '52% 48% 56% 44% / 46% 58% 42% 54%',
  },
];

const ModesView = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // "TWO" — top-left, from far left, exits top
  const x1 = useTransform(scrollYProgress, [0.02, 0.22, 0.72, 0.94], [-900, 0, 0, 0]);
  const y1exit = useTransform(scrollYProgress, [0.72, 0.94], [0, -200]);

  // "MODES." — outline, top-right, from far right, exits bottom
  const x2 = useTransform(scrollYProgress, [0.03, 0.24, 0.72, 0.94], [900, 0, 0, 0]);
  const y2exit = useTransform(scrollYProgress, [0.72, 0.94], [0, 200]);

  // "KARAOKE BOX" — mid-left, diagonal from bottom-left
  const x3 = useTransform(scrollYProgress, [0.08, 0.3, 0.72, 0.94], [-700, 0, 0, -500]);
  const y3 = useTransform(scrollYProgress, [0.08, 0.3, 0.72, 0.94], [200, 0, 0, -150]);

  // "JUKEBOX" — mid-right, outline, diagonal from top-right
  const x4 = useTransform(scrollYProgress, [0.1, 0.33, 0.72, 0.94], [600, 0, 0, 450]);
  const y4 = useTransform(scrollYProgress, [0.1, 0.33, 0.72, 0.94], [-200, 0, 0, 130]);

  // "OR BOTH." — center-bottom, rises, exits left with rotation
  const y5 = useTransform(scrollYProgress, [0.16, 0.38, 0.72, 0.94], [200, 0, 0, 0]);
  const x5exit = useTransform(scrollYProgress, [0.72, 0.94], [0, -300]);
  const r5 = useTransform(scrollYProgress, [0.16, 0.38, 0.72, 0.94], [8, 0, 0, -5]);

  // Descriptors for each mode — from bottom, alternating sides
  const xDescL = useTransform(scrollYProgress, [0.22, 0.44, 0.74, 0.94], [-250, 0, 0, -180]);
  const xDescR = useTransform(scrollYProgress, [0.22, 0.44, 0.74, 0.94], [250, 0, 0, 180]);

  // Tag — drops from top
  const yTag = useTransform(scrollYProgress, [0.02, 0.2, 0.74, 0.94], [-50, 0, 0, -35]);

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

        {/* TWO */}
        <motion.div
          className={`${styles.word} ${styles.w1}`}
          style={{ x: x1, y: y1exit }}
        >
          {t('modes.w1')}
        </motion.div>

        {/* MODES. (outline, behind box) */}
        <motion.div
          className={`${styles.word} ${styles.w2}`}
          style={{ x: x2, y: y2exit }}
        >
          {t('modes.w2')}
        </motion.div>

        {/* KARAOKE BOX — in front */}
        <motion.div className={`${styles.word} ${styles.w3}`} style={{ x: x3, y: y3 }}>
          KARAOKE
          <br />
          BOX
        </motion.div>

        {/* JUKEBOX — outline, behind */}
        <motion.div className={`${styles.word} ${styles.w4}`} style={{ x: x4, y: y4 }}>
          JUKEBOX
        </motion.div>

        {/* OR BOTH. — accent, center-bottom */}
        <motion.div
          className={`${styles.word} ${styles.w5}`}
          style={{ y: y5, x: x5exit, rotate: r5 }}
        >
          {t('modes.w5')}
        </motion.div>

        {/* Mode descriptions */}
        <motion.div className={styles.descLeft} style={{ x: xDescL }}>
          <strong>{t('modes.descLeftTitle')}</strong>
          <p>{t('modes.descLeftDesc')}</p>
        </motion.div>

        <motion.div className={styles.descRight} style={{ x: xDescR }}>
          <strong>{t('modes.descRightTitle')}</strong>
          <p>{t('modes.descRightDesc')}</p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ModesView;
