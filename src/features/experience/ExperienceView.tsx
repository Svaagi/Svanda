import { useRef } from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';

import CentralObject from './components/CentralObject';
import MassiveMusicSection from './components/MassiveMusicSection';
import {
  BOX_DRIFT_END,
  BOX_DRIFT_START,
  BOX_ROTATE_KEYS,
  BOX_ROTATE_VALUES,
  OFFSCREEN_PX,
  PANEL_RANGES,
  SCROLL_HEIGHT_VH,
} from './experience.constants';
import { useScrollProgress } from './hooks/useScrollProgress';
import styles from './experience.module.css';

// ─── Panel slide helpers ──────────────────────────────────────────────────────
//
// Panels are ALWAYS opacity:1.  They are shown/hidden purely by translating
// them on- or off-screen.  overflow:hidden on .stickyStage clips the rest.
// This is immune to "progress stuck at 0 → opacity stuck at 0" bugs.
//
// enterStart → enterEnd  : slides from OFFSCREEN to 0  (enters viewport)
// enterEnd   → exitStart : holds at 0                   (fully visible)
// exitStart  → exitEnd   : slides from 0 to -OFFSCREEN  (exits viewport)
// outside range          : clamped to OFFSCREEN / -OFFSCREEN (off-screen)
//

function usePanelSlideX(
  prog: MotionValue<number>,
  rangeIdx: number,
  fromRight: boolean,
): MotionValue<number> {
  const [enterStart, enterEnd, exitStart, exitEnd] = PANEL_RANGES[rangeIdx];
  const enterPos = fromRight ?  OFFSCREEN_PX : -OFFSCREEN_PX;
  const exitPos  = fromRight ? -OFFSCREEN_PX :  OFFSCREEN_PX;
  return useTransform(prog, [enterStart, enterEnd, exitStart, exitEnd], [enterPos, 0, 0, exitPos]);
}

function usePanelSlideY(
  prog: MotionValue<number>,
  rangeIdx: number,
  fromBottom: boolean,
): MotionValue<number> {
  const [enterStart, enterEnd, exitStart, exitEnd] = PANEL_RANGES[rangeIdx];
  const enterPos = fromBottom ?  OFFSCREEN_PX : -OFFSCREEN_PX;
  const exitPos  = fromBottom ? -OFFSCREEN_PX :  OFFSCREEN_PX;
  return useTransform(prog, [enterStart, enterEnd, exitStart, exitEnd], [enterPos, 0, 0, exitPos]);
}

// ─── Static content ───────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

