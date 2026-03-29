import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faArrowTrendUp,
  faHandPointer,
  faLayerGroup,
  faMusic,
  faStar,
  faTag,
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

import { BenefitItem as BenefitItemType } from '../types';
import styles from '../whyVenues.module.css';

library.add(faLayerGroup, faHandPointer, faTag, faArrowTrendUp, faMusic, faStar);

const COLORS = ['#ff6b35', '#ff3d7f', '#3bd1a7', '#4facfe', '#a78bfa', '#ffbe3c'];

interface BenefitItemProps {
  benefit: BenefitItemType;
  index: number;
}

const BenefitItemComponent = ({ benefit, index }: BenefitItemProps) => {
  const color = COLORS[index % COLORS.length];
  const num = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      className={styles.benefitItem}
      style={{ '--item-color': color } as React.CSSProperties}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.55, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
    >
      <span className={styles.benefitNumber} style={{ color }}>
        {num}
      </span>
      <div className={styles.benefitContent}>
        <h3 className={styles.benefitTitle}>{benefit.title}</h3>
        <p className={styles.benefitDescription}>{benefit.description}</p>
      </div>
    </motion.div>
  );
};

export default BenefitItemComponent;
