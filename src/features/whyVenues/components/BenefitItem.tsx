import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowTrendUp,
  faHandPointer,
  faLayerGroup,
  faMusic,
  faStar,
  faTag,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';

import { BenefitItem as BenefitItemType } from '../types';
import styles from '../whyVenues.module.css';

library.add(faLayerGroup, faHandPointer, faTag, faArrowTrendUp, faMusic, faStar);

const ICON_PALETTES = [
  { bg: 'rgba(255, 107, 53, 0.15)', color: '#ff6b35', border: 'rgba(255, 107, 53, 0.2)' },
  { bg: 'rgba(255, 61, 127, 0.15)', color: '#ff3d7f', border: 'rgba(255, 61, 127, 0.2)' },
  { bg: 'rgba(59, 209, 167, 0.15)', color: '#3bd1a7', border: 'rgba(59, 209, 167, 0.2)' },
  { bg: 'rgba(79, 172, 254, 0.15)', color: '#4facfe', border: 'rgba(79, 172, 254, 0.2)' },
  { bg: 'rgba(167, 139, 250, 0.15)', color: '#a78bfa', border: 'rgba(167, 139, 250, 0.2)' },
  { bg: 'rgba(255, 190, 60, 0.15)', color: '#ffbe3c', border: 'rgba(255, 190, 60, 0.2)' },
];

interface BenefitItemProps {
  benefit: BenefitItemType;
  index: number;
}

const BenefitItemComponent = ({ benefit, index }: BenefitItemProps) => {
  const palette = ICON_PALETTES[index % ICON_PALETTES.length];

  return (
    <motion.div
      className={styles.benefitItem}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div
        className={styles.benefitIconWrap}
        style={{ background: palette.bg, borderColor: palette.border }}
        whileHover={{ scale: 1.08, rotate: 4 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        <FontAwesomeIcon
          icon={['fas', benefit.icon as 'star']}
          className={styles.benefitIcon}
          style={{ color: palette.color }}
        />
      </motion.div>
      <div className={styles.benefitContent}>
        <h3 className={styles.benefitTitle}>{benefit.title}</h3>
        <p className={styles.benefitDescription}>{benefit.description}</p>
      </div>
    </motion.div>
  );
};

export default BenefitItemComponent;
