import { AnimatePresence, motion } from 'framer-motion';

import { useContactForm } from '../hooks';
import styles from '../contact.module.css';
import { FormFieldConfig } from '../types';

const FORM_FIELDS: FormFieldConfig[] = [
  {
    name: 'venueName',
    label: 'Venue Name',
    type: 'text',
    placeholder: 'e.g. The Blue Moon Bar',
  },
  {
    name: 'contactName',
    label: 'Your Name',
    type: 'text',
    placeholder: 'Full name',
  },
  {
    name: 'email',
    label: 'Email Address',
    type: 'email',
    placeholder: 'your@email.com',
  },
  {
    name: 'phone',
    label: 'Phone (Optional)',
    type: 'tel',
    placeholder: '+420 000 000 000',
  },
];

const ContactForm = () => {
  const { formData, isSubmitted, handleChange, handleSubmit } =
    useContactForm();

  return (
    <AnimatePresence mode="wait">
      {isSubmitted ? (
        <motion.div
          className={styles.successState}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          key="success"
        >
          <div className={styles.successIcon}>✓</div>
          <h3 className={styles.successTitle}>We&apos;ll be in touch!</h3>
          <p className={styles.successText}>
            Thank you for your interest. We&apos;ll contact you within one
            business day to discuss your venue.
          </p>
        </motion.div>
      ) : (
        <motion.form
          className={styles.contactForm}
          onSubmit={handleSubmit}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          key="form"
        >
          <div className={styles.formGrid}>
            {FORM_FIELDS.map((field) => (
              <div className={styles.formField} key={field.name}>
                <label className={styles.fieldLabel} htmlFor={field.name}>
                  {field.label}
                </label>
                <input
                  className={styles.fieldInput}
                  id={field.name}
                  name={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  value={formData[field.name]}
                  onChange={handleChange}
                  required={field.name !== 'phone'}
                />
              </div>
            ))}
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel} htmlFor="message">
              Message (Optional)
            </label>
            <textarea
              className={`${styles.fieldInput} ${styles.fieldTextarea}`}
              id="message"
              name="message"
              placeholder="Tell us about your venue, number of guests, any questions..."
              value={formData.message}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Send Message
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
};

export default ContactForm;
