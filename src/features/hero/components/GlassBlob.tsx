import { motion } from 'framer-motion';

import { BlobConfig } from '../types';

interface GlassBlobProps {
  config: BlobConfig;
}

const GlassBlob = ({ config }: GlassBlobProps) => (
  <motion.div
    style={{
      position: 'absolute',
      width: config.size,
      height: config.size,
      top: config.top,
      left: config.left,
      background: config.color,
      borderRadius: config.borderRadius ?? '50%',
      filter: `blur(${config.blur}px)`,
      pointerEvents: 'none',
    }}
    animate={{
      scale: [1, 1.08, 0.96, 1],
      x: [0, 20, -15, 0],
      y: [0, -25, 15, 0],
    }}
    transition={{
      duration: config.duration,
      delay: config.delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

export default GlassBlob;
