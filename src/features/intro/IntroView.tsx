import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styles from './intro.module.css';
import GlassBlob from 'features/hero/components/GlassBlob';

const BLOBS = [
  {
    id: 'i-emerald', size: 600, top: '-5%', left: '52%',
    color: [
      'radial-gradient(circle at 34% 28%, rgba(200,255,230,0.80) 0%, transparent 26%)',
      'radial-gradient(circle at 50% 48%, rgba(0,200,120,0.88) 0%, rgba(0,220,180,0.58) 40%, rgba(0,160,240,0.22) 68%, transparent 82%)',
    ].join(', '),
    blur: 7, delay: 0, duration: 9, borderRadius: '52% 48% 44% 56% / 46% 58% 42% 54%',
  },
  {
    id: 'i-sky', size: 520, top: '48%', left: '-8%',
    color: [
      'radial-gradient(circle at 36% 30%, rgba(210,240,255,0.82) 0%, transparent 26%)',
      'radial-gradient(circle at 50% 50%, rgba(40,160,255,0.90) 0%, rgba(100,80,255,0.60) 40%, rgba(180,40,220,0.22) 68%, transparent 82%)',
    ].join(', '),
    blur: 8, delay: 1.4, duration: 11, borderRadius: '44% 56% 58% 42% / 56% 44% 52% 48%',
  },
];

const IntroView = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // "SAMO" — top-left, from far left
  const x1 = useTransform(scrollYProgress, [0.02, 0.22, 0.7, 0.93], [-900, 0, 0, -700]);
  // "OBSLUHA" — top-right, same row, from far right
  const x2 = useTransform(scrollYProgress, [0.04, 0.25, 0.7, 0.93], [900, 0, 0, 700]);
  // "KARAOKE" — mid-left, from left
  const x3 = useTransform(scrollYProgress, [0.07, 0.28, 0.7, 0.93], [-700, 0, 0, -500]);
  // "+ JUKEBOX" — mid-right, same row as KARAOKE, from right
  const x4 = useTransform(scrollYProgress, [0.1, 0.32, 0.7, 0.93], [700, 0, 0, 550]);
  // "18 000+ SKLADIEB" — bottom-right, from right
  const x6 = useTransform(scrollYProgress, [0.18, 0.4, 0.73, 0.93], [400, 0, 0, 300]);
  // Descriptor — bottom, rises from below
  const y7 = useTransform(scrollYProgress, [0.24, 0.45, 0.73, 0.93], [100, 0, 0, 70]);
  // Small tag — top, drops from top
  const y0 = useTransform(scrollYProgress, [0.02, 0.2, 0.73, 0.93], [-60, 0, 0, -40]);

  const opacity = useTransform(scrollYProgress, [0.01, 0.18, 0.79, 0.95], [0, 1, 1, 0]);

  return (
    <section ref={ref} className={styles.section}>

      <motion.div className={styles.viewport} style={{ opacity }}>
        <div className={styles.blobLayer}>
          {BLOBS.map((blob) => <GlassBlob key={blob.id} config={blob} />)}
        </div>

        {/* Top tag */}
        <motion.div className={styles.tag} style={{ y: y0 }}>
          {t('intro.tag')}
        </motion.div>

        {/* SAMO */}
        <motion.div className={`${styles.word} ${styles.w1}`} style={{ x: x1 }}>
          {t('intro.w1')}
        </motion.div>

        {/* OBSLUHA — same row as SAMO */}
        <motion.div className={`${styles.word} ${styles.w2}`} style={{ x: x2 }}>
          {t('intro.w2')}
        </motion.div>

        {/* KARAOKE */}
        <motion.div className={`${styles.word} ${styles.w3}`} style={{ x: x3 }}>
          {t('intro.w3')}
        </motion.div>

        {/* + JUKEBOX — same row as KARAOKE */}
        <motion.div className={`${styles.word} ${styles.w4}`} style={{ x: x4 }}>
          {t('intro.w4')}
        </motion.div>

        {/* 18 000+ SKLADIEB */}
        <motion.div className={`${styles.word} ${styles.w6}`} style={{ x: x6 }}>
          {t('intro.w6')}
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
      </motion.div>
    </section>
  );
};

export default IntroView;
