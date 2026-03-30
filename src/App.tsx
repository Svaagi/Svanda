import { useRef } from 'react';
import { useScroll } from 'framer-motion';

import { ContactView } from 'features/contact';
import { ExperienceView } from 'features/experience';
import { HeroView } from 'features/hero';
import SectionReveal from 'features/hero/SectionReveal';
import { NavigationView } from 'features/navigation';

import styles from './app.module.css';

const App = () => {
  const heroDriverRef = useRef<HTMLDivElement>(null);

  // Scoped to the hero scroll driver so progress stays 0→1 over exactly
  // 200 vh regardless of how many normal sections are added below.
  const { scrollYProgress } = useScroll({
    target: heroDriverRef,
    offset: ['start start', 'end end'],
  });

  return (
    <>
      <NavigationView />

      {/* Fixed viewport stage — Hero curtain only. */}
      <main className={styles.scenePage}>
        {/* White backdrop: matches the dummy section so the curtain reveal is seamless. */}
        <SectionReveal zIndex={1} scrollYProgress={scrollYProgress} bgColor="#ffffff" />
        {/* Hero wipes away via curtain to expose the backdrop. */}
        <SectionReveal
          zIndex={2}
          scrollYProgress={scrollYProgress}
          scrollRange={[0, 1]}
          transition="tiltLeft"
          bgColor="#faf8f4"
        >
          <HeroView />
        </SectionReveal>
      </main>

      {/* Scroll driver for the Hero curtain (200 vh = visible + wipe). */}
      <div
        ref={heroDriverRef}
        className={styles.scrollDriver}
        style={{ height: '200vh' }}
        aria-hidden="true"
      />

      {/* Scroll-driven experience between Hero and Contact. */}
      <ExperienceView />

      {/* Contact — final section. */}
      <ContactView />
    </>
  );
};

export default App;
