import { BenefitsView } from 'features/benefits';
import { CentralBox } from 'features/centralBox';
import { ContactView } from 'features/contact';
import { ExperienceView } from 'features/experience';
import { HeroView } from 'features/hero';
import { HowItWorksView } from 'features/howItWorks';
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

  // Scoped scroll: 0 → 1 over exactly 100vh (the scroll driver below).
  const { scrollYProgress } = useScroll({
    target: heroDriverRef,
    offset: ['start start', 'end start'],
  });

  // Hero curtain slides straight up over the first 100vh of scroll.
  const curtainY = useTransform(scrollYProgress, [0, 1], ['0%', '-100%']);
  const curtainPointerEvents = useTransform(scrollYProgress, (progress) =>
    progress >= CURTAIN_GONE ? 'none' : 'auto',
  );

  return (
    <>
      <NavigationView />

      {/*
        Hero curtain — z-index 500, sits above all sections.
        Translates from y=0 to y=-100% as heroDriver scrolls.
        Sections start at 100vh (after driver) so they rise into view
        from the bottom as the curtain lifts — true parallax reveal.
      */}
      <motion.main
        className={styles.scenePage}
        style={{ y: curtainY, pointerEvents: curtainPointerEvents }}
      >
        <HeroView />
      </motion.main>

      {/* 100vh of scroll space — drives the curtain lift, nothing visible here */}
      <div
        ref={heroDriverRef}
        className={styles.scrollDriver}
        style={{ height: '100vh' }}
        aria-hidden="true"
      />

      {/* Central box — fixed, fades in/out with middle sections */}
      <CentralBox containerRef={sectionsRef} />

      {/* Sections start at doc position 100vh — revealed from below as curtain rises */}
      <div ref={sectionsRef}>
        <ExperienceView />
        <IntroView />
        <HowItWorksView />
        <ModesView />
        <BenefitsView />
        <LemonClubView />
      </div>

      <ContactView />
    </>
  );
};

export default App;
