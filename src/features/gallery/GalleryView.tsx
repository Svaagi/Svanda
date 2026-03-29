import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { ParallaxLayer } from './components';
import { GALLERY_LAYERS } from './constants';
import styles from './gallery.module.css';
import { useGalleryParallax } from './hooks';

const GalleryView = () => {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const sectionY = useTransform(scrollYProgress, [0, 1], ['0px', '-240px']);
  const titleY = useTransform(scrollYProgress, [0, 0.4], ['60px', '0px']);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.22], [0, 1]);

  const parallaxValues = GALLERY_LAYERS.map((layer) =>
    useGalleryParallax(sectionRef, layer.parallaxFactor),
  );

  return (
    <motion.section className={styles.gallery} id="gallery" ref={sectionRef} style={{ y: sectionY }}>
      <div className={styles.sectionMainBg} />

      <div className={styles.galleryBackground}>
        <div className={styles.blobA} />
        <div className={styles.blobB} />
      </div>

      <div className={styles.galleryBackgroundAccent}>
        <div className={styles.blobC} />
      </div>

      <div className={styles.sectionInner}>
        <motion.div
          className={styles.sectionHeader}
          style={{ y: titleY, opacity: titleOpacity }}
        >
          <span className={styles.sectionTag}>{t('gallery.tag')}</span>
          <h2 className={styles.sectionTitle}>
            {t('gallery.title1')}
            <br />
            <span className={styles.titleAccent}>{t('gallery.title2')}</span>
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
    </motion.section>
  );
};

export default GalleryView;
