import { motion, MotionValue } from 'framer-motion';

import styles from '../experience.module.css';

interface CentralObjectProps {
  rotateY: MotionValue<number>;
  y: MotionValue<number>;
}

const CentralObject = ({ rotateY, y }: CentralObjectProps) => (
  <div className={styles.centralWrapper}>
    {/* Scroll-driven downward drift — wraps everything */}
    <motion.div style={{ y }}>
      {/* Organic float animation */}
      <motion.div
        animate={{ y: [0, -14, 0] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Y-axis tilt driven by scroll */}
        <motion.div style={{ rotateY, transformPerspective: 900 }}>
          <div className={styles.blackBox}>
            <div className={styles.boxScreen}>
              <div className={styles.boxScreenGlow} />
              <span className={styles.boxScreenLabel}>SVANDA</span>
            </div>
            <div className={styles.boxSpeakers}>
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className={styles.boxSpeakerDot} />
              ))}
            </div>
            <div className={styles.boxPayment}>
              <div className={styles.boxPaymentBar} />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Shadow breathes with float */}
      <motion.div
        className={styles.boxShadow}
        animate={{ scaleX: [1, 0.82, 1], opacity: [0.26, 0.1, 0.26] }}
        transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
      />
    </motion.div>
  </div>
);

export default CentralObject;
