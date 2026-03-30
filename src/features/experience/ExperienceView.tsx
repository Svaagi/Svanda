import { useRef } from 'react';
import { motion, MotionValue, useScroll, useTransform } from 'framer-motion';

import CentralObject from './components/CentralObject';
import MassiveMusicSection from './components/MassiveMusicSection';
import styles from './experience.module.css';

// ─── Per-panel motion values ─────────────────────────────────────────────────
//
// Each panel occupies [start → end] of scroll progress.
// Within that range:  first 15% = fade in,  last 15% = fade out.
//
const usePanelMotion = (
  progress: MotionValue<number>,
  start: number,
  end: number,
) => {
  const span = end - start;
  const holdIn  = start + span * 0.15;
  const holdOut = end   - span * 0.15;

  return {
    opacity: useTransform(progress, [start, holdIn, holdOut, end], [0, 1, 1, 0]),
    xLeft:   useTransform(progress, [start, holdIn, holdOut, end], [-260, 0, 0,  200]),
    xRight:  useTransform(progress, [start, holdIn, holdOut, end], [ 260, 0, 0, -200]),
    yUp:     useTransform(progress, [start, holdIn, holdOut, end], [ -70, 0, 0,   50]),
    yDown:   useTransform(progress, [start, holdIn, holdOut, end], [  70, 0, 0,  -50]),
    scale:   useTransform(progress, [start, holdIn, holdOut, end], [0.88, 1, 1, 0.95]),
  };
};

const BENEFITS = [
  'Nový príjem bez námahy',
  'Funguje bez obsluhy',
  'Nonstop prevádzka',
  'Jednoduchá inštalácia',
] as const;

const FEATURES = [
  { label: 'Dizajn',     val: 'Elegantný & kompaktný' },
  { label: 'Obsluha',    val: 'Samoobslužný' },
  { label: 'Inštalácia', val: 'Plug & play' },
  { label: 'Podpora',    val: 'Full servis zadarmo' },
] as const;

