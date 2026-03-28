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

interface StepCardProps {
  step: StepItem;
  index: number;
}

const StepCard = ({ step, index }: StepCardProps) => (
  <motion.div
    className={styles.stepCard}
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ duration: 0.7, delay: index * 0.15, ease: [0.4, 0, 0.2, 1] }}
    whileHover={{ y: -8, transition: { duration: 0.25 } }}
  >
    <span className={styles.stepNumber}>{step.stepNumber}</span>
    <div className={styles.stepIconWrap}>
      <FontAwesomeIcon
        icon={['fas', step.icon as 'search']}
        className={styles.stepIcon}
      />
    </div>
    <h3 className={styles.stepTitle}>{step.title}</h3>
    <p className={styles.stepDescription}>{step.description}</p>
  </motion.div>
);

export default StepCard;
