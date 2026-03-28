import { motion } from 'framer-motion';

import styles from '../hero.module.css';

const ProductPlaceholder = () => (
  <motion.div
    className={styles.productWrapper}
    animate={{ y: [0, -12, 0] }}
    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
  >
    <div className={styles.productGlassCard}>
      <div className={styles.productPlaceholderInner}>
        <div className={styles.productPlaceholderScreen}>
          <div className={styles.placeholderLine} style={{ width: '60%' }} />
          <div className={styles.placeholderLine} style={{ width: '40%' }} />
          <div className={styles.placeholderLine} style={{ width: '80%' }} />
          <div className={styles.placeholderDot} />
        </div>
        <div className={styles.productPlaceholderBody} />
      </div>
      <p className={styles.productPlaceholderLabel}>
        REPLACE: hero 3D object or product photo
      </p>
    </div>
  </motion.div>
);

export default ProductPlaceholder;
