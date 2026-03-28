import { motion, MotionValue } from 'framer-motion';

import { GalleryLayer } from '../types';
import styles from '../gallery.module.css';

interface ParallaxLayerProps {
  layer: GalleryLayer;
  parallaxY: MotionValue<string>;
  index: number;
}

const ParallaxLayer = ({ layer, parallaxY, index }: ParallaxLayerProps) => (
  <motion.div
    className={styles.galleryLayer}
    style={{
      top: layer.top,
      left: layer.left,
      width: layer.width,
      zIndex: layer.zIndex,
      y: parallaxY,
      rotate: layer.rotate,
    }}
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{
      duration: 0.9,
      delay: index * 0.1,
      ease: [0.4, 0, 0.2, 1],
    }}
  >
    <div className={styles.layerCard}>
      {layer.item.type === 'video' ? (
        <div className={styles.videoPlaceholder}>
          <div className={styles.videoPlayIcon}>
            <div className={styles.playTriangle} />
          </div>
          <p className={styles.placeholderText}>{layer.item.placeholderLabel}</p>
        </div>
      ) : (
        <div className={styles.photoPlaceholder}>
          <div className={styles.photoPlaceholderGradient} />
          <p className={styles.placeholderText}>{layer.item.placeholderLabel}</p>
        </div>
      )}
    </div>
  </motion.div>
);

export default ParallaxLayer;
