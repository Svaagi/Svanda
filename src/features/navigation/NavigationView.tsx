import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { EASING_STANDARD } from 'constants';
import { scrollToSection } from 'utils';

import { LANGUAGES } from './constants';
import { useScrolled } from './hooks';
import styles from './navigation.module.css';

const NavigationView = () => {
  const { t, i18n } = useTranslation();
  const isScrolled = useScrolled();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { label: t('nav.howItWorks'), sectionId: 'how-it-works' },
{ label: t('nav.modes'), sectionId: 'modes' },
    { label: t('nav.benefits'), sectionId: 'benefits' },
    { label: t('nav.contact'), sectionId: 'contact' },
  ];

  const handleNavClick = (sectionId: string) => {
    scrollToSection(sectionId);
    setIsMobileOpen(false);
  };

  const handleMobileToggle = () => setIsMobileOpen((previous) => !previous);

  return (
    <motion.nav
      className={`${styles.nav} ${isScrolled ? styles.navScrolled : ''}`}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: EASING_STANDARD }}
    >
      <div className={styles.navInner}>
        <button
          className={styles.logo}
          onClick={() => scrollToSection('hero')}
        >
          SVANDA
        </button>

        <ul className={styles.navLinks}>
          {navItems.map((item) => (
            <li key={item.sectionId}>
              <button
                className={styles.navLink}
                onClick={() => handleNavClick(item.sectionId)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className={styles.langSwitcher}>
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              className={`${styles.langButton} ${i18n.language === lang.code ? styles.langButtonActive : ''}`}
              onClick={() => i18n.changeLanguage(lang.code)}
            >
              {lang.label}
            </button>
          ))}
        </div>

        <button
          className={styles.ctaButton}
          onClick={() => handleNavClick('contact')}
        >
          {t('nav.bookDemo')}
        </button>

        <button
          className={styles.mobileToggle}
          onClick={handleMobileToggle}
          aria-label="Toggle menu"
        >
          <span className={`${styles.hamburgerLine} ${isMobileOpen ? styles.hamburgerLineOpen1 : ''}`} />
          <span className={`${styles.hamburgerLine} ${isMobileOpen ? styles.hamburgerLineOpen2 : ''}`} />
          <span className={`${styles.hamburgerLine} ${isMobileOpen ? styles.hamburgerLineOpen3 : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: EASING_STANDARD }}
          >
            {navItems.map((item) => (
              <button
                key={item.sectionId}
                className={styles.mobileNavLink}
                onClick={() => handleNavClick(item.sectionId)}
              >
                {item.label}
              </button>
            ))}
            <div className={styles.mobileLangSwitcher}>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  className={`${styles.langButton} ${i18n.language === lang.code ? styles.langButtonActive : ''}`}
                  onClick={() => i18n.changeLanguage(lang.code)}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <button
              className={styles.mobileCta}
              onClick={() => handleNavClick('contact')}
            >
              {t('nav.bookDemo')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavigationView;
