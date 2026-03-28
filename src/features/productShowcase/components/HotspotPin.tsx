import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { ProductHotspot } from '../types';
import styles from '../productShowcase.module.css';

interface HotspotPinProps {
  hotspot: ProductHotspot;
}

const HotspotPin = ({ hotspot }: HotspotPinProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen((previous) => !previous);

  return (
    <div
      className={styles.hotspot}
      style={{ left: hotspot.positionX, top: hotspot.positionY }}
    >
      <button className={styles.hotspotDot} onClick={handleToggle}>
        <span className={styles.hotspotRing} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={styles.hotspotTooltip}
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 8 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          >
            <span className={styles.tooltipTitle}>{hotspot.label}</span>
            <span className={styles.tooltipDesc}>{hotspot.description}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HotspotPin;