const ExperienceView = () => {
  const ref      = useRef<HTMLDivElement>(null);
  const progress = useScrollProgress(ref);

  const boxY       = useTransform(progress, [0, 1], [BOX_DRIFT_START, BOX_DRIFT_END]);
  const boxRotateY = useTransform(progress, BOX_ROTATE_KEYS, BOX_ROTATE_VALUES);

  // Panels alternate direction for visual variety. Hooks called unconditionally.
  const PANEL_0 = 0;
  const PANEL_1 = 1;
  const PANEL_2 = 2;
  const PANEL_3 = 3;
  const PANEL_4 = 4;
  const PANEL_5 = 5;

  const FROM_RIGHT  = true;
  const FROM_LEFT   = false;
  const FROM_BOTTOM = true;

  const p0y = usePanelSlideY(progress, PANEL_0, FROM_BOTTOM);
  const p1x = usePanelSlideX(progress, PANEL_1, FROM_RIGHT);
  const p2x = usePanelSlideX(progress, PANEL_2, FROM_LEFT);
  const p3x = usePanelSlideX(progress, PANEL_3, FROM_RIGHT);
  const p4x = usePanelSlideX(progress, PANEL_4, FROM_LEFT);
  const p5y = usePanelSlideY(progress, PANEL_5, FROM_BOTTOM);

  return (
    <>
      {/* ── 500 vh scroll driver — stickyStage pins inside ── */}
      <div
        ref={ref}
        className={styles.experienceWrapper}
        style={{ height: `${SCROLL_HEIGHT_VH}vh` }}
      >
        <div className={styles.stickyStage}>

          {/* Central box — always at z:10, never inside a panel */}
          <CentralObject rotateY={boxRotateY} y={boxY} />

          {/* ════════════════════════════════════════════════════
              PANEL 0 · INTRO
              Slides up from bottom. Holds. Exits up.
              Big headline LEFT, descriptor RIGHT (away from box).
              ════════════════════════════════════════════════ */}
          <motion.div className={styles.panel} style={{ y: p0y }}>

            <div className={styles.abs} style={{ top: '4%', left: '2%' }}>
              <div className={styles.displayMassive}>
                JUKEBOX<br />NOVEJ<br />GENERÁCIE
              </div>
            </div>

            <div className={styles.abs} style={{ right: '6%', bottom: '18%' }}>
              <span className={styles.tag}>SVANDA — Produkt</span>
              <p className={styles.body}>
                Samoobslužný systém pre bary.<br />
                Karaoke aj jukebox v jednom zariadení.
              </p>
              <span className={styles.micro}>Praha · V prevádzke od 2023</span>
            </div>

            <div className={styles.abs} style={{ top: '8%', right: '6%' }}>
              <span className={styles.eyebrowLabel}>001 / 006</span>
            </div>

          </motion.div>

          {/* ════════════════════════════════════════════════════
              PANEL 1 · WHAT IT IS
              Slides in from right. Exits left.
              "KARAOKE." TOP-LEFT,  "JUKEBOX." BOTTOM-RIGHT,
              explanation text RIGHT-CENTER.
              ════════════════════════════════════════════════ */}
          <motion.div className={styles.panel} style={{ x: p1x }}>

            <div className={styles.abs} style={{ top: '6%', left: '-1%' }}>
              <div className={styles.displayHuge}>KARAOKE.</div>
            </div>

            <div className={styles.abs} style={{ bottom: '5%', right: '-1%' }}>
              <div className={`${styles.displayHuge} ${styles.textRight}`}>JUKEBOX.</div>
            </div>

            <div className={styles.abs}
              style={{ right: '6%', top: '50%', transform: 'translateY(-50%)' }}>
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
            </div>

            <div className={styles.abs} style={{ top: '8%', right: '6%' }}>
              <span className={styles.eyebrowLabel}>002 / 006</span>
            </div>

          </motion.div>

          {/* ════════════════════════════════════════════════════
              PANEL 2 · HOW IT WORKS
              Slides in from left. Exits right.
              Ghost numbers LEFT, step list RIGHT.
              ════════════════════════════════════════════════ */}
          <motion.div className={styles.panel} style={{ x: p2x }}>

            <div className={styles.abs}
              style={{ left: '2%', top: '50%', transform: 'translateY(-50%)' }}>
              <div className={styles.bgNumbers}>
                <span>01</span>
                <span>02</span>
                <span>03</span>
              </div>
            </div>

            <div className={styles.abs}
              style={{ right: '5%', top: '50%', transform: 'translateY(-50%)' }}>
              <div className={styles.stepsPanel}>
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
              </div>
            </div>

            <div className={styles.abs} style={{ top: '8%', right: '6%' }}>
              <span className={styles.eyebrowLabel}>003 / 006</span>
            </div>

          </motion.div>

          {/* ════════════════════════════════════════════════════
              PANEL 3 · BENEFITS
              Slides in from right. Exits left.
              "PASÍVNY" TOP-LEFT, "PRÍJEM." BOTTOM-RIGHT,
              benefit list BOTTOM-LEFT, stat TOP-RIGHT.
              ════════════════════════════════════════════════ */}
          <motion.div className={styles.panel} style={{ x: p3x }}>

            <div className={styles.abs} style={{ top: '7%', left: '-1%' }}>
              <div className={styles.displayLarge}>PASÍVNY</div>
            </div>

            <div className={styles.abs} style={{ bottom: '6%', right: '-1%' }}>
              <div className={`${styles.displayLarge} ${styles.textRight}`}>PRÍJEM.</div>
            </div>

            <div className={styles.abs} style={{ left: '6%', bottom: '20%' }}>
              <span className={styles.tag}>Výhody pre podnik</span>
              <div className={styles.benefitsList}>
                {BENEFITS.map(({ icon, text }) => (
                  <div key={text} className={styles.benefitItem}>
                    <span className={styles.benefitIcon}>{icon}</span>
                    {text}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.abs} style={{ top: '8%', right: '7%' }}>
              <span className={styles.statBig}>10</span>
              <span className={styles.statUnit}>CZK / pieseň</span>
            </div>

          </motion.div>

          {/* ════════════════════════════════════════════════════
              PANEL 4 · LEMON MUSIC CLUB
              Slides in from left. Exits right.
              "LEMON" TOP-CENTER, "MUSIC CLUB" BOTTOM-CENTER,
              venue card LEFT.
              ════════════════════════════════════════════════ */}
          <motion.div className={styles.panel} style={{ x: p4x }}>

            <div className={styles.abs}
              style={{ top: '3%', left: '50%', transform: 'translateX(-50%)' }}>
              <div className={`${styles.displayHuge} ${styles.textCenter}`}>LEMON</div>
            </div>

            <div className={styles.abs}
              style={{ bottom: '4%', left: '50%', transform: 'translateX(-50%)' }}>
              <div className={`${styles.displayLarge} ${styles.textCenter}`}>MUSIC CLUB</div>
            </div>

            <div className={styles.abs}
              style={{ left: '5%', top: '50%', transform: 'translateY(-50%)' }}>
              <div className={styles.venueCard}>
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
              </div>
            </div>

            <div className={styles.abs} style={{ top: '8%', right: '6%' }}>
              <span className={styles.eyebrowLabel}>005 / 006</span>
            </div>

          </motion.div>

          {/* ════════════════════════════════════════════════════
              PANEL 5 · PRODUCT PRESENCE
              Rises from bottom. Holds. Exits up.
              Ghost "SVANDA" CENTER-BG, feature table RIGHT,
              descriptor LEFT, tagline BOTTOM-CENTER.
              ════════════════════════════════════════════════ */}
          <motion.div className={styles.panel} style={{ y: p5y }}>

            <div className={styles.abs}
              style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
              <div className={`${styles.displayMassive} ${styles.ghost} ${styles.textCenter}`}>
                SVANDA
              </div>
            </div>

            <div className={styles.abs}
              style={{ right: '6%', top: '50%', transform: 'translateY(-50%)' }}>
              <span className={styles.tag}>Produkt</span>
              <div className={styles.featureList}>
                {FEATURES.map(({ label, val }) => (
                  <div key={label} className={styles.featureRow}>
                    <span className={styles.featureLabel}>{label}</span>
                    <span className={styles.featureVal}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.abs}
              style={{ left: '6%', top: '50%', transform: 'translateY(-50%)' }}>
              <span className={styles.tag}>Zariadenie</span>
              <p className={styles.body}>
                Elegantný dizajn.<br />
                Jednoduché použitie.<br />
                Výrazný prvok podniku.
              </p>
            </div>

            <div className={styles.abs}
              style={{ bottom: '10%', left: '50%', transform: 'translateX(-50%)' }}>
              <div className={`${styles.productTagline} ${styles.textCenter}`}>
                Jeden box. Nekonečná zábava.
              </div>
            </div>

            <div className={styles.abs} style={{ top: '8%', right: '6%' }}>
              <span className={styles.eyebrowLabel}>006 / 006</span>
            </div>

          </motion.div>

        </div>
      </div>

      <MassiveMusicSection />
    </>
  );
};

export default ExperienceView;
