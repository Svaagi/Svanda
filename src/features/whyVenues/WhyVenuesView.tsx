import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

import { BenefitItem } from './components';
import { BENEFITS } from './constants';
import styles from './whyVenues.module.css';

const WhyVenuesView = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['-200px', '200px']);
  const blobsY = useTransform(scrollYProgress, [0, 1], ['-450px', '450px']);
  const accentY = useTransform(scrollYProgress, [0, 1], ['-700px', '700px']);

  const titleY = useTransform(scrollYProgress, [0, 0.5], ['60px', '0px']);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  return (
    <section className={styles.whyVenues} id="why-venues" ref={sectionRef}>
      <motion.div className={styles.sectionMainBg} style={{ y: bgY }} />

      <motion.div className={styles.background} style={{ y: blobsY }}>
        <div className={styles.blobA} />
        <div className={styles.blobB} />
      </motion.div>

      <motion.div className={styles.backgroundAccent} style={{ y: accentY }}>
        <div className={styles.blobC} />
      </motion.div>

      <div className={styles.sectionInner}>
        <motion.div
          className={styles.sectionHeader}
          style={{ y: titleY, opacity: titleOpacity }}
        >
          <span className={styles.sectionTag}>Why Venues Choose SVANDA</span>
          <h2 className={styles.sectionTitle}>
            Built for Bars.
            <br />
            <span className={styles.titleAccent}>Loved by Guests.</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            Everything your venue needs from an entertainment system — and
            nothing it doesn&apos;t.
          </p>
        </motion.div>

        <div className={styles.benefitsGrid}>
          {BENEFITS.map((benefit, index) => (
            <BenefitItem key={benefit.id} benefit={benefit} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyVenuesView;
