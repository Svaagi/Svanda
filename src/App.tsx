import { ContactView } from 'features/contact';
import { GalleryView } from 'features/gallery';
import { HeroView } from 'features/hero';
import { HowItWorksView } from 'features/howItWorks';
import { NavigationView } from 'features/navigation';
import { ProductIntroView } from 'features/productIntro';
import { ProductShowcaseView } from 'features/productShowcase';
import SectionReveal from 'features/shared/SectionReveal';
import { SocialProofView } from 'features/socialProof';
import { WhyVenuesView } from 'features/whyVenues';

import styles from './app.module.css';

const App = () => (
  <>
    <NavigationView />
    <main className={styles.scenePage}>
      <HeroView />

      <SectionReveal wipe="tiltRight" zIndex={2} marginTop="-200px" endOffset={0.6} parallaxY="10%">
        <ProductIntroView />
      </SectionReveal>

      <SectionReveal wipe="vNotch" zIndex={3} marginTop="-200px" endOffset={0.5} parallaxY="7%">
        <HowItWorksView />
      </SectionReveal>

      <SectionReveal wipe="tiltLeft" zIndex={4} marginTop="-200px" endOffset={0.65} parallaxY="12%">
        <GalleryView />
      </SectionReveal>

      <SectionReveal wipe="wave" zIndex={5} marginTop="-200px" endOffset={0.45} parallaxY="9%">
        <SocialProofView />
      </SectionReveal>

      <SectionReveal wipe="stepRight" zIndex={6} marginTop="-200px" endOffset={0.55} parallaxY="6%">
        <WhyVenuesView />
      </SectionReveal>

      <SectionReveal wipe="zigzag" zIndex={7} marginTop="-200px" endOffset={0.62} parallaxY="10%">
        <ProductShowcaseView />
      </SectionReveal>

      <SectionReveal wipe="tiltSimple" zIndex={8} marginTop="-200px" endOffset={0.48} parallaxY="7%" bgColor="#1f1535">
        <ContactView />
      </SectionReveal>
    </main>
  </>
);

export default App;
