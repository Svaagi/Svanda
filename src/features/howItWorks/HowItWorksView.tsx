import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

import { StepCard } from './components';
import { STEPS } from './constants';
import styles from './howItWorks.module.css';

const HowItWorksView = () => {
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
    <section className={styles.howItWorks} id="how-it-works" ref={sectionRef}>
      <motion.div className={styles.sectionMainBg} style={{ y: bgY }} />

      <motion.div className={styles.backgroundLayer} style={{ y: blobsY }}>
        <div className={styles.blobA} />
        <div className={styles.blobB} />
      </motion.div>

      <motion.div className={styles.backgroundLayerAccent} style={{ y: accentY }}>
        <div className={styles.blobC} />
      </motion.div>

      <div className={styles.sectionInner}>
        <motion.div
          className={styles.sectionHeader}
          style={{ y: titleY, opacity: titleOpacity }}
        >
          <span className={styles.sectionTag}>How It Works</span>
          <h2 className={styles.sectionTitle}>
            Three Steps to{' '}
            <span className={styles.titleAccent}>Pure Enjoyment</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            The whole experience takes seconds. No apps, no accounts, no
            waiting. Just walk up, choose, and play.
          </p>
        </motion.div>

        <div className={styles.stepsGrid}>
          {STEPS.map((step, index) => (
            <StepCard key={step.id} step={step} index={index} />
          ))}
        </div>

        <motion.div
          className={styles.connectorLine}
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 1.2, delay: 0.3, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </section>
  );
};

export default HowItWorksView;
