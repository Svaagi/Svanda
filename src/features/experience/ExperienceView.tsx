import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

import CentralObject from './components/CentralObject';
import MassiveMusicSection from './components/MassiveMusicSection';
import styles from './experience.module.css';

const ExperienceView = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // ── Central object rocking across panels ────────────────
  const boxRotateY = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1.0],
    [-14, 16, -10, 14, -8],
  );

  // ── Panel 1: KARAOKE / JUKEBOX  (0 → 0.25) ─────────────
  const p1Opacity = useTransform(
    scrollYProgress,
    [0, 0.04, 0.21, 0.25],
    [0, 1, 1, 0],
  );
  const p1KaraokeX = useTransform(
    scrollYProgress,
    [0, 0.07, 0.21, 0.25],
    [-280, 0, 0, 180],
  );
  const p1JukeboxX = useTransform(
    scrollYProgress,
    [0, 0.07, 0.21, 0.25],
    [280, 0, 0, -180],
  );
  const p1DescOpacity = useTransform(
    scrollYProgress,
    [0.07, 0.11, 0.20, 0.25],
    [0, 1, 1, 0],
  );

  // ── Panel 2: HOW IT WORKS  (0.25 → 0.5) ────────────────
  const p2Opacity = useTransform(
    scrollYProgress,
    [0.25, 0.29, 0.46, 0.50],
    [0, 1, 1, 0],
  );
  const p2X = useTransform(
    scrollYProgress,
    [0.25, 0.32, 0.46, 0.50],
    [320, 0, 0, -220],
  );

  // ── Panel 3: LEMON MUSIC CLUB  (0.5 → 0.75) ────────────
  const p3Opacity = useTransform(
    scrollYProgress,
    [0.50, 0.54, 0.71, 0.75],
    [0, 1, 1, 0],
  );
  const p3Scale = useTransform(scrollYProgress, [0.50, 0.58], [0.88, 1]);
  const p3LemonY = useTransform(
    scrollYProgress,
    [0.50, 0.57, 0.71, 0.75],
    [-50, 0, 0, -30],
  );
  const p3MusicY = useTransform(
    scrollYProgress,
    [0.50, 0.57, 0.71, 0.75],
    [50, 0, 0, 30],
  );

  // ── Panel 4: PASSIVE INCOME  (0.75 → 1.0) ──────────────
  const p4Opacity = useTransform(
    scrollYProgress,
    [0.75, 0.79, 0.96, 1.00],
    [0, 1, 1, 0],
  );
  const p4PassiveX = useTransform(
    scrollYProgress,
    [0.75, 0.83, 0.96, 1.00],
    [-260, 0, 0, 160],
  );
  const p4IncomeX = useTransform(
    scrollYProgress,
    [0.75, 0.83, 0.96, 1.00],
    [260, 0, 0, -160],
  );
  const p4BenefitsY = useTransform(
    scrollYProgress,
    [0.75, 0.84],
    [60, 0],
  );

  const BENEFITS = [
    'New Revenue Stream',
    'Zero Staff Needed',
    '25,000+ Songs',
    'Full Service Included',
  ];

  return (
    <>
      {/* ─── SCROLL DRIVER ────────────────────────────────── */}
      <div ref={containerRef} className={styles.stickyWrapper}>
        <div className={styles.stickyStage}>

          {/* ── Central Object (always visible, z:10) ──────── */}
          <CentralObject rotateY={boxRotateY} />

          {/* ══════════════════════════════════════════════════
              PANEL 1 — KARAOKE / JUKEBOX
              ════════════════════════════════════════════════ */}

          {/* "KARAOKE." — in front of box, z:15 */}
          <motion.div
            className={styles.p1Karaoke}
            style={{ opacity: p1Opacity, x: p1KaraokeX }}
          >
            KARAOKE.
          </motion.div>

          {/* "JUKEBOX." — behind box, z:5 */}
          <motion.div
            className={styles.p1Jukebox}
            style={{ opacity: p1Opacity, x: p1JukeboxX }}
          >
            JUKEBOX.
          </motion.div>

          {/* Small descriptor */}
          <motion.div
            className={styles.p1Desc}
            style={{ opacity: p1DescOpacity }}
          >
            <span>One device.</span>
            <span>Two experiences.</span>
          </motion.div>

          {/* ══════════════════════════════════════════════════
              PANEL 2 — HOW IT WORKS
              ════════════════════════════════════════════════ */}
          <motion.div
            className={styles.panel2}
            style={{ opacity: p2Opacity, x: p2X }}
          >
            <div className={styles.p2Step}>
              <span className={styles.p2Num}>01</span>
              <div className={styles.p2StepText}>
                <span className={styles.p2Title}>Choose a Song</span>
                <span className={styles.p2StepDesc}>
                  25,000+ tracks on the touchscreen
                </span>
              </div>
            </div>

            <div className={styles.p2Divider} />

            <div className={styles.p2Step}>
              <span className={styles.p2Num}>02</span>
              <div className={styles.p2StepText}>
                <span className={styles.p2Title}>Tap to Pay</span>
                <span className={styles.p2StepDesc}>
                  No app. No staff. 10 CZK per song.
                </span>
              </div>
            </div>

            <div className={styles.p2Divider} />

            <div className={styles.p2Step}>
              <span className={styles.p2Num}>03</span>
              <div className={styles.p2StepText}>
                <span className={styles.p2Title}>It Plays</span>
                <span className={styles.p2StepDesc}>
                  Your song queues up instantly.
                </span>
              </div>
            </div>
          </motion.div>

          {/* ══════════════════════════════════════════════════
              PANEL 3 — LEMON MUSIC CLUB
              ════════════════════════════════════════════════ */}

          {/* "LEMON" — behind box, z:5 */}
          <motion.div
            className={styles.p3Lemon}
            style={{ opacity: p3Opacity, y: p3LemonY }}
          >
            LEMON
          </motion.div>

          {/* "MUSIC CLUB" — in front of box, z:15 */}
          <motion.div
            className={styles.p3MusicClub}
            style={{ opacity: p3Opacity, y: p3MusicY }}
          >
            MUSIC CLUB
          </motion.div>

          {/* Photo + quote — z:8 */}
          <motion.div
            className={styles.p3Content}
            style={{ opacity: p3Opacity, scale: p3Scale }}
          >
            <div className={styles.p3Photo}>
              {/* REPLACE: <img src="/photos/lemon-music-club.jpg" alt="Lemon Music Club" /> */}
              <span className={styles.p3PhotoLabel}>PHOTO</span>
            </div>
            <blockquote className={styles.p3Quote}>
              "Our guests stay later and spend more."
              <cite className={styles.p3Cite}>— Lemon Music Club, Prague</cite>
            </blockquote>
          </motion.div>

          {/* ══════════════════════════════════════════════════
              PANEL 4 — PASSIVE INCOME
              ════════════════════════════════════════════════ */}

          {/* "PASSIVE" — behind box, z:5 */}
          <motion.div
            className={styles.p4Passive}
            style={{ opacity: p4Opacity, x: p4PassiveX }}
          >
            PASSIVE
          </motion.div>

          {/* "INCOME." — in front of box, z:15 */}
          <motion.div
            className={styles.p4Income}
            style={{ opacity: p4Opacity, x: p4IncomeX }}
          >
            INCOME.
          </motion.div>

          {/* Benefit list — z:12 */}
          <motion.div
            className={styles.p4Benefits}
            style={{ opacity: p4Opacity, y: p4BenefitsY }}
          >
            {BENEFITS.map((b) => (
              <div key={b} className={styles.p4BenefitItem}>
                <span className={styles.p4BenefitDot} />
                {b}
              </div>
            ))}
          </motion.div>

        </div>
      </div>

      {/* ─── MASSIVE MUSIC SECTION ───────────────────────── */}
      <MassiveMusicSection />
    </>
  );
};

export default ExperienceView;
