import { motion, MotionValue } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { ANIMATION_DURATION_SLOW, ANIMATION_STAGGER_CHILDREN, EASING_STANDARD } from 'constants';
import { scrollToSection } from 'utils';

import LavaField from 'components/LavaField';
import { useBlobColors } from 'hooks/useBlobColors';

import { Hero3D } from './components';
import styles from './hero.module.css';
import { useHeroParallax } from './hooks';

const headlineVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: ANIMATION_STAGGER_CHILDREN,
      delayChildren: 0.4,
    },
  },
};

const wordVariant = {
  hidden: { opacity: 0, y: 60, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: ANIMATION_DURATION_SLOW, ease: EASING_STANDARD },
  },
};

const HeroView = () => {
  const { t } = useTranslation();
  const { blobsY, textY, opacityOut } = useHeroParallax();
  const { hero: heroColors } = useBlobColors();

  return (
    <section className={styles.hero} id="hero">
      <motion.div
        className={styles.blobLayer}
        style={{ y: blobsY as MotionValue<number> }}
      >
        <LavaField id="hero" colors={[...heroColors.topLeft, ...heroColors.bottomLeft, ...heroColors.topRight]} />
      </motion.div>

      <div className={styles.noiseOverlay} />

      <div className={styles.hero3dWrapper}>
        <Hero3D />
      </div>

      <div className={styles.heroContent}>
        <motion.div
          className={styles.textColumn}
          style={{
            y: textY as MotionValue<number>,
            opacity: opacityOut as MotionValue<number>,
          }}
        >
          <motion.div
            className={styles.eyebrow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t('hero.eyebrow')}
          </motion.div>

          <motion.h1
            className={styles.headline}
            variants={headlineVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span variants={wordVariant} className={styles.headlineBlock}>
              {t('hero.headline1')}
            </motion.span>
            <motion.span variants={wordVariant} className={styles.headlineBlock}>
              {t('hero.headline2')}
            </motion.span>
            <motion.span
              variants={wordVariant}
              className={`${styles.headlineBlock} ${styles.headlineAccent}`}
            >
              {t('hero.headline3')}
            </motion.span>
          </motion.h1>

          <motion.p
            className={styles.subheadline}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
          >
            {t('hero.subheadline')}
          </motion.p>

          <motion.div
            className={styles.ctaRow}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <button
              className={styles.primaryCta}
              onClick={() => scrollToSection('contact')}
            >
              {t('hero.ctaPrimary')}
            </button>
            <button
              className={styles.secondaryCta}
              onClick={() => scrollToSection('contact')}
            >
              {t('hero.ctaSecondary')}
            </button>
          </motion.div>

          <motion.div
            className={styles.statsRow}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.8 }}
          >
            <div className={styles.statItem}>
              <span className={styles.statNumber}>25,000+</span>
              <span className={styles.statLabel}>{t('hero.stat1Label')}</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>10 CZK</span>
              <span className={styles.statLabel}>{t('hero.stat2Label')}</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>1</span>
              <span className={styles.statLabel}>{t('hero.stat3Label')}</span>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        className={styles.scrollHint}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.8 }}
      >
        <motion.span
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className={styles.scrollDot}
        />
      </motion.div>
    </section>
  );
};

export default HeroView;
