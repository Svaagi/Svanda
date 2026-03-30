import { motion } from 'framer-motion';

import { EASING_STANDARD } from 'constants';
import { scrollToSection } from 'utils';

import styles from '../experience.module.css';

const MassiveMusicSection = () => (
  <section className={styles.massiveSection}>
    <div className={styles.massiveBg} />

    <div className={styles.massiveContent}>
      <motion.span
        className={styles.massiveTextTop}
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.1, ease: EASING_STANDARD }}
      >
        SVANDA
      </motion.span>

      <motion.span
        className={styles.massiveTextBot}
        initial={{ opacity: 0, y: 70 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1.1, delay: 0.14, ease: EASING_STANDARD }}
      >
        EXPERIENCE
      </motion.span>

      <motion.div
        className={styles.massiveTagline}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.48 }}
      >
        <span>Karaoke</span>
        <span className={styles.massiveTaglineDot}>·</span>
        <span>Jukebox</span>
        <span className={styles.massiveTaglineDot}>·</span>
        <span>Self-Service</span>
        <span className={styles.massiveTaglineDot}>·</span>
        <span>25,000+ Songs</span>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.72, ease: EASING_STANDARD }}
      >
        <button
          className={styles.massiveCta}
          onClick={() => scrollToSection('contact')}
        >
          Book a Demo
        </button>
      </motion.div>
    </div>
  </section>
);

export default MassiveMusicSection;
