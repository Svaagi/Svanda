import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

import { FeatureCard } from './components';
import { FEATURE_CARDS } from './constants';
import styles from './productIntro.module.css';

const ProductIntroView = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Background drifts at 20% of scroll speed — feels like a distant backdrop.
  const bgY = useTransform(scrollYProgress, [0, 1], ['-200px', '200px']);

  // Blobs at 45% of scroll speed — clearly a different depth plane than bg.
  const blobsY = useTransform(scrollYProgress, [0, 1], ['-450px', '450px']);

  // Accent at 70% of scroll speed — the fastest layer, sweeps dramatically.
  const accentY = useTransform(scrollYProgress, [0, 1], ['-700px', '700px']);

  const titleY = useTransform(scrollYProgress, [0, 0.5], ['60px', '0px']);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  return (
    <section className={styles.productIntro} id="product" ref={sectionRef}>
      <motion.div className={styles.sectionMainBg} style={{ y: bgY }} />

      <motion.div className={styles.backgroundBlobs} style={{ y: blobsY }}>
        <div className={styles.blobA} />
        <div className={styles.blobB} />
      </motion.div>

      <motion.div className={styles.backgroundBlobsAccent} style={{ y: accentY }}>
        <div className={styles.blobC} />
      </motion.div>

      <div className={styles.sectionInner}>
        <motion.div
          className={styles.sectionHeader}
          style={{ y: titleY, opacity: titleOpacity }}
        >
          <span className={styles.sectionTag}>The Product</span>
          <h2 className={styles.sectionTitle}>
            One Machine.
            <br />
            <span className={styles.titleAccent}>Infinite Possibilities.</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            SVANDA is a vending-machine-style entertainment box built for bars
            and venues. It lives in the corner and earns money around the clock.
          </p>
        </motion.div>

        <div className={styles.featureGrid}>
          {FEATURE_CARDS.map((card, index) => (
            <FeatureCard key={card.id} card={card} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductIntroView;
