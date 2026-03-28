import { library } from '@fortawesome/fontawesome-svg-core';
import { faQuoteLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';

import { TestimonialData } from '../types';
import styles from '../socialProof.module.css';

library.add(faQuoteLeft);

interface TestimonialCardProps {
  testimonial: TestimonialData;
}

const TestimonialCard = ({ testimonial }: TestimonialCardProps) => (
  <motion.div
    className={styles.testimonialCard}
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.4 }}
    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
  >
    <FontAwesomeIcon
      icon={['fas', 'quote-left']}
      className={styles.quoteIcon}
    />
    <blockquote className={styles.quoteText}>{testimonial.quote}</blockquote>
    <div className={styles.authorRow}>
      <div className={styles.authorAvatar}>
        <div className={styles.avatarPlaceholder}>
          <span className={styles.avatarInitials}>
            {testimonial.authorName
              .split(' ')
              .map((word) => word[0])
              .join('')}
          </span>
        </div>
        <p className={styles.avatarLabel}>
          REPLACE: {testimonial.photoPath}
        </p>
      </div>
      <div className={styles.authorInfo}>
        <span className={styles.authorName}>{testimonial.authorName}</span>
        <span className={styles.authorRole}>
          {testimonial.authorRole}, {testimonial.venueName}
        </span>
      </div>
    </div>
  </motion.div>
);

export default TestimonialCard;
