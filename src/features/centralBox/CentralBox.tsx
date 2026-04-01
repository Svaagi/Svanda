import { motion, useScroll, useTransform } from 'framer-motion';
import { RefObject } from 'react';

import styles from './centralBox.module.css';

interface Props {
  containerRef: RefObject<HTMLDivElement>;
}

const CentralBox = ({ containerRef }: Props) => {
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.04, 0.88, 0.97], [0, 1, 1, 0]);

  return (
    <motion.div className={styles.wrapper} style={{ opacity }} aria-hidden="true">
      <div className={styles.scene}>
        <motion.div
          className={styles.machine}
          animate={{
            rotateY: [-8, 8, -8],
            rotateX: [3, -2, 3],
            y: [0, -16, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {/* ── Right side face (visible when rotateY < 0) ── */}
          <div className={styles.rightSide} />

          {/* ── Left side face (visible when rotateY > 0) ── */}
          <div className={styles.leftSide} />

          {/* ── Top cap ── */}
          <div className={styles.topFace} />

          {/* ── Front face — all machine UI lives here ── */}
          <div className={styles.front}>
            {/* Screen */}
            <div className={styles.screen}>
              <div className={styles.screenGlow} />
              <div className={styles.screenScanline} />
            </div>

            {/* Speaker grille */}
            <div className={styles.speakerRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className={styles.dot} />
              ))}
            </div>

            {/* Divider stripe */}
            <div className={styles.stripe} />

            {/* Card / payment terminal */}
            <div className={styles.terminal}>
              <div className={styles.terminalSlot} />
              <div className={styles.terminalLabel}>CARD</div>
            </div>

            {/* Coin / disc slot */}
            <div className={styles.discSlot} />

            {/* Brand */}
            <div className={styles.brand}>SVANDA</div>

            {/* Status LED */}
            <div className={styles.led} />

            {/* Edge highlight */}
            <div className={styles.edgeHighlight} />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CentralBox;
