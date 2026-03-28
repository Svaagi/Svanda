import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

import { ParallaxLayer } from './components';
import { GALLERY_LAYERS } from './constants';
import styles from './gallery.module.css';
import { useGalleryParallax } from './hooks';

const GalleryView = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['-200px', '200px']);
  const blobsY = useTransform(scrollYProgress, [0, 1], ['-450px', '450px']);
  const accentY = useTransform(scrollYProgress, [0, 1], ['-700px', '700px']);

  const titleY = useTransform(scrollYProgress, [0, 0.4], ['60px', '0px']);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.22], [0, 1]);

  const parallaxValues = GALLERY_LAYERS.map((layer) =>
    useGalleryParallax(sectionRef, layer.parallaxFactor),
  );

  return (
    <section className={styles.gallery} id="gallery" ref={sectionRef}>
      <motion.div className={styles.sectionMainBg} style={{ y: bgY }} />

      <motion.div className={styles.galleryBackground} style={{ y: blobsY }}>
        <div className={styles.blobA} />
        <div className={styles.blobB} />
      </motion.div>

      <motion.div className={styles.galleryBackgroundAccent} style={{ y: accentY }}>
        <div className={styles.blobC} />
      </motion.div>

      <div className={styles.sectionInner}>
        <motion.div
          className={styles.sectionHeader}
          style={{ y: titleY, opacity: titleOpacity }}
        >
          <span className={styles.sectionTag}>Real People. Real Bars.</span>
          <h2 className={styles.sectionTitle}>
            The Atmosphere
            <br />
            <span className={styles.titleAccent}>Speaks for Itself.</span>
          </h2>
        </motion.div>

        <div className={styles.compositionArea}>
          {GALLERY_LAYERS.map((layer, index) => (
            <ParallaxLayer
              key={layer.id}
              layer={layer}
              parallaxY={parallaxValues[index]}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default GalleryView;
