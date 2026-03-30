import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { EASING_STANDARD } from 'constants';

import { useContactForm } from '../hooks';
import styles from '../contact.module.css';

const ContactForm = () => {
  const { t } = useTranslation();
  const { formData, isSubmitted, handleChange, handleSubmit } =
    useContactForm();

  return (
    <AnimatePresence mode="wait">
      {isSubmitted ? (
        <motion.div
          className={styles.successState}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: EASING_STANDARD }}
          key="success"
        >
          <div className={styles.successIcon}>✓</div>
          <h3 className={styles.successTitle}>{t('contact.form.successTitle')}</h3>
          <p className={styles.successText}>
            {t('contact.form.successText')}
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
            <div className={styles.formField}>
              <label className={styles.fieldLabel} htmlFor="venueName">
                {t('contact.form.venueName')}
              </label>
              <input
                className={styles.fieldInput}
                id="venueName"
                name="venueName"
                type="text"
                placeholder={t('contact.form.venuePlaceholder')}
                value={formData.venueName}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.fieldLabel} htmlFor="contactName">
                {t('contact.form.yourName')}
              </label>
              <input
                className={styles.fieldInput}
                id="contactName"
                name="contactName"
                type="text"
                placeholder={t('contact.form.namePlaceholder')}
                value={formData.contactName}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.fieldLabel} htmlFor="email">
                {t('contact.form.emailAddress')}
              </label>
              <input
                className={styles.fieldInput}
                id="email"
                name="email"
                type="email"
                placeholder={t('contact.form.emailPlaceholder')}
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formField}>
              <label className={styles.fieldLabel} htmlFor="phone">
                {t('contact.form.phone')}
              </label>
              <input
                className={styles.fieldInput}
                id="phone"
                name="phone"
                type="tel"
                placeholder={t('contact.form.phonePlaceholder')}
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className={styles.formField}>
            <label className={styles.fieldLabel} htmlFor="message">
              {t('contact.form.message')}
            </label>
            <textarea
              className={`${styles.fieldInput} ${styles.fieldTextarea}`}
              id="message"
              name="message"
              placeholder={t('contact.form.messagePlaceholder')}
              value={formData.message}
              onChange={handleChange}
              rows={4}
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            {t('contact.form.submit')}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
};

export default ContactForm;
