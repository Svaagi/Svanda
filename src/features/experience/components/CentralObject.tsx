import { motion, MotionValue } from 'framer-motion';

import styles from '../experience.module.css';

interface CentralObjectProps {
  rotateY: MotionValue<number>;
}

const CentralObject = ({ rotateY }: CentralObjectProps) => (
  <div className={styles.centralWrapper}>
    {/* Float animation — independent of scroll */}
    <motion.div
      animate={{ y: [0, -14, 0] }}
      transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Scroll-driven Y-axis tilt */}
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

    {/* Ground shadow — breathes with the float */}
    <motion.div
      className={styles.boxShadow}
      animate={{
        scaleX: [1, 0.86, 1],
        opacity: [0.28, 0.12, 0.28],
      }}
      transition={{ duration: 4.6, repeat: Infinity, ease: 'easeInOut' }}
    />
  </div>
);

export default CentralObject;
