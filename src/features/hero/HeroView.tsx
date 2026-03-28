import { motion, MotionValue } from 'framer-motion';

import { ANIMATION_DURATION_SLOW, ANIMATION_STAGGER_CHILDREN } from 'constants';
import { scrollToSection } from 'utils';

import { GlassBlob, ProductPlaceholder } from './components';
import { HERO_BLOBS } from './constants';
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
    transition: { duration: ANIMATION_DURATION_SLOW, ease: [0.4, 0, 0.2, 1] },
  },
};

const HeroView = () => {
  const { blobsY, textY, opacityOut, productY } = useHeroParallax();

  return (
    <section className={styles.hero} id="hero">
      <motion.div
        className={styles.blobLayer}
        style={{ y: blobsY as MotionValue<number> }}
      >
        {HERO_BLOBS.map((blobConfig) => (
          <GlassBlob key={blobConfig.id} config={blobConfig} />
        ))}
      </motion.div>

      <div className={styles.noiseOverlay} />

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
            Karaoke &amp; Jukebox — One Box
          </motion.div>

          <motion.h1
            className={styles.headline}
            variants={headlineVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.span variants={wordVariant} className={styles.headlineBlock}>
              Turn Your Venue
            </motion.span>
            <motion.span variants={wordVariant} className={styles.headlineBlock}>
              Into the Night&apos;s
            </motion.span>
            <motion.span
              variants={wordVariant}
              className={`${styles.headlineBlock} ${styles.headlineAccent}`}
            >
              Main Attraction.
            </motion.span>
          </motion.h1>

          <motion.p
            className={styles.subheadline}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 1.1 }}
          >
            A self-service music machine for modern bars. Guests choose songs,
            pay directly on the machine. 25,000+ tracks. Zero hassle.
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
              Book a Demo
            </button>
            <button
              className={styles.secondaryCta}
              onClick={() => scrollToSection('product')}
            >
              See How It Works
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
              <span className={styles.statLabel}>Songs</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>10 CZK</span>
              <span className={styles.statLabel}>Per Song</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.statItem}>
              <span className={styles.statNumber}>1</span>
              <span className={styles.statLabel}>Box. Everything.</span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.productColumn}
          style={{ y: productY as MotionValue<number> }}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <ProductPlaceholder />
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
