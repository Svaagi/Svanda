import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { EASING_STANDARD } from 'constants';
import { ContactMode, ContactVenueType } from '../types';
import { useContactForm } from '../hooks';
import styles from '../contact.module.css';

const MODES: { value: ContactMode; label: string }[] = [
  { value: 'karaoke', label: 'Karaoke Box' },
  { value: 'jukebox', label: 'Jukebox' },
  { value: 'both', label: 'Both' },
];

const VENUE_TYPES: { value: ContactVenueType; label: string }[] = [
  { value: 'bar', label: 'Bar / Club' },
  { value: 'event', label: 'Event' },
];

const ContactForm = () => {
  const { t } = useTranslation();
  const { formData, isSubmitted, isLoading, error, handleChange, handleSelect, handleSubmit } =
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
          {/* Mode selector */}
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>{t('contact.form.interestedIn')}</label>
            <div className={styles.toggleGroup}>
              {MODES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.toggleBtn} ${formData.mode === value ? styles.toggleBtnActive : ''}`}
                  onClick={() => handleSelect('mode', value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Venue type selector */}
          <div className={styles.formField}>
            <label className={styles.fieldLabel}>{t('contact.form.thisIsForMy')}</label>
            <div className={styles.toggleGroup}>
              {VENUE_TYPES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  className={`${styles.toggleBtn} ${formData.venueType === value ? styles.toggleBtnActive : ''}`}
                  onClick={() => handleSelect('venueType', value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

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

          {error && <p className={styles.errorText}>{error}</p>}
          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            {isLoading ? t('contact.form.submitting') : t('contact.form.submit')}
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
};

export default ContactForm;