const ExperienceView = () => {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end end'],
  });

  // Box slowly rocks as user scrolls through all 6 panels
  const boxRotateY = useTransform(scrollYProgress, [0, 0.33, 0.66, 1], [-16, 14, -10, 16]);

  // 6 panels, each gets 1/6 of the scroll space (= 100 vh per panel)
  const SEG = 1 / 6;
  const p1 = usePanelMotion(scrollYProgress, 0,         SEG);
  const p2 = usePanelMotion(scrollYProgress, SEG,       SEG * 2);
  const p3 = usePanelMotion(scrollYProgress, SEG * 2,   SEG * 3);
  const p4 = usePanelMotion(scrollYProgress, SEG * 3,   SEG * 4);
  const p5 = usePanelMotion(scrollYProgress, SEG * 4,   SEG * 5);
  const p6 = usePanelMotion(scrollYProgress, SEG * 5,   1.0);

  return (
    <>
      {/* 600 vh scroll driver — sticky stage pins inside */}
      <div ref={ref} className={styles.experienceWrapper}>
        <div className={styles.stickyStage}>

          {/* ════════════════════════════════════════════════════
              CENTRAL OBJECT — always centered, z: 10
              Floats + rocks via boxRotateY driven by scroll
              ════════════════════════════════════════════════ */}
          <CentralObject rotateY={boxRotateY} />

          {/* ════════════════════════════════════════════════════
              PANEL 1 — INTRO
              "JUKEBOX NOVEJ GENERÁCIE" slides from top (behind box)
              Descriptor slides from right (in front)
              ════════════════════════════════════════════════ */}

          {/* Title — BEHIND box (z:5) */}
          <div className={`${styles.abs} ${styles.zBehind}`} style={{ top: '5%', left: '-1%' }}>
            <motion.div
              className={styles.displayMassive}
              style={{ opacity: p1.opacity, y: p1.yUp }}
            >
              JUKEBOX<br />NOVEJ<br />GENERÁCIE
            </motion.div>
          </div>

          {/* Descriptor — IN FRONT of box (z:15) */}
          <div className={`${styles.abs} ${styles.zFront}`} style={{ right: '6%', bottom: '18%' }}>
            <motion.div style={{ opacity: p1.opacity, x: p1.xRight }}>
              <span className={styles.tag}>SVANDA — Produkt</span>
              <p className={styles.body}>
                Samoobslužný systém pre bary.<br />
                Karaoke aj jukebox v jednom zariadení.
              </p>
              <span className={styles.micro}>Praha · V prevádzke od 2023</span>
            </motion.div>
          </div>

          {/* ════════════════════════════════════════════════════
              PANEL 2 — WHAT IT IS
              "KARAOKE." slides from left (in front, z:15)
              "JUKEBOX." slides from right (behind, z:5)
              Side text from right
              ════════════════════════════════════════════════ */}

          {/* KARAOKE — IN FRONT */}
          <div className={`${styles.abs} ${styles.zFront}`} style={{ top: '7%', left: '-1%' }}>
            <motion.div
              className={styles.displayHuge}
              style={{ opacity: p2.opacity, x: p2.xLeft }}
            >
              KARAOKE.
            </motion.div>
          </div>

          {/* JUKEBOX — BEHIND */}
          <div className={`${styles.abs} ${styles.zBehind}`} style={{ bottom: '7%', right: '-1%' }}>
            <motion.div
              className={`${styles.displayHuge} ${styles.textRight}`}
              style={{ opacity: p2.opacity, x: p2.xRight }}
            >
              JUKEBOX.
            </motion.div>
          </div>

          {/* Side text — MID */}
          <div className={`${styles.abs} ${styles.zMid}`} style={{ right: '7%', top: '50%', transform: 'translateY(-50%)' }}>
            <motion.div style={{ opacity: p2.opacity, x: p2.xRight }}>
              <span className={styles.tag}>Čo je SVANDA</span>
              <p className={styles.body}>
                Karaoke aj jukebox v jednom stroji.<br />
                Hostia si vyberajú a platia sami.
              </p>
              <p className={styles.body} style={{ marginTop: 10 }}>
                Bez obsluhy. Bez aplikácie.<br />
                Zapneš — funguje.
              </p>
            </motion.div>
          </div>

          {/* ════════════════════════════════════════════════════
              PANEL 3 — HOW IT WORKS
              Big bg numbers "01 02 03" from left (behind, z:5)
              Step detail panel from right (front, z:15)
              ════════════════════════════════════════════════ */}

          {/* Background numbers — BEHIND */}
          <div
            className={`${styles.abs} ${styles.zBehind}`}
            style={{ left: '3%', top: '50%', transform: 'translateY(-50%)' }}
          >
            <motion.div
              className={styles.bgNumbers}
              style={{ opacity: p3.opacity, x: p3.xLeft }}
            >
              <span>01</span>
              <span>02</span>
              <span>03</span>
            </motion.div>
          </div>

          {/* Step details — IN FRONT */}
          <div
            className={`${styles.abs} ${styles.zFront}`}
            style={{ right: '5%', top: '50%', transform: 'translateY(-50%)' }}
          >
            <motion.div
              className={styles.stepsPanel}
              style={{ opacity: p3.opacity, x: p3.xRight }}
            >
              <span className={styles.tag}>Ako to funguje</span>

              <div className={styles.stepRow}>
                <span className={styles.stepNum}>01</span>
                <div>
                  <div className={styles.stepTitle}>Vyber skladbu</div>
                  <div className={styles.stepDesc}>25 000+ skladieb na dotykovej obrazovke</div>
                </div>
              </div>

              <div className={styles.stepDivider} />

              <div className={styles.stepRow}>
                <span className={styles.stepNum}>02</span>
                <div>
                  <div className={styles.stepTitle}>Zaplať priamo</div>
                  <div className={styles.stepDesc}>Bez obsluhy. Bez aplikácie. 10 CZK / pieseň.</div>
                </div>
              </div>

              <div className={styles.stepDivider} />

              <div className={styles.stepRow}>
                <span className={styles.stepNum}>03</span>
                <div>
                  <div className={styles.stepTitle}>Hudba hrá</div>
                  <div className={styles.stepDesc}>Tvoja pieseň sa spustí okamžite.</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* ════════════════════════════════════════════════════
              PANEL 4 — BENEFITS
              "PASÍVNY" from left top (behind)
              "PRÍJEM." from right bottom (front)
              List from bottom left (mid)
              ════════════════════════════════════════════════ */}

          {/* PASÍVNY — BEHIND */}
          <div className={`${styles.abs} ${styles.zBehind}`} style={{ top: '7%', left: '-1%' }}>
            <motion.div
              className={styles.displayLarge}
              style={{ opacity: p4.opacity, x: p4.xLeft }}
            >
              PASÍVNY
            </motion.div>
          </div>

          {/* PRÍJEM — IN FRONT */}
          <div className={`${styles.abs} ${styles.zFront}`} style={{ bottom: '7%', right: '-1%' }}>
            <motion.div
              className={`${styles.displayLarge} ${styles.textRight}`}
              style={{ opacity: p4.opacity, x: p4.xRight }}
            >
              PRÍJEM.
            </motion.div>
          </div>

          {/* Benefits list — MID */}
          <div className={`${styles.abs} ${styles.zMid}`} style={{ left: '6%', bottom: '20%' }}>
            <motion.div style={{ opacity: p4.opacity, y: p4.yDown }}>
              <span className={styles.tag}>Výhody pre podnik</span>
              <div className={styles.benefitsList}>
                {BENEFITS.map((b) => (
                  <div key={b} className={styles.benefitItem}>
                    <span className={styles.benefitDot} />
                    {b}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* ════════════════════════════════════════════════════
              PANEL 5 — LEMON MUSIC CLUB
              "LEMON" drops from top center (behind)
              "MUSIC CLUB" rises from bottom center (front)
              Photo + quote reveals on left (mid)
              ════════════════════════════════════════════════ */}

          {/* LEMON — BEHIND, top center */}
          <div
            className={`${styles.abs} ${styles.zBehind}`}
            style={{ top: '4%', left: '50%', transform: 'translateX(-50%)' }}
          >
            <motion.div
              className={`${styles.displayHuge} ${styles.textCenter}`}
              style={{ opacity: p5.opacity, y: p5.yUp }}
            >
              LEMON
            </motion.div>
          </div>

          {/* MUSIC CLUB — IN FRONT, bottom center */}
          <div
            className={`${styles.abs} ${styles.zFront}`}
            style={{ bottom: '5%', left: '50%', transform: 'translateX(-50%)' }}
          >
            <motion.div
              className={`${styles.displayLarge} ${styles.textCenter}`}
              style={{ opacity: p5.opacity, y: p5.yDown }}
            >
              MUSIC CLUB
            </motion.div>
          </div>

          {/* Venue card — MID, left side */}
          <div
            className={`${styles.abs} ${styles.zMid}`}
            style={{ left: '5%', top: '50%', transform: 'translateY(-50%)' }}
          >
            <motion.div
              className={styles.venueCard}
              style={{ opacity: p5.opacity, scale: p5.scale }}
            >
              <div className={styles.venuePlaceholder}>
                {/* REPLACE: <img src="/photos/lemon-music-club.jpg" alt="Lemon Music Club" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> */}
                <span className={styles.photoLabel}>PHOTO</span>
              </div>
              <span className={styles.tag}>Už v prevádzke · Praha</span>
              <blockquote className={styles.venueQuote}>
                "Hostia zostávajú dlhšie a míňajú viac."
                <cite className={styles.venueCite}>— Lemon Music Club</cite>
              </blockquote>
            </motion.div>
          </div>

          {/* ════════════════════════════════════════════════════
              PANEL 6 — PRODUCT PRESENCE
              "SVANDA" ghost text centered, scales in (behind)
              Feature list from right (front)
              Tagline from bottom center (front)
              ════════════════════════════════════════════════ */}

          {/* Ghost SVANDA — BEHIND, center */}
          <div
            className={`${styles.abs} ${styles.zBehind}`}
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
          >
            <motion.div
              className={`${styles.displayMassive} ${styles.ghost} ${styles.textCenter}`}
              style={{ opacity: p6.opacity, scale: p6.scale }}
            >
              SVANDA
            </motion.div>
          </div>

          {/* Feature list — IN FRONT, right side */}
          <div
            className={`${styles.abs} ${styles.zFront}`}
            style={{ right: '6%', top: '50%', transform: 'translateY(-50%)' }}
          >
            <motion.div style={{ opacity: p6.opacity, x: p6.xRight }}>
              <span className={styles.tag}>Produkt</span>
              <div className={styles.featureList}>
                {FEATURES.map(({ label, val }) => (
                  <div key={label} className={styles.featureRow}>
                    <span className={styles.featureLabel}>{label}</span>
                    <span className={styles.featureVal}>{val}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Tagline — IN FRONT, bottom center */}
          <div
            className={`${styles.abs} ${styles.zFront}`}
            style={{ bottom: '10%', left: '50%', transform: 'translateX(-50%)' }}
          >
            <motion.div
              className={`${styles.productTagline} ${styles.textCenter}`}
              style={{ opacity: p6.opacity, y: p6.yDown }}
            >
              Výrazný prvok každého podniku.
            </motion.div>
          </div>

        </div>
      </div>

      {/* ── Dark color-shifting section after sticky ── */}
      <MassiveMusicSection />
    </>
  );
};

export default ExperienceView;
