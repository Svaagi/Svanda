import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { scrollToSection } from 'utils';

import { NAV_ITEMS } from './constants';
import { useScrolled } from './hooks';
import styles from './navigation.module.css';

const NavigationView = () => {
  const isScrolled = useScrolled();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className={styles.navInner}>
        <button
          className={styles.logo}
          onClick={() => scrollToSection('hero')}
        >
          SVANDA
        </button>

        <ul className={styles.navLinks}>
          {NAV_ITEMS.map((item) => (
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

        <button
          className={styles.ctaButton}
          onClick={() => handleNavClick('contact')}
        >
          Book a Demo
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
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {NAV_ITEMS.map((item) => (
              <button
                key={item.sectionId}
                className={styles.mobileNavLink}
                onClick={() => handleNavClick(item.sectionId)}
              >
                {item.label}
              </button>
            ))}
            <button
              className={styles.mobileCta}
              onClick={() => handleNavClick('contact')}
            >
              Book a Demo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default NavigationView;
