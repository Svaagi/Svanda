import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { DEMO_CLIENT_NAME } from 'constants';

import { TestimonialCard } from './components';
import styles from './socialProof.module.css';
import { TestimonialData } from './types';

const SocialProofView = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const imageY = useTransform(scrollYProgress, [0, 1], ['-160px', '160px']);

  const testimonial: TestimonialData = {
    quote: t('socialProof.quote'),
    authorName: t('socialProof.authorName'),
    authorRole: t('socialProof.authorRole'),
    venueName: DEMO_CLIENT_NAME,
    photoPath: '/assets/testimonials/lemon-music-bar-owner.jpg',
  };

  return (
    <motion.section className={styles.socialProof} ref={sectionRef} style={{}}>
      <div className={styles.sectionMainBg} />

      <div className={styles.background}>
        <div className={styles.blobA} />
        <div className={styles.blobB} />
      </div>

      <div className={styles.backgroundAccent}>
        <div className={styles.blobC} />
      </div>

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
            <span className={styles.sectionTag}>{t('socialProof.tag')}</span>
            <h2 className={styles.sectionTitle}>
              {t('socialProof.titlePrefix')}{' '}
              <span className={styles.titleAccent}>{DEMO_CLIENT_NAME}</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              {t('socialProof.subtitle')}
            </p>
          </motion.div>

          <TestimonialCard testimonial={testimonial} />

          <motion.div
            className={styles.statsStrip}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, delay: 0.3 }}
          >
            <div className={styles.stripStat}>
              <span className={styles.stripNumber}>{t('socialProof.stat1Number')}</span>
              <span className={styles.stripLabel}>{t('socialProof.stat1Label')}</span>
            </div>
            <div className={styles.stripDivider} />
            <div className={styles.stripStat}>
              <span className={styles.stripNumber}>{t('socialProof.stat2Number')}</span>
              <span className={styles.stripLabel}>{t('socialProof.stat2Label')}</span>
            </div>
            <div className={styles.stripDivider} />
            <div className={styles.stripStat}>
              <span className={styles.stripNumber}>{t('socialProof.stat3Number')}</span>
              <span className={styles.stripLabel}>{t('socialProof.stat3Label')}</span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
};

export default SocialProofView;
