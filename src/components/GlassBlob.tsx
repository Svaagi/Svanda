import { motion } from 'framer-motion';

import { useBlobPalette } from 'context/BlobColorContext';
import { SHAPE_SETS } from './blobPaths';
import styles from './glassBlob.module.css';

export interface BlobConfig {
  id: string;
  size: number;
  height?: number;
  top: string;
  left: string;
  /** Array of 2–4 hex/rgba color strings for the blob gradient */
  colors: string[];
  delay: number;
  duration: number;
}

const PERCENT = 100;

const PALETTE_OPACITY: Record<string, number> = {
  subtle: 0.80,
  glossy: 0.90,
  bright: 0.94,
};

interface GlassBlobProps {
  config: BlobConfig;
}

const GlassBlob = ({ config }: GlassBlobProps) => {
  const { palette, blurEnabled } = useBlobPalette();

  // Each blob gets a unique shape set — sum of all charcodes distributes IDs evenly across sets
  const setIndex = config.id.split('').reduce((sum, chr) => sum + chr.charCodeAt(0), 0) % SHAPE_SETS.length;
  const shapes = SHAPE_SETS[setIndex];
  const opacity = PALETTE_OPACITY[palette] ?? PALETTE_OPACITY.subtle;

  const width = config.size;
  const height = config.height ?? config.size;

  const gradId = `g-${config.id}`;
  const hiId = `h-${config.id}`;

  const { colors } = config;
  const lastIdx = Math.max(colors.length - 1, 1);

  const transition = {
    duration: config.duration,
    delay: config.delay,
    repeat: Infinity,
    ease: 'linear' as const,
  };

  return (
    <svg
      className={styles.blob}
      style={{
        width,
        height,
        top: config.top,
        left: config.left,
        filter: blurEnabled ? 'blur(14px)' : undefined,
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        {/* Diagonal color gradient — bottom-left → top-right, tied to shape bbox */}
        <linearGradient id={gradId} x1="0" y1="1" x2="1" y2="0">
          {colors.map((color, i) => (
            <stop
              key={i}
              offset={`${(i / lastIdx) * PERCENT}%`}
              stopColor={color}
              stopOpacity={opacity}
            />
          ))}
        </linearGradient>

        {/* Frosted glass highlight — white bloom at upper area */}
        <radialGradient id={hiId} cx="0.32" cy="0.22" r="0.54">
          <stop offset="0%" stopColor="white" stopOpacity="0.42" />
          <stop offset="60%" stopColor="white" stopOpacity="0.10" />
          <stop offset="100%" stopColor="white" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Morphing blob — shape outline changes continuously */}
      <motion.path
        fill={`url(#${gradId})`}
        d={shapes[0]}
        animate={{ d: shapes }} // eslint-disable-line id-length
        transition={transition}
      />

      {/* Glass highlight overlay — follows the same morphing silhouette */}
      <motion.path
        fill={`url(#${hiId})`}
        d={shapes[0]}
        animate={{ d: shapes }} // eslint-disable-line id-length
        transition={transition}
      />
    </svg>
  );
};

export default GlassBlob;
