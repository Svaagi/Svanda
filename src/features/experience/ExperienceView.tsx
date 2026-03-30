import { useRef } from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';

import CentralObject from './components/CentralObject';
import MassiveMusicSection from './components/MassiveMusicSection';
import {
  ANIM_DRIFT_OUT,
  ANIM_DRIFT_PX,
  ANIM_SLIDE_OUT,
  ANIM_SLIDE_PX,
  BOX_DRIFT_BOTTOM,
  BOX_DRIFT_TOP,
  BOX_ROTATE_KEYS,
  BOX_ROTATE_VALUES,
  PANEL_ENTER_RATIO,
  PANEL_EXIT_RATIO,
  PANEL_RANGES,
  SCROLL_HEIGHT_VH,
} from './experience.constants';
import { useScrollProgress } from './hooks/useScrollProgress';
import styles from './experience.module.css';

/** Derive per-panel motion values from a shared scroll progress MotionValue. */
function usePanelMotion(prog: MotionValue<number>, start: number, end: number) {
  const span      = end - start;
  const enterEnd  = start + span * PANEL_ENTER_RATIO;
  const exitStart = end   - span * PANEL_EXIT_RATIO;

  return {
    opacity: useTransform(prog, [start, enterEnd, exitStart, end], [0, 1, 1, 0]),
    xLeft:   useTransform(prog, [start, enterEnd, exitStart, end], [-ANIM_SLIDE_PX, 0, 0,  ANIM_SLIDE_OUT]),
    xRight:  useTransform(prog, [start, enterEnd, exitStart, end], [ ANIM_SLIDE_PX, 0, 0, -ANIM_SLIDE_OUT]),
    yUp:     useTransform(prog, [start, enterEnd, exitStart, end], [-ANIM_DRIFT_PX, 0, 0,  ANIM_DRIFT_OUT]),
    yDown:   useTransform(prog, [start, enterEnd, exitStart, end], [ ANIM_DRIFT_PX, 0, 0, -ANIM_DRIFT_OUT]),
  };
}

const BENEFITS = [
  { icon: '↗', text: 'Nový príjem bez námahy' },
  { icon: '⊘', text: 'Funguje bez obsluhy' },
  { icon: '∞', text: 'Nonstop prevádzka' },
  { icon: '⚡', text: 'Jednoduchá inštalácia' },
] as const;

const FEATURES = [
  { label: 'Dizajn',     val: 'Elegantný & kompaktný' },
  { label: 'Obsluha',    val: 'Samoobslužný' },
  { label: 'Inštalácia', val: 'Plug & play' },
  { label: 'Podpora',    val: 'Full servis zadarmo' },
] as const;

