import { ComponentType } from 'react';
import { useScroll } from 'framer-motion';

import { ContactView } from 'features/contact';
import { GalleryView } from 'features/gallery';
import { HeroView } from 'features/hero';
import { HowItWorksView } from 'features/howItWorks';
import { NavigationView } from 'features/navigation';
import { ProductIntroView } from 'features/productIntro';
import { ProductShowcaseView } from 'features/productShowcase';
import SectionReveal, { TransitionType } from 'features/shared/SectionReveal';
import { SocialProofView } from 'features/socialProof';
import { WhyVenuesView } from 'features/whyVenues';

import styles from './app.module.css';

// ─── Section stack ────────────────────────────────────────────────────────────
// z-index DECREASES down the list → Hero is the topmost curtain.
// Each section has its own exit mechanic so no two consecutive transitions
// feel identical. The sequence of mechanics is intentional:
//
//   Hero          → slideUp      straight vertical lift, strong opening
//   ProductIntro  → slideLeft    axis change, lateral sweep
//   HowItWorks    → dropDown     reversal — section drops, next scene from above
//   Gallery       → scaleVanish  shrinks & fades — elegant dissolve
//   SocialProof   → slideRight   mirror of slideLeft, restores horizontal axis
//   WhyVenues     → diagonal     flies off to the upper-left corner
//   ProductShowcase→ rotateFly   spins, shrinks, dissolves — final dramatic exit
//   Contact       — (no exit, final destination)
// ─────────────────────────────────────────────────────────────────────────────

interface SectionConfig {
  component: ComponentType;
  bgColor: string;
  zIndex: number;
  transition?: TransitionType;
}

// Transition identities — each outgoing section has a distinct seam shape:
//
//  Hero          tiltLeft   — diagonal, right edge retreats first
//  ProductIntro  arch       — dome seam, centre recedes while sides hold
//  HowItWorks    wave       — two-cycle sinusoidal undulation
//  Gallery       tiltRight  — mirror diagonal, left edge retreats first
//  SocialProof   chevron    — inverted arch, outer corners lift away
//  WhyVenues     steps      — 3-column staircase, right column exits first
//  ProductShowcase notch    — deep V-notch, centre cuts furthest
//  Contact       (none)     — final destination, never exits
const SECTIONS: SectionConfig[] = [
  { component: HeroView,            bgColor: '#faf8f4', zIndex: 8, transition: 'tiltLeft'  },
  { component: ProductIntroView,    bgColor: '#0e1020', zIndex: 7, transition: 'arch'      },
  { component: HowItWorksView,      bgColor: '#f8f5f1', zIndex: 6, transition: 'wave'      },
  { component: GalleryView,         bgColor: '#061612', zIndex: 5, transition: 'tiltRight' },
  { component: SocialProofView,     bgColor: '#080b14', zIndex: 4, transition: 'chevron'   },
  { component: WhyVenuesView,       bgColor: '#0f0d0b', zIndex: 3, transition: 'steps'     },
  { component: ProductShowcaseView, bgColor: '#f4f0ea', zIndex: 2, transition: 'notch'     },
  { component: ContactView,         bgColor: '#1f1535', zIndex: 1                          },
];

// 8 sections → 7 curtain exits.
// At VH_PER_SLIDE = 100, each transition spans exactly one viewport height of scroll.
// Total driver height = (slides + 1) × 100 vh = 800 vh → max scrollY = 700 vh ✓
const TOTAL_SLIDES = SECTIONS.length - 1;
const VH_PER_SLIDE = 100;
const DRIVER_HEIGHT = `${(TOTAL_SLIDES + 1) * VH_PER_SLIDE}vh`;

const slideRange = (index: number): [number, number] => [
  index / TOTAL_SLIDES,
  (index + 1) / TOTAL_SLIDES,
];

const App = () => {
  const { scrollYProgress } = useScroll();

  return (
    <>
      <NavigationView />

      {/* Fixed viewport — sections are a stacked deck, none contribute flow height */}
      <main className={styles.scenePage}>
        {SECTIONS.map(({ component: Section, bgColor, zIndex, transition }, index) => {
          const isLast = index === SECTIONS.length - 1;
          return (
            <SectionReveal
              key={bgColor}
              zIndex={zIndex}
              scrollYProgress={scrollYProgress}
              scrollRange={isLast ? undefined : slideRange(index)}
              transition={transition}
              bgColor={bgColor}
            >
              <Section />
            </SectionReveal>
          );
        })}
      </main>

      {/* Invisible scroll driver — sole purpose: give the page scroll height */}
      <div className={styles.scrollDriver} style={{ height: DRIVER_HEIGHT }} aria-hidden="true" />
    </>
  );
};

export default App;
