import { motion, useScroll, useTransform } from 'framer-motion';
import { RefObject } from 'react';

import { useIsMobile } from 'hooks/useIsMobile';

import styles from './centralBox.module.css';

interface Props {
  containerRef: RefObject<HTMLDivElement>;
}

const CentralBox = ({ containerRef }: Props) => {
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.04, 0.82, 0.93], [0, 1, 1, 0], { clamp: true });

  if (isMobile) return null;

  const machineAnimate = {
    rotateY: [-8, 8, -8],
    rotateX: [3, -2, 3],
    y: [0, -16, 0],
  };

  return (
    <motion.div className={styles.wrapper} style={{ opacity }} aria-hidden="true">
      <div className={styles.scene}>
        <motion.div
          className={styles.machine}
          animate={machineAnimate}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className={styles.rightSide} />
          <div className={styles.leftSide} />

          <div className={styles.front}>
            <div className={styles.screen}>
              <img
                src="/svanda-app.png"
                alt="SVANDA app"
                className={styles.appImage}
                loading="eager"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default CentralBox;