const ExperienceView = () => {
  const ref      = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref);

  /** Box drifts downward as user scrolls — creates clear "going down with scroll" feel */
  const boxY       = useTransform(progress, [0, 1], [BOX_DRIFT_TOP, BOX_DRIFT_BOTTOM]);
  const boxRotateY = useTransform(progress, BOX_ROTATE_KEYS, BOX_ROTATE_VALUES);

  /**
   * Panels use OVERLAPPING scroll ranges (see PANEL_RANGES).
   * When panel N exits, panel N+1 is already fading in — crossfade, never blank.
   * Hook calls MUST remain unconditional and in fixed order.
   */
  const panel0 = usePanelMotion(progress, PANEL_RANGES[0][0], PANEL_RANGES[0][1]);
  const panel1 = usePanelMotion(progress, PANEL_RANGES[1][0], PANEL_RANGES[1][1]);
  const panel2 = usePanelMotion(progress, PANEL_RANGES[2][0], PANEL_RANGES[2][1]);
  const panel3 = usePanelMotion(progress, PANEL_RANGES[3][0], PANEL_RANGES[3][1]);
  const panel4 = usePanelMotion(progress, PANEL_RANGES[4][0], PANEL_RANGES[4][1]);
  const panel5 = usePanelMotion(progress, PANEL_RANGES[5][0], PANEL_RANGES[5][1]);

  return (
    <>
      {/* ── scroll driver: sticky stage pins inside ─────────── */}
      <div
        ref={ref}
        className={styles.experienceWrapper}
        style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
      >
        <div className={styles.stickyStage}>

          {/* ────────────────────────────────────────────────────
              CENTRAL OBJECT — z:10, always centered
              Drifts downward via boxY as user scrolls
              Rocks via boxRotateY + floats via CentralObject animation
              ─────────────────────────────────────────────────── */}
          <CentralObject rotateY={boxRotateY} y={boxY} />

          {/* ══════════════════════════════════════════════════
              PANEL 0 · INTRO  [0.00 → 0.20]
              ── "JUKEBOX NOVEJ GENERÁCIE" rises up (BEHIND, z:5)
              ── Descriptor slides in from right (IN FRONT, z:15)
              ════════════════════════════════════════════════ */}

          <div className={`${styles.abs} ${styles.zBehind}`}
            style={{ top: '3%', left: '1%' }}>
            <motion.div
              className={styles.displayMassive}
              style={{ opacity: panel0.opacity, y: panel0.yDown }}
            >
              JUKEBOX<br />NOVEJ<br />GENERÁCIE
            </motion.div>
          </div>

          <div className={`${styles.abs} ${styles.zFront}`}
            style={{ right: '6%', bottom: '16%' }}>
            <motion.div style={{ opacity: panel0.opacity, x: panel0.xRight }}>
              <span className={styles.tag}>SVANDA — Produkt</span>
              <p className={styles.body}>
                Samoobslužný systém pre bary.<br />
                Karaoke aj jukebox v jednom zariadení.
              </p>
              <span className={styles.micro}>Praha · V prevádzke od 2023</span>
            </motion.div>
          </div>

          <div className={`${styles.abs} ${styles.zFront}`}
            style={{ top: '8%', right: '7%' }}>
            <motion.div style={{ opacity: panel0.opacity, x: panel0.xRight }}>
              <span className={styles.eyebrowLabel}>001</span>
            </motion.div>
          </div>

          {/* ══════════════════════════════════════════════════
              PANEL 1 · WHAT IT IS  [0.16 → 0.36]
              ── "KARAOKE." from left  IN FRONT (z:15)
              ── "JUKEBOX."  from right BEHIND  (z:5)
              ── Explanation from right MID (z:12)
              ════════════════════════════════════════════════ */}

          <div className={`${styles.abs} ${styles.zFront}`}
            style={{ top: '6%', left: '-1%' }}>
            <motion.div
              className={styles.displayHuge}
              style={{ opacity: panel1.opacity, x: panel1.xLeft }}
            >
              KARAOKE.
            </motion.div>
          </div>

          <div className={`${styles.abs} ${styles.zBehind}`}
            style={{ bottom: '5%', right: '-1%' }}>
            <motion.div
              className={`${styles.displayHuge} ${styles.textRight}`}
              style={{ opacity: panel1.opacity, x: panel1.xRight }}
            >
              JUKEBOX.
            </motion.div>
          </div>

          <div className={`${styles.abs} ${styles.zMid}`}
            style={{ right: '6%', top: '50%', transform: 'translateY(-50%)' }}>
            <motion.div style={{ opacity: panel1.opacity, x: panel1.xRight }}>
              <span className={styles.tag}>Čo je SVANDA</span>
              <p className={styles.body}>
                Karaoke aj jukebox v jednom stroji.<br />
                Hostia si vyberajú a platia sami.
              </p>
              <p className={styles.body} style={{ marginTop: 12 }}>
                Bez obsluhy. Bez aplikácie.<br />
                Zapneš — funguje.
              </p>
              <span className={styles.micro}>25 000+ skladieb · 10 CZK / pieseň</span>
            </motion.div>
          </div>

          {/* ══════════════════════════════════════════════════
              PANEL 2 · HOW IT WORKS  [0.32 → 0.52]
              ── "01 02 03" from left BEHIND (z:5)
              ── Step list  from right IN FRONT (z:15)
              ════════════════════════════════════════════════ */}

          <div className={`${styles.abs} ${styles.zBehind}`}
            style={{ left: '2%', top: '50%', transform: 'translateY(-50%)' }}>
            <motion.div
              className={styles.bgNumbers}
              style={{ opacity: panel2.opacity, x: panel2.xLeft }}
            >
              <span>01</span>
              <span>02</span>
              <span>03</span>
            </motion.div>
          </div>

          <div className={`${styles.abs} ${styles.zFront}`}
            style={{ right: '5%', top: '50%', transform: 'translateY(-50%)' }}>
            <motion.div
              className={styles.stepsPanel}
              style={{ opacity: panel2.opacity, x: panel2.xRight }}
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

          {/* ══════════════════════════════════════════════════
              PANEL 3 · BENEFITS  [0.48 → 0.68]
              ── "PASÍVNY" from left BEHIND  (z:5)
              ── "PRÍJEM."  from right IN FRONT (z:15)
              ── Benefit list bottom-left MID (z:12)
              ── Stat counter top-right IN FRONT (z:15)
              ════════════════════════════════════════════════ */}

          <div className={`${styles.abs} ${styles.zBehind}`}
            style={{ top: '7%', left: '-1%' }}>
            <motion.div
              className={styles.displayLarge}
              style={{ opacity: panel3.opacity, x: panel3.xLeft }}
            >
              PASÍVNY
            </motion.div>
          </div>

          <div className={`${styles.abs} ${styles.zFront}`}
            style={{ bottom: '6%', right: '-1%' }}>
            <motion.div
              className={`${styles.displayLarge} ${styles.textRight}`}
              style={{ opacity: panel3.opacity, x: panel3.xRight }}
            >
              PRÍJEM.
            </motion.div>
          </div>

          <div className={`${styles.abs} ${styles.zMid}`}
            style={{ left: '6%', bottom: '20%' }}>
            <motion.div style={{ opacity: panel3.opacity, y: panel3.yDown }}>
              <span className={styles.tag}>Výhody pre podnik</span>
              <div className={styles.benefitsList}>
                {BENEFITS.map(({ icon, text }) => (
                  <div key={text} className={styles.benefitItem}>
                    <span className={styles.benefitIcon}>{icon}</span>
                    {text}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <div className={`${styles.abs} ${styles.zFront}`}
            style={{ top: '8%', right: '7%' }}>
            <motion.div style={{ opacity: panel3.opacity, x: panel3.xRight }}>
              <span className={styles.statBig}>10</span>
              <span className={styles.statUnit}>CZK / pieseň</span>
            </motion.div>
          </div>

          {/* ══════════════════════════════════════════════════
              PANEL 4 · LEMON MUSIC CLUB  [0.64 → 0.84]
              ── "LEMON"      drops from top center BEHIND (z:5)
              ── "MUSIC CLUB" rises from bottom center IN FRONT (z:15)
              ── Venue card left MID (z:12)
              ════════════════════════════════════════════════ */}

          <div className={`${styles.abs} ${styles.zBehind}`}
            style={{ top: '3%', left: '50%', transform: 'translateX(-50%)' }}>
            <motion.div
              className={`${styles.displayHuge} ${styles.textCenter}`}
              style={{ opacity: panel4.opacity, y: panel4.yUp }}
            >
              LEMON
            </motion.div>
          </div>

          <div className={`${styles.abs} ${styles.zFront}`}
            style={{ bottom: '4%', left: '50%', transform: 'translateX(-50%)' }}>
            <motion.div
              className={`${styles.displayLarge} ${styles.textCenter}`}
              style={{ opacity: panel4.opacity, y: panel4.yDown }}
            >
              MUSIC CLUB
            </motion.div>
          </div>

          <div className={`${styles.abs} ${styles.zMid}`}
            style={{ left: '5%', top: '50%', transform: 'translateY(-50%)' }}>
            <motion.div
              className={styles.venueCard}
              style={{ opacity: panel4.opacity, x: panel4.xLeft }}
            >
              <div className={styles.venuePlaceholder}>
                {/* REPLACE: <img src="/photos/lemon-music-club.jpg" alt="Lemon Music Club"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> */}
                <span className={styles.photoLabel}>PHOTO</span>
              </div>
              <div className={styles.venueInfo}>
                <span className={styles.tag}>Už v prevádzke · Praha</span>
                <blockquote className={styles.venueQuote}>
                  "Hostia zostávajú dlhšie a míňajú viac. SVANDA sa stará sama."
                  <cite className={styles.venueCite}>— Lemon Music Club</cite>
                </blockquote>
              </div>
            </motion.div>
          </div>

          {/* ══════════════════════════════════════════════════
              PANEL 5 · PRODUCT  [0.80 → 1.00]
              ── Ghost "SVANDA" scales in center BEHIND (z:5)
              ── Feature table from right IN FRONT (z:15)
              ── Left descriptor  IN FRONT (z:15)
              ── Tagline bottom center IN FRONT (z:15)
              ════════════════════════════════════════════════ */}

          <div className={`${styles.abs} ${styles.zBehind}`}
            style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <motion.div
              className={`${styles.displayMassive} ${styles.ghost} ${styles.textCenter}`}
              style={{ opacity: panel5.opacity }}
            >
              SVANDA
            </motion.div>
          </div>

          <div className={`${styles.abs} ${styles.zFront}`}
            style={{ right: '6%', top: '50%', transform: 'translateY(-50%)' }}>
            <motion.div style={{ opacity: panel5.opacity, x: panel5.xRight }}>
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

          <div className={`${styles.abs} ${styles.zFront}`}
            style={{ left: '6%', top: '50%', transform: 'translateY(-50%)' }}>
            <motion.div style={{ opacity: panel5.opacity, x: panel5.xLeft }}>
              <span className={styles.tag}>Zariadenie</span>
              <p className={styles.body}>
                Elegantný dizajn.<br />
                Jednoduché použitie.<br />
                Výrazný prvok podniku.
              </p>
            </motion.div>
          </div>

          <div className={`${styles.abs} ${styles.zFront}`}
            style={{ bottom: '10%', left: '50%', transform: 'translateX(-50%)' }}>
            <motion.div
              className={`${styles.productTagline} ${styles.textCenter}`}
              style={{ opacity: panel5.opacity, y: panel5.yDown }}
            >
              Jeden box. Nekonečná zábava.
            </motion.div>
          </div>

        </div>
      </div>

      {/* ── Dark animated section immediately follows ─────── */}
      <MassiveMusicSection />
    </>
  );
};

export default ExperienceView;
