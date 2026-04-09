import GlobalLavaLamp from 'components/GlobalLavaLamp';
import { BenefitsView } from 'features/benefits';
import { CentralBox } from 'features/centralBox';
import { ContactView } from 'features/contact';
import { ExperienceView } from 'features/experience';
import { HeroView } from 'features/hero';
import { IntroView } from 'features/intro';
import { LemonClubView } from 'features/lemon';
import { ModesView } from 'features/modes';
import { NavigationView } from 'features/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

import styles from './app.module.css';

const CURTAIN_GONE = 0.98;

const App = () => {
  const heroDriverRef = useRef<HTMLDivElement>(null);
  const sectionsRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: heroDriverRef,
    offset: ['start start', 'end start'],
  });

  const curtainY = useTransform(scrollYProgress, [0, 1], ['0%', '-100%']);
  const curtainPointerEvents = useTransform(scrollYProgress, (progress) =>
    progress >= CURTAIN_GONE ? 'none' : 'auto',
  );

  return (
    <>
      {/*
       * Global lava lamp — position: fixed; z-index: -1.
       * Renders above the body background but below all in-flow content.
       * Transparent/semi-transparent sections let it show through.
       * Blobs run continuously; sections are layers above this single system.
       */}
      <GlobalLavaLamp />

      <NavigationView />

      {/*
       * Hero curtain — isolation: isolate keeps it as its own stacking context,
       * so the global lamp doesn't bleed through. The hero LavaField uses the
       * same blob configs from LavaLampContext, so timing is in sync with the
       * global lamp — when the curtain slides away the transition is seamless.
       */}
      <motion.main
        className={styles.scenePage}
        style={{ y: curtainY, pointerEvents: curtainPointerEvents }}
      >
        <HeroView />
      </motion.main>

      <div
        ref={heroDriverRef}
        className={styles.scrollDriver}
        style={{ height: '100vh' }}
        aria-hidden="true"
      />

      <CentralBox containerRef={sectionsRef} />

      <div ref={sectionsRef}>
        <ExperienceView />
        <IntroView />
        <ModesView />
        <BenefitsView />
        <LemonClubView />
      </div>

      <ContactView />
    </>
  );
};

export default App;
