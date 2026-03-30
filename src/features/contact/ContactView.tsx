import { library } from '@fortawesome/fontawesome-svg-core';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { CONTACT_EMAIL_PLACEHOLDER, CONTACT_PHONE_PLACEHOLDER, EASING_STANDARD } from 'constants';

import { ContactForm } from './components';
import styles from './contact.module.css';

library.add(faEnvelope, faPhone);

const ContactView = () => {
  const { t } = useTranslation();

  return (
    <motion.section className={styles.contact} id="contact">
      <div className={styles.sectionMainBg} />

      <div className={styles.background}>
        <div className={styles.bgBlobLeft} />
        <div className={styles.bgBlobRight} />
        <div className={styles.bgBlobAccent} />
      </div>

      <div className={styles.sectionInner}>
        <div className={styles.twoColumns}>
          <motion.div
            className={styles.infoColumn}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: EASING_STANDARD }}
          >
            <span className={styles.sectionTag}>{t('contact.tag')}</span>
            <h2 className={styles.sectionTitle}>
              {t('contact.title1')}{' '}
              <span className={styles.titleAccent}>{t('contact.title2')}</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              {t('contact.subtitle')}
            </p>

            <div className={styles.contactDetails}>
              <div className={styles.contactItem}>
                <div className={styles.contactIconWrap}>
                  <FontAwesomeIcon
                    icon={['fas', 'envelope']}
                    className={styles.contactIcon}
                  />
                </div>
                <div className={styles.contactItemContent}>
                  <span className={styles.contactItemLabel}>{t('contact.emailLabel')}</span>
                  <a
                    href={`mailto:${CONTACT_EMAIL_PLACEHOLDER}`}
                    className={styles.contactItemValue}
                  >
                    {CONTACT_EMAIL_PLACEHOLDER}
                  </a>
                  <span className={styles.contactItemNote}>
                    REPLACE: update with real email
                  </span>
                </div>
              </div>

              <div className={styles.contactItem}>
                <div className={styles.contactIconWrap}>
                  <FontAwesomeIcon
                    icon={['fas', 'phone']}
                    className={styles.contactIcon}
                  />
                </div>
                <div className={styles.contactItemContent}>
                  <span className={styles.contactItemLabel}>{t('contact.phoneLabel')}</span>
                  <a
                    href={`tel:${CONTACT_PHONE_PLACEHOLDER}`}
                    className={styles.contactItemValue}
                  >
                    {CONTACT_PHONE_PLACEHOLDER}
                  </a>
                  <span className={styles.contactItemNote}>
                    REPLACE: update with real phone
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.promiseBox}>
              <p className={styles.promiseText}>
                {t('contact.promise')}
              </p>
            </div>
          </motion.div>

          <motion.div
            className={styles.formColumn}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.1, ease: EASING_STANDARD }}
          >
            <div className={styles.formCard}>
              <ContactForm />
            </div>
          </motion.div>
        </div>
      </div>

      <div className={styles.footer}>
        <span className={styles.footerBrand}>SVANDA</span>
        <span className={styles.footerTagline}>
          {t('contact.footerTagline')}
        </span>
        <span className={styles.footerCopyright}>
          © {new Date().getFullYear()} SVANDA
        </span>
      </div>
    </motion.section>
  );
};

export default ContactView;
