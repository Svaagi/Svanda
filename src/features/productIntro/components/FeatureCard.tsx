import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faCompactDisc,
  faCoins,
  faHandPointer,
  faMusic,
} from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

import { FeatureCard as FeatureCardType } from '../types';
import styles from '../productIntro.module.css';

library.add(faMusic, faHandPointer, faCompactDisc, faCoins);

interface FeatureCardProps {
  card: FeatureCardType;
  index: number;
}

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: (customIndex: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: customIndex * 0.12,
      ease: [0.4, 0, 0.2, 1],
    },
  }),
};

const FeatureCardComponent = ({ card, index }: FeatureCardProps) => (
  <motion.div
    className={styles.featureCard}
    style={{ '--card-accent': card.accentColor } as React.CSSProperties}
    variants={cardVariants}
    custom={index}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, amount: 0.3 }}
    whileHover={{ y: -6, transition: { duration: 0.25 } }}
  >
    <div className={styles.featureIconWrap}>
      <FontAwesomeIcon
        icon={['fas', card.icon as 'music']}
        className={styles.featureIcon}
      />
    </div>
    <h3 className={styles.featureTitle}>{card.title}</h3>
    <p className={styles.featureDescription}>{card.description}</p>
  </motion.div>
);

export default FeatureCardComponent;
