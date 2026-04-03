import { library } from '@fortawesome/fontawesome-svg-core';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

import { CONTACT_EMAIL, CONTACT_PHONE, EASING_STANDARD } from 'constants';
import GlassBlob, { BlobConfig } from 'components/GlassBlob';
import { ContactForm } from './components';
import styles from './contact.module.css';

const BLOBS: BlobConfig[] = [
  {
    id: 'c-top',
    size: 620,
    height: 540,
    top: '-8%',
    left: '4%',
    color: [
      'radial-gradient(circle at 18% 22%, rgba(222,32,62,0.48) 0%, transparent 36%)',
      'radial-gradient(circle at 76% 36%, rgba(245,78,110,0.44) 0%, transparent 40%)',
      'radial-gradient(circle at 48% 78%, rgba(198,78,158,0.40) 0%, transparent 34%)',
      'rgba(220, 55, 120, 0.12)',
    ].join(', '),
    delay: 0,
    duration: 12,
    borderRadius: '76% 24% 28% 72% / 22% 76% 24% 78%',
    borderRadiusAlt: '26% 74% 74% 26% / 76% 24% 78% 22%',
  },
  {
    id: 'c-right',
    size: 580,
    height: 500,
    top: '0%',
    left: 'calc(100% - 540px)',
    color: [
      'radial-gradient(circle at 20% 24%, rgba(48,152,248,0.46) 0%, transparent 36%)',
      'radial-gradient(circle at 74% 50%, rgba(75,215,238,0.44) 0%, transparent 40%)',
      'radial-gradient(circle at 44% 80%, rgba(118,142,252,0.40) 0%, transparent 34%)',
      'rgba(80, 160, 240, 0.10)',
    ].join(', '),
    delay: 0.9,
    duration: 14,
    borderRadius: '24% 76% 72% 28% / 74% 24% 76% 26%',
    borderRadiusAlt: '74% 26% 24% 76% / 24% 76% 22% 78%',
  },
  {
    id: 'c-bottom',
    size: 560,
    height: 480,
    top: '48%',
    left: 'calc(50% - 280px)',
    color: [
      'radial-gradient(circle at 26% 28%, rgba(178,208,196,0.48) 0%, transparent 40%)',
      'radial-gradient(circle at 65% 54%, rgba(248,62,130,0.46) 0%, transparent 34%)',
      'radial-gradient(circle at 44% 80%, rgba(202,85,175,0.40) 0%, transparent 36%)',
    ].join(', '),
    delay: 0.4,
    duration: 13,
    borderRadius: '28% 72% 76% 24% / 76% 26% 74% 24%',
    borderRadiusAlt: '76% 24% 26% 74% / 24% 74% 26% 76%',
  },
];

library.add(faEnvelope, faPhone);

const ContactView = () => {
  const { t } = useTranslation();

  return (
    <motion.section className={styles.contact} id="contact">
      <div className={styles.sectionMainBg} />

      <div className={styles.background}>
        {BLOBS.map((blob) => <GlassBlob key={blob.id} config={blob} />)}
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
                    href={`mailto:${CONTACT_EMAIL}`}
                    className={styles.contactItemValue}
                  >
                    {CONTACT_EMAIL}
                  </a>
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
                    href={`tel:${CONTACT_PHONE}`}
                    className={styles.contactItemValue}
                  >
                    {CONTACT_PHONE}
                  </a>
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
