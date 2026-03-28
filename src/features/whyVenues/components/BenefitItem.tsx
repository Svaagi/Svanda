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

library.add(
  faLayerGroup,
  faHandPointer,
  faTag,
  faArrowTrendUp,
  faMusic,
  faStar,
);

interface BenefitItemProps {
  benefit: BenefitItemType;
  index: number;
}

const BenefitItemComponent = ({ benefit, index }: BenefitItemProps) => (
  <motion.div
    className={styles.benefitItem}
    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ duration: 0.6, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
  >
    <div className={styles.benefitIconWrap}>
      <FontAwesomeIcon
        icon={['fas', benefit.icon as 'star']}
        className={styles.benefitIcon}
      />
    </div>
    <div className={styles.benefitContent}>
      <h3 className={styles.benefitTitle}>{benefit.title}</h3>
      <p className={styles.benefitDescription}>{benefit.description}</p>
    </div>
  </motion.div>
);

export default BenefitItemComponent;
