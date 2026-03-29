import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faCreditCard,
  faMicrophone,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';

import { StepItem } from '../types';
import styles from '../howItWorks.module.css';

library.add(faSearch, faCreditCard, faMicrophone);

const STEP_PALETTES = [
  { bg: 'rgba(79, 172, 254, 0.15)', color: '#4facfe', border: 'rgba(79, 172, 254, 0.22)', numberColor: 'rgba(79, 172, 254, 0.18)' },
  { bg: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa', border: 'rgba(167, 139, 250, 0.22)', numberColor: 'rgba(167, 139, 250, 0.18)' },
  { bg: 'rgba(255, 61, 127, 0.15)', color: '#ff3d7f', border: 'rgba(255, 61, 127, 0.22)', numberColor: 'rgba(255, 61, 127, 0.18)' },
];

interface StepCardProps {
  step: StepItem;
  index: number;
}

const StepCard = ({ step, index }: StepCardProps) => {
  const palette = STEP_PALETTES[index % STEP_PALETTES.length];

  return (
    <motion.div
      className={styles.stepCard}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.8, delay: index * 0.18, ease: [0.4, 0, 0.2, 1] }}
    >
      <span className={styles.stepNumber} style={{ color: palette.numberColor }}>
        {step.stepNumber}
      </span>
      <motion.div
        className={styles.stepIconWrap}
        style={{ background: palette.bg, borderColor: palette.border }}
        whileHover={{ scale: 1.1 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <FontAwesomeIcon
          icon={['fas', step.icon as 'search']}
          className={styles.stepIcon}
          style={{ color: palette.color }}
        />
      </motion.div>
      <h3 className={styles.stepTitle}>{step.title}</h3>
      <p className={styles.stepDescription}>{step.description}</p>
    </motion.div>
  );
};

export default StepCard;
