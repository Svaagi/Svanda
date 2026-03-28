import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

import { HotspotPin } from './components';
import styles from './productShowcase.module.css';
import { ProductHotspot } from './types';

const HOTSPOTS: ProductHotspot[] = [
  {
    id: 'screen',
    label: 'Touchscreen Interface',
    description: 'Large HD touchscreen for browsing the full song catalogue.',
    positionX: '48%',
    positionY: '28%',
  },
  {
    id: 'payment',
    label: 'Payment Terminal',
    description: 'Contactless and card payments. No cash needed.',
    positionX: '72%',
    positionY: '60%',
  },
  {
    id: 'speaker',
    label: 'Audio Output',
    description: 'Connects directly to your venue sound system.',
    positionX: '25%',
    positionY: '72%',
  },
];

const ProductShowcaseView = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['-200px', '200px']);
  const blobsY = useTransform(scrollYProgress, [0, 1], ['-450px', '450px']);
  const accentY = useTransform(scrollYProgress, [0, 1], ['-700px', '700px']);

  // 3D model floats at its own depth between blobs and content
  const modelY = useTransform(scrollYProgress, [0, 1], ['-160px', '160px']);
  const titleY = useTransform(scrollYProgress, [0, 0.5], ['60px', '0px']);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.25], [0, 1]);

  return (
    <section className={styles.productShowcase} id="showcase" ref={sectionRef}>
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
          <span className={styles.sectionTag}>The Machine</span>
          <h2 className={styles.sectionTitle}>
            Designed to{' '}
            <span className={styles.titleAccent}>Impress.</span>
          </h2>
          <p className={styles.sectionSubtitle}>
            A physical machine that looks as good as it performs. Click the
            hotspots to explore its features.
          </p>
        </motion.div>

        <motion.div className={styles.showcaseStage} style={{ y: modelY }}>
          <div className={styles.modelContainer}>
            <div className={styles.modelPlaceholder}>
              <div className={styles.modelPlaceholderGlow} />
              <div className={styles.modelPlaceholderBox}>
                <div className={styles.modelScreen} />
                <div className={styles.modelBody} />
                <div className={styles.modelBase} />
              </div>
              <p className={styles.modelPlaceholderLabel}>
                REPLACE: 3D model file (.glb/.gltf)
                <br />
                Path: /assets/models/svanda-box.glb
                <br />
                Recommended: use @react-three/fiber + drei for GLB rendering
              </p>

              {HOTSPOTS.map((hotspot) => (
                <HotspotPin key={hotspot.id} hotspot={hotspot} />
              ))}
            </div>

            <div className={styles.shadowEllipse} />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ProductShowcaseView;
