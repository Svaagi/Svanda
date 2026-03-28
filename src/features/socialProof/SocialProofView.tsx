import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

import { DEMO_CLIENT_NAME } from 'constants';

import { TestimonialCard } from './components';
import styles from './socialProof.module.css';
import { TestimonialData } from './types';

const LEMON_TESTIMONIAL: TestimonialData = {
  quote:
    '"SVANDA completely changed our bar nights. Guests queue up to use it — the machine basically runs itself and earns us money while we focus on service."',
  authorName: 'Owner Name',
  authorRole: 'Owner',
  venueName: DEMO_CLIENT_NAME,
  photoPath: '/assets/testimonials/lemon-music-bar-owner.jpg',
};

const SocialProofView = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['-200px', '200px']);
  const blobsY = useTransform(scrollYProgress, [0, 1], ['-450px', '450px']);
  const accentY = useTransform(scrollYProgress, [0, 1], ['-700px', '700px']);

  // Image drifts at its own intermediate speed — adds a 4th depth plane
  const imageY = useTransform(scrollYProgress, [0, 1], ['-160px', '160px']);

  return (
    <section className={styles.socialProof} ref={sectionRef}>
      <motion.div className={styles.sectionMainBg} style={{ y: bgY }} />

      <motion.div className={styles.background} style={{ y: blobsY }}>
        <div className={styles.blobA} />
        <div className={styles.blobB} />
      </motion.div>

      <motion.div className={styles.backgroundAccent} style={{ y: accentY }}>
        <div className={styles.blobC} />
      </motion.div>

      <div className={styles.sectionInner}>
        <motion.div className={styles.venueImageWrap} style={{ y: imageY }}>
          <div className={styles.venueImageCard}>
            <div className={styles.venueImagePlaceholder}>
              <p className={styles.venuePlaceholderLabel}>
                REPLACE: Lemon Music Bar venue photo
                <br />
                Path: /assets/venues/lemon-music-bar.jpg
              </p>
            </div>
          </div>
          <div className={styles.venueNameBadge}>{DEMO_CLIENT_NAME}</div>
        </motion.div>

        <div className={styles.contentColumn}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <span className={styles.sectionTag}>Trusted by Venues</span>
            <h2 className={styles.sectionTitle}>
              Already Live at{' '}
              <span className={styles.titleAccent}>{DEMO_CLIENT_NAME}</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              The first SVANDA installation is running at Lemon Music Bar —
              with real guests, real songs, and real results every night.
            </p>
          </motion.div>

          <TestimonialCard testimonial={LEMON_TESTIMONIAL} />

          <motion.div
            className={styles.statsStrip}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className={styles.stripStat}>
              <span className={styles.stripNumber}>1</span>
              <span className={styles.stripLabel}>Live Venue</span>
            </div>
            <div className={styles.stripDivider} />
            <div className={styles.stripStat}>
              <span className={styles.stripNumber}>Nightly</span>
              <span className={styles.stripLabel}>Usage</span>
            </div>
            <div className={styles.stripDivider} />
            <div className={styles.stripStat}>
              <span className={styles.stripNumber}>100%</span>
              <span className={styles.stripLabel}>Satisfied</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SocialProofView;
