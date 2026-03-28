import { library } from '@fortawesome/fontawesome-svg-core';
import { faEnvelope, faPhone } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

import { CONTACT_EMAIL_PLACEHOLDER, CONTACT_PHONE_PLACEHOLDER } from 'constants';

import { ContactForm } from './components';
import styles from './contact.module.css';

library.add(faEnvelope, faPhone);

const ContactView = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // ── Plane 1: background (deepest, slowest) ────────────────────────────────
  const bgY = useTransform(scrollYProgress, [0, 1], ['-18%', '18%']);

  // ── Plane 2: decorative blobs (mid depth) ─────────────────────────────────
  const blobsY = useTransform(scrollYProgress, [0, 1], ['-30%', '30%']);

  return (
    <section className={styles.contact} id="contact" ref={sectionRef}>
      {/* Plane 1 */}
      <motion.div className={styles.sectionMainBg} style={{ y: bgY }} />

      {/* Plane 2 */}
      <motion.div className={styles.background} style={{ y: blobsY }}>
        <div className={styles.bgBlobLeft} />
        <div className={styles.bgBlobRight} />
      </motion.div>

      <div className={styles.sectionInner}>
        <div className={styles.twoColumns}>
          <motion.div
            className={styles.infoColumn}
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
          >
            <span className={styles.sectionTag}>Get in Touch</span>
            <h2 className={styles.sectionTitle}>
              Ready to{' '}
              <span className={styles.titleAccent}>Elevate Your Venue?</span>
            </h2>
            <p className={styles.sectionSubtitle}>
              Fill in the form and we&apos;ll get back to you within one
              business day. We&apos;ll handle the full setup — you just enjoy
              the results.
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
                  <span className={styles.contactItemLabel}>Email</span>
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
                  <span className={styles.contactItemLabel}>Phone</span>
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
                We respond to every inquiry. If you&apos;re a bar or venue
                owner curious about SVANDA — we want to hear from you.
              </p>
            </div>
          </motion.div>

          <motion.div
            className={styles.formColumn}
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
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
          The Modern Music Machine for Venues.
        </span>
        <span className={styles.footerCopyright}>
          © {new Date().getFullYear()} SVANDA
        </span>
      </div>
    </section>
  );
};

export default ContactView;
