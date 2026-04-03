import { motion } from 'framer-motion';

import styles from './glassBlob.module.css';

export interface BlobConfig {
  id: string;
  size: number;
  height?: number;
  top: string;
  left: string;
  /** Multi-spot gradient string — use several radial-gradient() layers to get color bleeding */
  color: string;
  /** Edge blur in px. Default 3 — just softens the outline, gradient handles the interior. */
  blur?: number;
  delay: number;
  duration: number;
  borderRadius?: string;
  borderRadiusAlt?: string;
}

interface GlassBlobProps {
  config: BlobConfig;
}

const GlassBlob = ({ config }: GlassBlobProps) => {
  const r0 = config.borderRadius ?? '58% 42% 52% 48% / 46% 56% 44% 54%';
  const r1 = config.borderRadiusAlt ?? '44% 56% 62% 38% / 58% 42% 56% 44%';
  const blurPx = config.blur ?? 14;

  return (
    <motion.div
      className={styles.blob}
      style={{
        width: config.size,
        height: config.height ?? config.size,
        top: config.top,
        left: config.left,
        filter: `blur(${blurPx}px)`,
      }}
      animate={{
        scale: [1, 1.028, 0.974, 1],
        x: [0, 12, -8, 0],
        y: [0, -16, 10, 0],
        borderRadius: [r0, r1, r0],
      }}
      transition={{
        duration: config.duration,
        delay: config.delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Multi-color body — caller provides several radial-gradient() spots */}
      <div className={styles.body} style={{ background: config.color }} />
      {/* Grain — matte tactile texture, same as reference image */}
      <div className={styles.grain} />
    </motion.div>
  );
};

export default GlassBlob;
