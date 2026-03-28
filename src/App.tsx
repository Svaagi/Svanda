import { motion } from 'framer-motion';

import { ContactView } from 'features/contact';
import { GalleryView } from 'features/gallery';
import { HeroView } from 'features/hero';
import { HowItWorksView } from 'features/howItWorks';
import { NavigationView } from 'features/navigation';
import { ProductIntroView } from 'features/productIntro';
import { ProductShowcaseView } from 'features/productShowcase';
import { SocialProofView } from 'features/socialProof';
import { WhyVenuesView } from 'features/whyVenues';

import styles from './app.module.css';

const App = () => (
  <>
    <NavigationView />
    <main className={styles.scenePage}>
      <HeroView />

      <motion.div
        className={styles.sceneBridgeHeroToProduct}
        initial={{ opacity: 0, y: 40, rotate: 2 }}
        whileInView={{ opacity: 1, y: 0, rotate: 2 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className={styles.bridgeCard}>
          <span className={styles.bridgeCardTitle}>Songs Available</span>
          <span className={styles.bridgeCardStat}>25,000+</span>
          <span className={styles.bridgeCardSub}>
            From pop to classics — every crowd, every night
          </span>
        </div>
      </motion.div>

      <ProductIntroView />
      <HowItWorksView />
      <GalleryView />
      <SocialProofView />
      <WhyVenuesView />
      <ProductShowcaseView />
      <ContactView />
    </main>
  </>
);

export default App;
