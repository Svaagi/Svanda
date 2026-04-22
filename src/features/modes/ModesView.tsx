import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import LavaField from 'components/LavaField';
import { useBlobColors } from 'hooks/useBlobColors';
import styles from './modes.module.css';

const ModesView = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
  const { modes: modesColors } = useBlobColors();

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
      <div className={styles.blobLayer}>
        <LavaField id="modes" colors={[...modesColors.top, ...modesColors.bottom]} />
      </div>
      <motion.div className={styles.viewport} style={{ opacity }}>
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
          {t('modes.w3Line1')}
          <br />
          {t('modes.w3Line2')}
        </motion.div>

        {/* JUKEBOX — right, outline, diagonal from top-right */}
        <motion.div className={`${styles.word} ${styles.w4}`} style={{ x: x4, y: y4 }}>
          {t('modes.w4')}
        </motion.div>

        {/* OR BOTH. — bottom-left, accent, rises then exits left */}
        <motion.div
          className={`${styles.word} ${styles.w5}`}
          style={{ y: y5, x: x5exit, rotate: r5 }}
        >
          {t('modes.w5')}
        </motion.div>

        {/* Left cluster — Karaoke Box + Venue option, merged */}
        <motion.div className={styles.descLeft} style={{ x: xDescL, y: yDescL }}>
          <strong>{t('modes.descLeftTitle')}</strong>
          <p>{t('modes.descLeftDesc')}</p>
          <div className={styles.offerBlock}>
            <strong className={styles.offerLabel}>{t('modes.venueTitle')}</strong>
            <p className={styles.offerText}>{t('modes.venueOption1Body')}</p>
          </div>
        </motion.div>

        {/* Right cluster — Jukebox + Events, merged */}
        <motion.div className={styles.descRight} style={{ x: xDescR, y: yDescR }}>
          <strong>{t('modes.descRightTitle')}</strong>
          <p>{t('modes.descRightDesc')}</p>
          <div className={styles.offerBlock}>
            <strong className={styles.offerLabel}>{t('modes.eventTitle')}</strong>
            <p className={styles.offerText}>{t('modes.eventBody')}</p>
            <div className={styles.offerTags}>
              <span>{t('modes.eventTag1')}</span>
              <span>{t('modes.eventTag2')}</span>
              <span>{t('modes.eventTag3')}</span>
              <span>{t('modes.eventTag4')}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default ModesView;
